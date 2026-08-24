import { renderWithProviders } from "@/tests/utils/mock-providers";
import { mockGet } from "@/tests/utils/mock-api-client";
import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { AuditLogsPage } from "@/module/audit-logs/templates/audit-logs-page";

vi.mock("@/module/profile/hooks/useProfile", () => ({
	useProfileAPI: () => ({
		useGetUserData: () => ({
			data: { roles: "admin", permissions: ["audit-logs:view"] },
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

describe("AuditLogsPage (admin role)", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGet.mockResolvedValue(emptyResponse);
	});

	it("calls admin endpoint, not super-admin", async () => {
		renderWithProviders(<AuditLogsPage />);

		await waitFor(() => {
			expect(mockGet).toHaveBeenCalledWith(
				"/admin/audit-logs",
				expect.objectContaining({
					params: expect.objectContaining({ page: 1 }),
				})
			);
		});

		expect(mockGet).not.toHaveBeenCalledWith("/super-admin/audit-logs", expect.anything());
	});

	it("shows Actor Email label instead of Actor Search", async () => {
		renderWithProviders(<AuditLogsPage />);

		await waitFor(() => {
			expect(mockGet).toHaveBeenCalled();
		});

		expect(screen.getByText("Actor Email")).toBeInTheDocument();
		expect(screen.queryByText("Actor Search")).not.toBeInTheDocument();
	});

	it("does not send search param on admin endpoint", async () => {
		renderWithProviders(<AuditLogsPage />);

		await waitFor(() => {
			expect(mockGet).toHaveBeenCalled();
		});

		const callArgs = mockGet.mock.calls[0];
		const params = callArgs?.[1]?.params;
		expect(params?.search).toBeUndefined();
	});
});
