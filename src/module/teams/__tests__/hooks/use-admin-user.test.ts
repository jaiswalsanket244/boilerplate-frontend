import { useAdminUserAPI } from "@/module/teams/hooks/useAdminUser";
import { mockApiClient } from "@/tests/utils/mock-api-client";
import { wrapWithQueryClient } from "@/tests/utils/mock-providers";
import { renderHook, waitFor } from "@testing-library/react";

describe("useAdminUserAPI", () => {
	describe("useGetOneUserQuery", () => {
		it("should fetch a user query successfully", async () => {
			mockApiClient.get.mockResolvedValue({ data: { data: { id: "user-123", name: "John Doe" } } });

			const { result } = renderHook(
				() => {
					const { useGetOneUserQuery } = useAdminUserAPI();
					return useGetOneUserQuery("user-123");
				},
				{ wrapper: ({ children }) => wrapWithQueryClient(children) }
			);

			await waitFor(() => {
				expect(result.current.isPending).toBe(false);
			});

			expect(result.current.isSuccess).toBe(true);
			expect(result.current.data?.data).toEqual({ id: "user-123", name: "John Doe" });
		});

		it("should handle error when fetching a user query", async () => {
			mockApiClient.get.mockRejectedValue(new Error("Network error"));

			const { result } = renderHook(
				() => {
					const { useGetOneUserQuery } = useAdminUserAPI();
					return useGetOneUserQuery("user-123");
				},
				{ wrapper: ({ children }) => wrapWithQueryClient(children) }
			);

			await waitFor(() => {
				expect(result.current.isPending).toBe(false);
			});

			expect(result.current.isError).toBe(true);
			expect(result.current.error).toBeDefined();
		});
	});
});
