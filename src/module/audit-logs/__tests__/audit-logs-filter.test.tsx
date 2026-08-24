import { renderWithProviders } from "@/tests/utils/mock-providers";
import { mockGet } from "@/tests/utils/mock-api-client";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { AuditLogsPage } from "@/module/audit-logs/templates/audit-logs-page";

vi.mock("@/module/profile/hooks/useProfile", () => ({
	useProfileAPI: () => ({
		useGetUserData: () => ({
			data: { roles: "super-admin", permissions: [] },
			isLoading: false,
			isError: false,
		}),
	}),
}));

const emptyResponse = {
	data: {
		success: true,
		message: "OK",
		data: {
			data: [],
			pagination: {
				currentPage: 1,
				pageSize: 10,
				totalCount: 0,
				totalPages: 0,
				hasNextPage: false,
				hasPreviousPage: false,
				nextPage: null,
				previousPage: null,
			},
		},
	},
};

describe("AuditLogsPage filters", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGet.mockResolvedValue(emptyResponse);
	});

	it("sends category param when category filter changes", async () => {
		renderWithProviders(<AuditLogsPage />);

		await waitFor(() => {
			expect(mockGet).toHaveBeenCalled();
		});

		mockGet.mockClear();

		const categorySelect = screen.getByTestId("option-authentication").closest("select")!;
		fireEvent.change(categorySelect, { target: { value: "authentication" } });

		await waitFor(() => {
			expect(mockGet).toHaveBeenCalledWith(
				"/super-admin/audit-logs",
				expect.objectContaining({
					params: expect.objectContaining({
						category: "authentication",
						page: 1,
					}),
				})
			);
		});
	});

	it("resets page to 1 when action filter changes", async () => {
		renderWithProviders(<AuditLogsPage />);

		await waitFor(() => {
			expect(mockGet).toHaveBeenCalled();
		});

		mockGet.mockClear();

		const actionInput = screen.getByPlaceholderText("e.g. user.login.success");
		fireEvent.change(actionInput, { target: { value: "user.login" } });

		await waitFor(() => {
			expect(mockGet).toHaveBeenCalledWith(
				"/super-admin/audit-logs",
				expect.objectContaining({
					params: expect.objectContaining({
						action: "user.login",
						page: 1,
					}),
				})
			);
		});
	});
});
