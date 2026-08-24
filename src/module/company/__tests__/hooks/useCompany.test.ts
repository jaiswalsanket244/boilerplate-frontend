import { useCompanyAPI } from "@/module/company/hooks/useCompany";
import { mockApiClient } from "@/tests/utils/mock-api-client";
import { wrapWithQueryClient } from "@/tests/utils/mock-providers";
import { ROLES, STATUS } from "@/types";
import { renderHook, waitFor } from "@testing-library/react";
import { mock } from "node:test";

const mockCompanies = [
	{
		_id: "company-1",
		name: "Test Company 1",
		companyStatus: STATUS.ACTIVE,
		userRef: "user-1",
		supportEmail: "support1@test.com",
	},
	{
		_id: "company-2",
		name: "Test Company 2",
		companyStatus: STATUS.INACTIVE,
		userRef: "user-2",
		supportEmail: "support2@test.com",
	},
	{
		_id: "company-3",
		name: "Test Company 3",
		companyStatus: STATUS.ACTIVE,
		userRef: "user-3",
	},
];

describe("useCompanyAPI Hook", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("useGetAllCompanyData", () => {
		it("should fetch all company data successfully", async () => {
			mockApiClient.get.mockResolvedValue({ data: { data: [{ items: mockCompanies }] } });

			const { result } = renderHook(
				() => {
					const { useGetAllCompanyData } = useCompanyAPI();
					return useGetAllCompanyData({ searchValue: "", page: 1, pageSize: 10 });
				},
				{ wrapper: ({ children }) => wrapWithQueryClient(children) }
			);

			await waitFor(() => {
				expect(result.current.isPending).toBe(false);
			});

			expect(result.current.data?.[0]?.items).toEqual(mockCompanies);

			expect(mockApiClient.get).toHaveBeenCalledWith("/super-admin/company/", {
				params: {
					searchValue: "",
					page: 1,
					pageSize: 10,
				},
			});
		});

		it("should handle error when fetching company data", async () => {
			mockApiClient.get.mockRejectedValue(new Error("Network error"));

			const { result } = renderHook(
				() => {
					const { useGetAllCompanyData } = useCompanyAPI();
					return useGetAllCompanyData({ searchValue: "", page: 1, pageSize: 10 });
				},
				{ wrapper: ({ children }) => wrapWithQueryClient(children) }
			);

			await waitFor(() => {
				expect(result.current.isPending).toBe(false);
			});

			expect(result.current.isError).toBe(true);
			expect(result.current.error).toEqual(
				expect.objectContaining({
					message: "Network error",
				})
			);
		});
	});
	const mockCompany = {
		_id: "123",
		name: "test",
		companyStatus: "active",
		userRef: {
			_id: "123",
			name: {
				first: "test",
				last: "test",
			},
			fullName: "test",
			email: "test",
		},
	};
	describe("useGetOneCompanyData", () => {
		it("should fetch one company data successfully", async () => {
			mockApiClient.get.mockResolvedValue({ data: { data: mockCompany } });

			const { result } = renderHook(
				() => {
					const { useGetOneCompanyData } = useCompanyAPI();
					return useGetOneCompanyData("123", ROLES.SUPER_ADMIN);
				},
				{ wrapper: ({ children }) => wrapWithQueryClient(children) }
			);

			await waitFor(() => {
				expect(result.current.isPending).toBe(false);
			});

			expect(result.current.data).toEqual(mockCompany);
			expect(mockApiClient.get).toHaveBeenCalledWith(`/super-admin/company/123`);
		});

		it("should handle error when fetching one company data", async () => {
			mockApiClient.get.mockRejectedValue(new Error("Network error"));

			const { result } = renderHook(
				() => {
					const { useGetOneCompanyData } = useCompanyAPI();
					return useGetOneCompanyData("123", ROLES.SUPER_ADMIN);
				},
				{ wrapper: ({ children }) => wrapWithQueryClient(children) }
			);

			await waitFor(() => {
				expect(result.current.isPending).toBe(false);
			});

			expect(result.current.isError).toBe(true);
			expect(result.current.error).toEqual(
				expect.objectContaining({
					message: "Network error",
				})
			);
		});
	});

	describe("useUpdateCompanyData", () => {
		it("should update company data successfully", async () => {
			mockApiClient.put.mockResolvedValue({ data: { data: mockCompany } });

			const { result } = renderHook(
				() => {
					const { useUpdateCompanyData } = useCompanyAPI();
					return useUpdateCompanyData;
				},
				{ wrapper: ({ children }) => wrapWithQueryClient(children) }
			);

			const mutationResult = await result.current.mutateAsync({
				id: "123",
				data: {
					name: "test",
					companyStatus: "active",
				},
			});

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});

			expect(mutationResult).toEqual({ data: { data: mockCompany } });
			expect(mockApiClient.put).toHaveBeenCalledWith(`/super-admin/company/123`, {
				name: "test",
				companyStatus: "active",
			});
		});
	});
});
