import { renderWithProviders } from "@/tests/utils/mock-providers";
import { mockGet } from "@/tests/utils/mock-api-client";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { AuditLogsPage } from "@/module/audit-logs/templates/audit-logs-page";
import { triggerDownload } from "@/module/audit-logs/utils/trigger-download";
import { ERROR_CODES } from "@/lib/constants/error-codes";

vi.mock("@/module/audit-logs/utils/trigger-download", () => ({
	triggerDownload: vi.fn(),
}));

vi.mock("@/module/profile/hooks/useProfile", () => ({
	useProfileAPI: () => ({
		useGetUserData: () => ({
			data: { roles: "admin", permissions: ["audit-logs:view"] },
			isLoading: false,
			isError: false,
		}),
	}),
}));

const listResponse = {
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

const makeExportResponse = (overrides = {}) => ({
	data: {
		success: true,
		message: "OK",
		data: {
			url: "https://s3.example.com/exports/audit.json?sig=abc",
			key: "exports/audit.json",
			format: "json",
			rowCount: 12,
			truncated: false,
			...overrides,
		},
	},
});

const EXPORT_ENDPOINT = "/admin/audit-logs/export";

const isExportUrl = (url: unknown) => String(url).endsWith("/export");

const getExportCall = () => mockGet.mock.calls.find((c) => isExportUrl(c[0]));

const clickExport = () => fireEvent.click(screen.getByRole("button", { name: /export/i }));

describe("AuditLogsPage export", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGet.mockImplementation((url: string) =>
			Promise.resolve(isExportUrl(url) ? makeExportResponse() : listResponse)
		);
	});

	it("calls the admin export endpoint with format and without pagination/search params", async () => {
		renderWithProviders(<AuditLogsPage />);
		await waitFor(() => expect(mockGet).toHaveBeenCalled());

		clickExport();

		await waitFor(() => expect(getExportCall()).toBeTruthy());
		const exportCall = getExportCall()!;
		const config = exportCall[1];
		expect(exportCall[0]).toBe(EXPORT_ENDPOINT);
		expect(config.params.format).toBe("json");
		expect(config.params).not.toHaveProperty("page");
		expect(config.params).not.toHaveProperty("pageSize");
		expect(config.params.search).toBeUndefined();
		expect(config.params).not.toHaveProperty("companyRef");
	});

	it("triggers a download with the presigned url on success", async () => {
		renderWithProviders(<AuditLogsPage />);
		await waitFor(() => expect(mockGet).toHaveBeenCalled());

		clickExport();

		await waitFor(() =>
			expect(triggerDownload).toHaveBeenCalledWith("https://s3.example.com/exports/audit.json?sig=abc")
		);
	});

	it("sends csv format when the format select is changed to CSV", async () => {
		renderWithProviders(<AuditLogsPage />);
		await waitFor(() => expect(mockGet).toHaveBeenCalled());

		const formatSelect = screen.getByTestId("option-csv").closest("select")!;
		fireEvent.change(formatSelect, { target: { value: "csv" } });

		clickExport();

		await waitFor(() => expect(getExportCall()).toBeTruthy());
		expect(getExportCall()![1].params.format).toBe("csv");
	});

	it("shows a truncation notice when the export is capped at 5000 rows", async () => {
		mockGet.mockImplementation((url: string) =>
			Promise.resolve(isExportUrl(url) ? makeExportResponse({ truncated: true }) : listResponse)
		);
		renderWithProviders(<AuditLogsPage />);
		await waitFor(() => expect(mockGet).toHaveBeenCalled());

		clickExport();

		await waitFor(() => expect(screen.getByText(/first 5000 rows/i)).toBeInTheDocument());
		expect(triggerDownload).toHaveBeenCalled();
	});

	it("shows a rate-limit notice and skips download on 429", async () => {
		mockGet.mockImplementation((url: string) => {
			if (isExportUrl(url)) {
				return Promise.reject({
					isAxiosError: true,
					response: { status: 429, data: { messageCode: ERROR_CODES.RATE_LIMIT_EXCEEDED } },
				});
			}
			return Promise.resolve(listResponse);
		});
		renderWithProviders(<AuditLogsPage />);
		await waitFor(() => expect(mockGet).toHaveBeenCalled());

		clickExport();

		await waitFor(() => expect(screen.getByText(/rate limit/i)).toBeInTheDocument());
		expect(triggerDownload).not.toHaveBeenCalled();
	});

	it("shows an error notice and skips download when the response has no url", async () => {
		mockGet.mockImplementation((url: string) =>
			Promise.resolve(isExportUrl(url) ? makeExportResponse({ url: "" }) : listResponse)
		);
		renderWithProviders(<AuditLogsPage />);
		await waitFor(() => expect(mockGet).toHaveBeenCalled());

		clickExport();

		await waitFor(() => expect(screen.getByText(/export failed/i)).toBeInTheDocument());
		expect(triggerDownload).not.toHaveBeenCalled();
	});

	it("shows a generic error notice on server failure", async () => {
		mockGet.mockImplementation((url: string) => {
			if (isExportUrl(url)) {
				return Promise.reject({ response: { status: 500, data: {} } });
			}
			return Promise.resolve(listResponse);
		});
		renderWithProviders(<AuditLogsPage />);
		await waitFor(() => expect(mockGet).toHaveBeenCalled());

		clickExport();

		await waitFor(() => expect(screen.getByText(/export failed/i)).toBeInTheDocument());
		expect(triggerDownload).not.toHaveBeenCalled();
	});
});
