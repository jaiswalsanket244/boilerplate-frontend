import { renderWithProviders } from "@/tests/utils/mock-providers";
import { mockGet } from "@/tests/utils/mock-api-client";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { AuditLogsPage } from "@/module/audit-logs/templates/audit-logs-page";
import { ERROR_CODES } from "@/lib/constants/error-codes";

let mockRole = "super-admin";

vi.mock("@/module/profile/hooks/useProfile", () => ({
	useProfileAPI: () => ({
		useGetUserData: () => ({
			data: { roles: mockRole, permissions: ["audit-logs:view", "audit-logs:manage"] },
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

const VALID_COMPANY_REF = "abcdef0123456789abcdef01";

const makeVerifyResponse = (overrides = {}) => ({
	data: {
		success: true,
		message: "Chain verification completed",
		data: {
			companyRef: VALID_COMPANY_REF,
			totalEntries: 42,
			hotEntries: 40,
			coldEntries: 2,
			coldTier: true,
			breaksFound: 0,
			breaks: [],
			firstEntry: "2026-01-01T00:00:00.000Z",
			lastEntry: "2026-06-04T15:32:00.000Z",
			verifiedAt: "2026-06-04T15:35:22.123Z",
			status: "clean",
			...overrides,
		},
	},
});

const isVerifyUrl = (url: unknown) => String(url).includes("/chain/verify");

const getVerifyCall = () => mockGet.mock.calls.find((c) => isVerifyUrl(c[0]));

const openDialog = () => fireEvent.click(screen.getByRole("button", { name: /verify chain/i }));

const typeRef = (value: string) => fireEvent.change(screen.getByLabelText("Company reference"), { target: { value } });

const runVerify = () => fireEvent.click(screen.getByRole("button", { name: /run verify/i }));

const renderPage = async () => {
	renderWithProviders(<AuditLogsPage />);
	await waitFor(() => expect(mockGet).toHaveBeenCalled());
};

describe("AuditLogsPage chain verify", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockRole = "super-admin";
		mockGet.mockImplementation((url: string) =>
			Promise.resolve(isVerifyUrl(url) ? makeVerifyResponse() : listResponse)
		);
	});

	it("does not render the verify trigger for admin users", async () => {
		mockRole = "admin";
		await renderPage();

		expect(screen.queryByRole("button", { name: /verify chain/i })).not.toBeInTheDocument();
	});

	it("renders the verify trigger for super-admin and opens the dialog", async () => {
		await renderPage();

		openDialog();

		expect(screen.getByTestId("dialog")).toBeInTheDocument();
		expect(screen.getByLabelText("Company reference")).toBeInTheDocument();
	});

	it("blocks an invalid company ref with a validation message and no API call", async () => {
		await renderPage();

		openDialog();
		typeRef("not-a-valid-ref");
		runVerify();

		expect(screen.getByText(/enter a valid company id/i)).toBeInTheDocument();
		expect(getVerifyCall()).toBeUndefined();
	});

	it("calls the verify endpoint with companyRef and renders a clean report", async () => {
		await renderPage();

		openDialog();
		typeRef(VALID_COMPANY_REF);
		runVerify();

		await waitFor(() => expect(getVerifyCall()).toBeTruthy());
		const verifyCall = getVerifyCall()!;
		expect(verifyCall[0]).toBe("/super-admin/audit-logs/chain/verify");
		expect(verifyCall[1].params).toEqual({ companyRef: VALID_COMPANY_REF });

		await waitFor(() => expect(screen.getByText("clean")).toBeInTheDocument());
		expect(screen.getByText("42")).toBeInTheDocument();
		expect(screen.getByText("40")).toBeInTheDocument();
		expect(screen.getByText("2")).toBeInTheDocument();
		expect(screen.getByText(/hot \+ cold tiers/i)).toBeInTheDocument();
		expect(screen.getByText(/verified at/i)).toBeInTheDocument();
	});

	it("accepts a SYSTEM subsystem ref picked from the dropdown", async () => {
		await renderPage();

		openDialog();
		const systemSelect = screen.getByTestId("option-cron").closest("select")!;
		fireEvent.change(systemSelect, { target: { value: "cron" } });
		runVerify();

		await waitFor(() => expect(getVerifyCall()).toBeTruthy());
		expect(getVerifyCall()![1].params).toEqual({ companyRef: "SYSTEM:cron" });
	});

	it("renders a tampered report with the breaks table", async () => {
		mockGet.mockImplementation((url: string) =>
			Promise.resolve(
				isVerifyUrl(url)
					? makeVerifyResponse({
							status: "tampered",
							breaksFound: 1,
							breaks: [
								{
									entryId: "665f1f77bcf86cd799439011",
									position: 7,
									expected: "expected-sig-value",
									actual: "actual-sig-value",
									tier: "hot",
									type: "signature",
								},
							],
						})
					: listResponse
			)
		);
		await renderPage();

		openDialog();
		typeRef(VALID_COMPANY_REF);
		runVerify();

		await waitFor(() => expect(screen.getByText("tampered")).toBeInTheDocument());
		expect(screen.getByText("665f1f77bcf86cd799439011")).toBeInTheDocument();
		expect(screen.getByText("signature")).toBeInTheDocument();
		expect(screen.getByText("hot")).toBeInTheDocument();
		expect(screen.getByText("7")).toBeInTheDocument();
	});

	it("renders an empty chain as clean with an empty-chain line and hot-only tier label", async () => {
		mockGet.mockImplementation((url: string) =>
			Promise.resolve(
				isVerifyUrl(url)
					? makeVerifyResponse({
							totalEntries: 0,
							hotEntries: 0,
							coldEntries: 0,
							coldTier: false,
							firstEntry: null,
							lastEntry: null,
						})
					: listResponse
			)
		);
		await renderPage();

		openDialog();
		typeRef(VALID_COMPANY_REF);
		runVerify();

		await waitFor(() => expect(screen.getByText("clean")).toBeInTheDocument());
		expect(screen.getByText(/chain empty and clean/i)).toBeInTheDocument();
		expect(screen.getByText(/hot tier only/i)).toBeInTheDocument();
	});

	it("renders retention lag, duplicates and anchor notes as informational", async () => {
		mockGet.mockImplementation((url: string) =>
			Promise.resolve(
				isVerifyUrl(url)
					? makeVerifyResponse({
							anchorUnverified: true,
							retentionLag: {
								count: 3,
								oldestTimestamp: "2026-02-01T00:00:00.000Z",
								newestTimestamp: "2026-02-03T00:00:00.000Z",
							},
							duplicatesSkipped: 2,
						})
					: listResponse
			)
		);
		await renderPage();

		openDialog();
		typeRef(VALID_COMPANY_REF);
		runVerify();

		await waitFor(() => expect(screen.getByText("clean")).toBeInTheDocument());
		expect(screen.getByText(/retention lag/i)).toBeInTheDocument();
		expect(screen.getByText(/not a tamper signal/i)).toBeInTheDocument();
		expect(screen.getByText(/duplicate/i)).toBeInTheDocument();
		expect(screen.getByText(/anchor/i)).toBeInTheDocument();
	});

	it("hides the duplicates note when duplicatesSkipped is 0", async () => {
		mockGet.mockImplementation((url: string) =>
			Promise.resolve(isVerifyUrl(url) ? makeVerifyResponse({ duplicatesSkipped: 0 }) : listResponse)
		);
		await renderPage();

		openDialog();
		typeRef(VALID_COMPANY_REF);
		runVerify();

		await waitFor(() => expect(screen.getByText("clean")).toBeInTheDocument());
		expect(screen.queryByText(/duplicate/i)).not.toBeInTheDocument();
	});

	it("renders one row per break when a single entry carries two break types", async () => {
		mockGet.mockImplementation((url: string) =>
			Promise.resolve(
				isVerifyUrl(url)
					? makeVerifyResponse({
							status: "tampered",
							breaksFound: 2,
							breaks: [
								{
									entryId: "665f1f77bcf86cd799439011",
									position: 7,
									expected: "expected-sig-value",
									actual: "actual-sig-value",
									tier: "hot",
									type: "signature",
								},
								{
									entryId: "665f1f77bcf86cd799439011",
									position: 7,
									expected: "expected-payload-bytes",
									actual: "actual-payload-bytes",
									tier: "hot",
									type: "payload_drift",
								},
							],
						})
					: listResponse
			)
		);
		await renderPage();

		openDialog();
		typeRef(VALID_COMPANY_REF);
		runVerify();

		await waitFor(() => expect(screen.getByText("tampered")).toBeInTheDocument());
		expect(screen.getAllByText("665f1f77bcf86cd799439011")).toHaveLength(2);
		expect(screen.getByText("signature")).toBeInTheDocument();
		expect(screen.getByText("payload_drift")).toBeInTheDocument();
	});

	it("does not claim an empty chain is clean when it carries a head break", async () => {
		mockGet.mockImplementation((url: string) =>
			Promise.resolve(
				isVerifyUrl(url)
					? makeVerifyResponse({
							status: "tampered",
							totalEntries: 0,
							hotEntries: 0,
							coldEntries: 0,
							coldTier: false,
							firstEntry: null,
							lastEntry: null,
							breaksFound: 1,
							breaks: [
								{
									entryId: "665f000000000000000000aa",
									position: 0,
									expected: "<no-rows-walked>",
									actual: "stored-head-sig",
									tier: "hot",
									type: "head",
								},
							],
						})
					: listResponse
			)
		);
		await renderPage();

		openDialog();
		typeRef(VALID_COMPANY_REF);
		runVerify();

		await waitFor(() => expect(screen.getByText("tampered")).toBeInTheDocument());
		expect(screen.queryByText(/chain empty and clean/i)).not.toBeInTheDocument();
		expect(screen.getByText("head")).toBeInTheDocument();
	});

	it("shows a rate-limit notice on 429", async () => {
		mockGet.mockImplementation((url: string) => {
			if (isVerifyUrl(url)) {
				return Promise.reject({
					isAxiosError: true,
					response: { status: 429, data: { messageCode: ERROR_CODES.RATE_LIMIT_EXCEEDED } },
				});
			}
			return Promise.resolve(listResponse);
		});
		await renderPage();

		openDialog();
		typeRef(VALID_COMPANY_REF);
		runVerify();

		await waitFor(() => expect(screen.getByText(/verify rate limit reached/i)).toBeInTheDocument());
	});

	it("shows a retention-sweep notice on 409", async () => {
		mockGet.mockImplementation((url: string) => {
			if (isVerifyUrl(url)) {
				return Promise.reject({
					isAxiosError: true,
					response: { status: 409, data: { messageCode: ERROR_CODES.VERIFY_RETENTION_SWEEP_ACTIVE } },
				});
			}
			return Promise.resolve(listResponse);
		});
		await renderPage();

		openDialog();
		typeRef(VALID_COMPANY_REF);
		runVerify();

		await waitFor(() => expect(screen.getByText(/retention sweep in progress/i)).toBeInTheDocument());
	});

	it("shows a chain-too-large notice on 413", async () => {
		mockGet.mockImplementation((url: string) => {
			if (isVerifyUrl(url)) {
				return Promise.reject({
					isAxiosError: true,
					response: { status: 413, data: { messageCode: ERROR_CODES.VERIFY_ROW_LIMIT_EXCEEDED } },
				});
			}
			return Promise.resolve(listResponse);
		});
		await renderPage();

		openDialog();
		typeRef(VALID_COMPANY_REF);
		runVerify();

		await waitFor(() => expect(screen.getByText(/chain too large/i)).toBeInTheDocument());
	});

	it("shows a generic notice on server failure", async () => {
		mockGet.mockImplementation((url: string) => {
			if (isVerifyUrl(url)) {
				return Promise.reject({ response: { status: 500, data: {} } });
			}
			return Promise.resolve(listResponse);
		});
		await renderPage();

		openDialog();
		typeRef(VALID_COMPANY_REF);
		runVerify();

		await waitFor(() => expect(screen.getByText(/verification failed/i)).toBeInTheDocument());
	});

	it("disables the run button while the request is pending", async () => {
		mockGet.mockImplementation((url: string) =>
			isVerifyUrl(url) ? new Promise(() => {}) : Promise.resolve(listResponse)
		);
		await renderPage();

		openDialog();
		typeRef(VALID_COMPANY_REF);
		runVerify();

		await waitFor(() => expect(screen.getByRole("button", { name: /run verify/i })).toBeDisabled());
	});

	it("clears the previous report when the dialog is closed and reopened", async () => {
		await renderPage();

		openDialog();
		typeRef(VALID_COMPANY_REF);
		runVerify();
		await waitFor(() => expect(screen.getByText("clean")).toBeInTheDocument());

		fireEvent.click(screen.getByRole("button", { name: /^cancel$/i }));
		expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();

		openDialog();
		expect(screen.queryByText("clean")).not.toBeInTheDocument();
	});

	it("clears a previous error notice when the dialog is closed and reopened", async () => {
		mockGet.mockImplementation((url: string) => {
			if (isVerifyUrl(url)) {
				return Promise.reject({
					isAxiosError: true,
					response: { status: 429, data: { messageCode: ERROR_CODES.RATE_LIMIT_EXCEEDED } },
				});
			}
			return Promise.resolve(listResponse);
		});
		await renderPage();

		openDialog();
		typeRef(VALID_COMPANY_REF);
		runVerify();
		await waitFor(() => expect(screen.getByText(/verify rate limit reached/i)).toBeInTheDocument());

		fireEvent.click(screen.getByRole("button", { name: /^cancel$/i }));
		openDialog();
		expect(screen.queryByText(/verify rate limit reached/i)).not.toBeInTheDocument();
	});
});
