import { useCompanyOperations } from "@/module/company/hooks/useCompanyOperations";
import type { CompanyType } from "@/module/company/types";
import { cookiesUtilsMocks } from "@/tests/utils/mock-cookies-utils";
import { mockRouter } from "@/tests/utils/mock-next-navigation";
import { wrapWithQueryClient } from "@/tests/utils/mock-providers";
import { COOKIES, STATUS } from "@/types";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock dependencies
const mockMutate = vi.fn();
const mockInvalidateQueries = vi.fn();

vi.mock("@/module/company/hooks/useCompany", () => ({
	useCompanyAPI: () => ({
		useUpdateCompanyData: {
			mutate: mockMutate,
		},
	}),
}));

vi.mock("@tanstack/react-query", async (importOriginal) => {
	const original = await importOriginal<typeof import("@tanstack/react-query")>();
	return {
		...original,
		useQueryClient: () => ({
			invalidateQueries: mockInvalidateQueries,
		}),
	};
});

describe("useCompanyOperations Hook", () => {
	const mockCompany: CompanyType = {
		_id: "company-123",
		name: "Test Company",
		companyStatus: STATUS.ACTIVE,
		userRef: "user-123",
		supportEmail: "support@test.com",
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("Initialization", () => {
		it("should initialize with null company state", () => {
			const { result } = renderHook(() => useCompanyOperations(), {
				wrapper: ({ children }) => wrapWithQueryClient(children),
			});

			expect(result.current.companyId).toBeNull();
			expect(result.current.companyStatus).toBeNull();
		});

		it("should provide all required functions", () => {
			const { result } = renderHook(() => useCompanyOperations(), {
				wrapper: ({ children }) => wrapWithQueryClient(children),
			});

			expect(typeof result.current.openStatusDialog).toBe("function");
			expect(typeof result.current.closeStatusDialog).toBe("function");
			expect(typeof result.current.redirectToAdminPage).toBe("function");
			expect(typeof result.current.handleStatusChange).toBe("function");
		});
	});

	describe("openStatusDialog", () => {
		it("should set company id and status when opening dialog", () => {
			const { result } = renderHook(() => useCompanyOperations(), {
				wrapper: ({ children }) => wrapWithQueryClient(children),
			});

			act(() => {
				result.current.openStatusDialog(mockCompany);
			});

			expect(result.current.companyId).toBe("company-123");
			expect(result.current.companyStatus).toBe(STATUS.ACTIVE);
		});

		it("should handle company with inactive status", () => {
			const inactiveCompany = { ...mockCompany, companyStatus: STATUS.INACTIVE };
			const { result } = renderHook(() => useCompanyOperations(), {
				wrapper: ({ children }) => wrapWithQueryClient(children),
			});

			act(() => {
				result.current.openStatusDialog(inactiveCompany);
			});

			expect(result.current.companyStatus).toBe(STATUS.INACTIVE);
		});

		it("should handle company with undefined status", () => {
			const companyWithoutStatus = { ...mockCompany, companyStatus: undefined };
			const { result } = renderHook(() => useCompanyOperations(), {
				wrapper: ({ children }) => wrapWithQueryClient(children),
			});

			act(() => {
				result.current.openStatusDialog(companyWithoutStatus);
			});

			expect(result.current.companyStatus).toBeUndefined();
		});
	});

	describe("closeStatusDialog", () => {
		it("should reset company id and status to null", () => {
			const { result } = renderHook(() => useCompanyOperations(), {
				wrapper: ({ children }) => wrapWithQueryClient(children),
			});

			// First open the dialog
			act(() => {
				result.current.openStatusDialog(mockCompany);
			});

			expect(result.current.companyId).toBe("company-123");
			expect(result.current.companyStatus).toBe(STATUS.ACTIVE);

			// Then close it
			act(() => {
				result.current.closeStatusDialog();
			});

			expect(result.current.companyId).toBeNull();
			expect(result.current.companyStatus).toBeNull();
		});

		it("should work when called without opening dialog first", () => {
			const { result } = renderHook(() => useCompanyOperations(), {
				wrapper: ({ children }) => wrapWithQueryClient(children),
			});

			act(() => {
				result.current.closeStatusDialog();
			});

			expect(result.current.companyId).toBeNull();
			expect(result.current.companyStatus).toBeNull();
		});
	});

	describe("redirectToAdminPage", () => {
		it("should set cookies and navigate to admin page", () => {
			const { result } = renderHook(() => useCompanyOperations(), {
				wrapper: ({ children }) => wrapWithQueryClient(children),
			});

			act(() => {
				result.current.redirectToAdminPage("company-123");
			});

			expect(cookiesUtilsMocks.setCookies).toHaveBeenCalledWith({
				[COOKIES.COMPANY_REF]: "company-123",
				[COOKIES.IS_ADMIN_PATH]: "true",
			});
			expect(mockRouter.push).toHaveBeenCalledWith("/client/dashboard?companyRef=company-123");
		});

		it("should handle different company IDs", () => {
			const { result } = renderHook(() => useCompanyOperations(), {
				wrapper: ({ children }) => wrapWithQueryClient(children),
			});

			act(() => {
				result.current.redirectToAdminPage("different-company-456");
			});

			expect(cookiesUtilsMocks.setCookies).toHaveBeenCalledWith({
				[COOKIES.COMPANY_REF]: "different-company-456",
				[COOKIES.IS_ADMIN_PATH]: "true",
			});
			expect(mockRouter.push).toHaveBeenCalledWith("/client/dashboard?companyRef=different-company-456");
		});
	});

	describe("handleStatusChange", () => {
		it("should update company status from active to inactive", async () => {
			const onSuccess = vi.fn();
			const { result } = renderHook(() => useCompanyOperations({ onSuccess }), {
				wrapper: ({ children }) => wrapWithQueryClient(children),
			});

			// Open dialog with active company
			act(() => {
				result.current.openStatusDialog(mockCompany);
			});

			// Mock successful mutation
			mockMutate.mockImplementation((params, { onSuccess: onSuccessCallback }) => {
				onSuccessCallback?.();
			});

			// Handle status change
			act(() => {
				result.current.handleStatusChange();
			});

			await waitFor(() => {
				expect(mockMutate).toHaveBeenCalledWith(
					{
						id: "company-123",
						data: { companyStatus: STATUS.INACTIVE },
					},
					expect.objectContaining({
						onSuccess: expect.any(Function),
						onError: expect.any(Function),
					})
				);
			});

			expect(mockInvalidateQueries).toHaveBeenCalled();
			expect(onSuccess).toHaveBeenCalledWith("updated", "company-123");
			expect(result.current.companyId).toBeNull();
			expect(result.current.companyStatus).toBeNull();
		});

		it("should update company status from inactive to active", async () => {
			const onSuccess = vi.fn();
			const inactiveCompany = { ...mockCompany, companyStatus: STATUS.INACTIVE };
			const { result } = renderHook(() => useCompanyOperations({ onSuccess }), {
				wrapper: ({ children }) => wrapWithQueryClient(children),
			});

			act(() => {
				result.current.openStatusDialog(inactiveCompany);
			});

			mockMutate.mockImplementation((params, { onSuccess: onSuccessCallback }) => {
				onSuccessCallback?.();
			});

			act(() => {
				result.current.handleStatusChange();
			});

			await waitFor(() => {
				expect(mockMutate).toHaveBeenCalledWith(
					{
						id: "company-123",
						data: { companyStatus: STATUS.ACTIVE },
					},
					expect.any(Object)
				);
			});

			expect(onSuccess).toHaveBeenCalledWith("updated", "company-123");
		});

		it("should handle mutation error", async () => {
			const onSuccess = vi.fn();
			const { result } = renderHook(() => useCompanyOperations({ onSuccess }), {
				wrapper: ({ children }) => wrapWithQueryClient(children),
			});

			act(() => {
				result.current.openStatusDialog(mockCompany);
			});

			mockMutate.mockImplementation((params, { onError }) => {
				onError?.(new Error("Network error"));
			});

			act(() => {
				result.current.handleStatusChange();
			});

			await waitFor(() => {
				expect(onSuccess).toHaveBeenCalledWith("errors", "company-123");
			});

			expect(mockInvalidateQueries).not.toHaveBeenCalled();
		});

		it("should not update when company id is null", () => {
			const { result } = renderHook(() => useCompanyOperations(), {
				wrapper: ({ children }) => wrapWithQueryClient(children),
			});

			act(() => {
				result.current.handleStatusChange();
			});

			expect(mockMutate).not.toHaveBeenCalled();
		});

		it("should close dialog after successful status change", async () => {
			const { result } = renderHook(() => useCompanyOperations(), {
				wrapper: ({ children }) => wrapWithQueryClient(children),
			});

			act(() => {
				result.current.openStatusDialog(mockCompany);
			});

			mockMutate.mockImplementation((params, { onSuccess: onSuccessCallback }) => {
				onSuccessCallback?.();
			});

			expect(result.current.companyId).toBe("company-123");

			act(() => {
				result.current.handleStatusChange();
			});

			await waitFor(() => {
				expect(result.current.companyId).toBeNull();
				expect(result.current.companyStatus).toBeNull();
			});
		});

		it("should invalidate companies queries on success", async () => {
			const { result } = renderHook(() => useCompanyOperations(), {
				wrapper: ({ children }) => wrapWithQueryClient(children),
			});

			act(() => {
				result.current.openStatusDialog(mockCompany);
			});

			mockMutate.mockImplementation((params, { onSuccess: onSuccessCallback }) => {
				onSuccessCallback?.();
			});

			act(() => {
				result.current.handleStatusChange();
			});

			await waitFor(() => {
				expect(mockInvalidateQueries).toHaveBeenCalledWith({
					predicate: expect.any(Function),
				});
			});
		});
	});

	describe("Integration Scenarios", () => {
		it("should handle complete workflow: open dialog, change status, close dialog", async () => {
			const onSuccess = vi.fn();
			const { result } = renderHook(() => useCompanyOperations({ onSuccess }), {
				wrapper: ({ children }) => wrapWithQueryClient(children),
			});

			// Step 1: Open dialog
			act(() => {
				result.current.openStatusDialog(mockCompany);
			});
			expect(result.current.companyId).toBe("company-123");
			expect(result.current.companyStatus).toBe(STATUS.ACTIVE);

			// Step 2: Change status
			mockMutate.mockImplementation((params, { onSuccess: onSuccessCallback }) => {
				onSuccessCallback?.();
			});

			act(() => {
				result.current.handleStatusChange();
			});

			await waitFor(() => {
				expect(mockMutate).toHaveBeenCalled();
				expect(onSuccess).toHaveBeenCalledWith("updated", "company-123");
			});

			// Step 3: Verify dialog is closed
			expect(result.current.companyId).toBeNull();
			expect(result.current.companyStatus).toBeNull();
		});

		it("should handle opening dialog for different companies", () => {
			const { result } = renderHook(() => useCompanyOperations(), {
				wrapper: ({ children }) => wrapWithQueryClient(children),
			});

			const company1 = { ...mockCompany, _id: "company-1" };
			const company2 = { ...mockCompany, _id: "company-2", companyStatus: STATUS.INACTIVE };

			act(() => {
				result.current.openStatusDialog(company1);
			});
			expect(result.current.companyId).toBe("company-1");

			act(() => {
				result.current.closeStatusDialog();
			});

			act(() => {
				result.current.openStatusDialog(company2);
			});
			expect(result.current.companyId).toBe("company-2");
			expect(result.current.companyStatus).toBe(STATUS.INACTIVE);
		});

		it("should handle navigation to different company pages", () => {
			const { result } = renderHook(() => useCompanyOperations(), {
				wrapper: ({ children }) => wrapWithQueryClient(children),
			});

			act(() => {
				result.current.redirectToAdminPage("company-1");
			});
			expect(mockRouter.push).toHaveBeenCalledWith("/client/dashboard?companyRef=company-1");

			act(() => {
				result.current.redirectToAdminPage("company-2");
			});
			expect(mockRouter.push).toHaveBeenCalledWith("/client/dashboard?companyRef=company-2");
		});
	});

	describe("Edge Cases", () => {
		it("should handle company without status", async () => {
			const companyWithoutStatus = { ...mockCompany, companyStatus: undefined };
			const { result } = renderHook(() => useCompanyOperations(), {
				wrapper: ({ children }) => wrapWithQueryClient(children),
			});

			act(() => {
				result.current.openStatusDialog(companyWithoutStatus);
			});

			mockMutate.mockImplementation((params, { onSuccess: onSuccessCallback }) => {
				onSuccessCallback?.();
			});

			act(() => {
				result.current.handleStatusChange();
			});

			await waitFor(() => {
				expect(mockMutate).toHaveBeenCalledWith(
					{
						id: "company-123",
						data: { companyStatus: STATUS.ACTIVE },
					},
					expect.any(Object)
				);
			});
		});

		it("should work without onSuccess callback", async () => {
			const { result } = renderHook(() => useCompanyOperations(), {
				wrapper: ({ children }) => wrapWithQueryClient(children),
			});

			act(() => {
				result.current.openStatusDialog(mockCompany);
			});

			mockMutate.mockImplementation((params, { onSuccess: onSuccessCallback }) => {
				onSuccessCallback?.();
			});

			act(() => {
				result.current.handleStatusChange();
			});

			await waitFor(() => {
				expect(mockMutate).toHaveBeenCalled();
			});
		});

		it("should handle empty company ID string", () => {
			const companyWithEmptyId = { ...mockCompany, _id: "" };
			const { result } = renderHook(() => useCompanyOperations(), {
				wrapper: ({ children }) => wrapWithQueryClient(children),
			});

			act(() => {
				result.current.openStatusDialog(companyWithEmptyId);
			});

			expect(result.current.companyId).toBe("");
		});

		it("should handle multiple error callbacks", async () => {
			const onSuccess = vi.fn();
			const { result } = renderHook(() => useCompanyOperations({ onSuccess }), {
				wrapper: ({ children }) => wrapWithQueryClient(children),
			});

			act(() => {
				result.current.openStatusDialog(mockCompany);
			});

			mockMutate.mockImplementation((params, { onError }) => {
				onError?.(new Error("Error 1"));
			});

			act(() => {
				result.current.handleStatusChange();
			});

			await waitFor(() => {
				expect(onSuccess).toHaveBeenCalledWith("errors", "company-123");
			});

			// Try again with same company
			act(() => {
				result.current.openStatusDialog(mockCompany);
			});

			act(() => {
				result.current.handleStatusChange();
			});

			await waitFor(() => {
				expect(onSuccess).toHaveBeenCalledTimes(2);
			});
		});
	});
});
