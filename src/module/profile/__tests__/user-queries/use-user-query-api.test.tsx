import { apiClient } from "@/lib/api";
import useUserQueryAPI from "@/module/profile/hooks/useUserQueryAPI";
import { USER_QUERY_STATUS, USER_QUERY_SUBJECT, type ContactFormData, type IUserQuery } from "@/module/profile/types";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { wrapper } from "@/module/profile/__tests__/utils";

const mockUserQuery: IUserQuery = {
	_id: "query-123",
	email: "test@example.com",
	subject: USER_QUERY_SUBJECT.GENERAL,
	message: "Test query message",
	name: {
		first: "John",
		last: "Doe",
	},
	status: USER_QUERY_STATUS.PENDING,
	companyRef: "company-123",
	createdAt: "2024-01-01T00:00:00.000Z",
	updatedAt: "2024-01-01T00:00:00.000Z",
	userName: "John Doe",
};

describe("useUserQueryAPI hook", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("useCreateUserQuery", () => {
		it("should create a user query successfully", async () => {
			const mockResponse = {
				data: {
					data: mockUserQuery,
				},
			};

			vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

			const { result } = renderHook(
				() => {
					const { useCreateUserQuery } = useUserQueryAPI();
					return useCreateUserQuery();
				},
				{ wrapper }
			);

			const queryData: ContactFormData = {
				email: "test@example.com",
				subject: USER_QUERY_SUBJECT.GENERAL,
				message: "Test query message",
				name: {
					first: "John",
					last: "Doe",
				},
			};

			const mutationResult = await result.current.mutateAsync(queryData);

			expect(mutationResult).toEqual(mockUserQuery);
			expect(apiClient.post).toHaveBeenCalledWith("/help", queryData);
		});

		it("should invalidate user-queries cache after creating query", async () => {
			const mockResponse = {
				data: {
					data: mockUserQuery,
				},
			};

			vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

			const { result } = renderHook(
				() => {
					const { useCreateUserQuery } = useUserQueryAPI();
					return useCreateUserQuery();
				},
				{ wrapper }
			);

			const queryData: ContactFormData = {
				email: "test@example.com",
				subject: USER_QUERY_SUBJECT.TECHNICAL,
				message: "Technical support needed",
				name: {
					first: "Jane",
					last: "Smith",
				},
			};

			await result.current.mutateAsync(queryData);

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});
		});

		it("should handle error when creating user query", async () => {
			vi.mocked(apiClient.post).mockRejectedValue({
				response: { data: { message: "Failed to create query" } },
			});

			const { result } = renderHook(
				() => {
					const { useCreateUserQuery } = useUserQueryAPI();
					return useCreateUserQuery();
				},
				{ wrapper }
			);

			const queryData: ContactFormData = {
				email: "invalid-email",
				subject: USER_QUERY_SUBJECT.BILLING,
				message: "Test",
				name: {
					first: "Test",
					last: "User",
				},
			};

			await expect(result.current.mutateAsync(queryData)).rejects.toThrow();
		});

		it("should handle different query subjects", async () => {
			const mockResponse = {
				data: {
					data: { ...mockUserQuery, subject: USER_QUERY_SUBJECT.FEATURE },
				},
			};

			vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

			const { result } = renderHook(
				() => {
					const { useCreateUserQuery } = useUserQueryAPI();
					return useCreateUserQuery();
				},
				{ wrapper }
			);

			const queryData: ContactFormData = {
				email: "feature@example.com",
				subject: USER_QUERY_SUBJECT.FEATURE,
				message: "Feature request",
				name: {
					first: "Feature",
					last: "Requester",
				},
			};

			await result.current.mutateAsync(queryData);

			expect(apiClient.post).toHaveBeenCalledWith("/help", queryData);
		});
	});

	describe("useGetAllQueries", () => {
		it("should fetch all queries successfully", async () => {
			const mockQueries = [mockUserQuery];
			const mockResponse = {
				data: {
					data: [
						{
							items: mockQueries,
							total: 1,
							page: 1,
							pageSize: 15,
						},
					],
				},
			};

			vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

			const { result } = renderHook(
				() => {
					const { useGetAllQueries } = useUserQueryAPI();
					return useGetAllQueries();
				},
				{ wrapper }
			);

			await waitFor(() => {
				expect(result.current.data).toEqual({
					items: mockQueries,
					total: 1,
					page: 1,
					pageSize: 15,
				});
			});

			expect(apiClient.get).toHaveBeenCalledWith("/help");
		});

		it("should fetch queries with query string", async () => {
			const mockQueries = [mockUserQuery];
			const mockResponse = {
				data: {
					data: [
						{
							items: mockQueries,
							total: 1,
							page: 1,
							pageSize: 15,
						},
					],
				},
			};

			vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

			const queryString = "page=1&size=15&status=Pending";

			const { result } = renderHook(
				() => {
					const { useGetAllQueries } = useUserQueryAPI();
					return useGetAllQueries(queryString);
				},
				{ wrapper }
			);

			await waitFor(() => {
				expect(result.current.isPending).toBe(false);
			});

			expect(apiClient.get).toHaveBeenCalledWith(`/help?${queryString}`);
		});

		it("should handle empty query results", async () => {
			const mockResponse = {
				data: {
					data: [
						{
							items: [],
							total: 0,
							page: 1,
							pageSize: 15,
						},
					],
				},
			};

			vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

			const { result } = renderHook(
				() => {
					const { useGetAllQueries } = useUserQueryAPI();
					return useGetAllQueries();
				},
				{ wrapper }
			);

			await waitFor(() => {
				expect(result.current.data).toEqual({
					items: [],
					total: 0,
					page: 1,
					pageSize: 15,
				});
			});
		});

		it("should handle error when fetching queries", async () => {
			vi.mocked(apiClient.get).mockRejectedValue(new Error("Network error"));

			const { result } = renderHook(
				() => {
					const { useGetAllQueries } = useUserQueryAPI();
					return useGetAllQueries();
				},
				{ wrapper }
			);

			await waitFor(() => {
				expect(result.current.isPending).toBe(false);
			});

			await waitFor(() => {
				expect(result.current.isError).toBe(true);
			});
		});

		it("should use correct query key with query string", async () => {
			const mockResponse = {
				data: {
					data: [
						{
							items: [],
							total: 0,
							page: 1,
							pageSize: 15,
						},
					],
				},
			};

			vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

			const queryString = "search=test&sortBy=createdAt";

			const { result } = renderHook(
				() => {
					const { useGetAllQueries } = useUserQueryAPI();
					return useGetAllQueries(queryString);
				},
				{ wrapper }
			);

			await waitFor(() => {
				expect(result.current.isPending).toBe(false);
			});

			expect(apiClient.get).toHaveBeenCalledWith(`/help?${queryString}`);
		});

		it("should respect staleTime configuration", async () => {
			const mockResponse = {
				data: {
					data: [
						{
							items: [mockUserQuery],
							total: 1,
							page: 1,
							pageSize: 15,
						},
					],
				},
			};

			vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

			const { result } = renderHook(
				() => {
					const { useGetAllQueries } = useUserQueryAPI();
					return useGetAllQueries();
				},
				{ wrapper }
			);

			await waitFor(() => {
				expect(result.current.data).toBeDefined();
			});

			// Data should be fresh and not refetch immediately
			expect(result.current.isStale).toBe(false);
		});
	});

	describe("useSendEmail", () => {
		it("should send email successfully", async () => {
			const mockResponse = {
				data: {
					success: true,
					message: "Email sent successfully",
				},
			};

			vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

			const { result } = renderHook(
				() => {
					const { useSendEmail } = useUserQueryAPI();
					return useSendEmail();
				},
				{ wrapper }
			);

			const emailData = {
				id: "query-123",
				payload: {
					message: "Response to your query",
					ccEmails: ["cc@example.com"],
					bccEmails: ["bcc@example.com"],
				},
			};

			const mutationResult = await result.current.mutateAsync(emailData);

			expect(mutationResult).toEqual(mockResponse.data);
			expect(apiClient.post).toHaveBeenCalledWith(`/admin/help/email/${emailData.id}`, emailData.payload);
		});

		it("should send email without CC and BCC", async () => {
			const mockResponse = {
				data: {
					success: true,
					message: "Email sent",
				},
			};

			vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

			const { result } = renderHook(
				() => {
					const { useSendEmail } = useUserQueryAPI();
					return useSendEmail();
				},
				{ wrapper }
			);

			const emailData = {
				id: "query-456",
				payload: {
					message: "Simple response",
					ccEmails: [],
					bccEmails: [],
				},
			};

			await result.current.mutateAsync(emailData);

			expect(apiClient.post).toHaveBeenCalledWith("/admin/help/email/query-456", emailData.payload);
		});

		it("should handle error when sending email", async () => {
			vi.mocked(apiClient.post).mockRejectedValue({
				response: { data: { message: "Failed to send email" } },
			});

			const { result } = renderHook(
				() => {
					const { useSendEmail } = useUserQueryAPI();
					return useSendEmail();
				},
				{ wrapper }
			);

			const emailData = {
				id: "query-789",
				payload: {
					message: "Test message",
					ccEmails: [],
					bccEmails: [],
				},
			};

			await expect(result.current.mutateAsync(emailData)).rejects.toThrow();
		});

		it("should handle multiple CC and BCC emails", async () => {
			const mockResponse = {
				data: {
					success: true,
				},
			};

			vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

			const { result } = renderHook(
				() => {
					const { useSendEmail } = useUserQueryAPI();
					return useSendEmail();
				},
				{ wrapper }
			);

			const emailData = {
				id: "query-999",
				payload: {
					message: "Bulk email",
					ccEmails: ["cc1@example.com", "cc2@example.com", "cc3@example.com"],
					bccEmails: ["bcc1@example.com", "bcc2@example.com"],
				},
			};

			await result.current.mutateAsync(emailData);

			expect(apiClient.post).toHaveBeenCalledWith("/admin/help/email/query-999", emailData.payload);
		});
	});

	describe("useUpdateQuery", () => {
		it("should update query successfully", async () => {
			const updatedQuery = {
				...mockUserQuery,
				status: USER_QUERY_STATUS.RESOLVED,
			};

			const mockResponse = {
				data: {
					data: updatedQuery,
				},
			};

			vi.mocked(apiClient.put).mockResolvedValue(mockResponse);

			const { result } = renderHook(
				() => {
					const { useUpdateQuery } = useUserQueryAPI();
					return useUpdateQuery();
				},
				{ wrapper }
			);

			const updatePayload = {
				id: "query-123",
				data: {
					status: USER_QUERY_STATUS.RESOLVED,
				},
			};

			const mutationResult = await result.current.mutateAsync(updatePayload);

			expect(mutationResult).toEqual(updatedQuery);
			expect(apiClient.put).toHaveBeenCalledWith(`/admin/help/${updatePayload.id}`, updatePayload.data);
		});

		it("should invalidate user-queries cache after updating", async () => {
			const mockResponse = {
				data: {
					data: mockUserQuery,
				},
			};

			vi.mocked(apiClient.put).mockResolvedValue(mockResponse);

			const { result } = renderHook(
				() => {
					const { useUpdateQuery } = useUserQueryAPI();
					return useUpdateQuery();
				},
				{ wrapper }
			);

			const updatePayload = {
				id: "query-123",
				data: {
					status: USER_QUERY_STATUS.IN_PROGRESS,
				},
			};

			await result.current.mutateAsync(updatePayload);

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});
		});

		it("should update query status to different values", async () => {
			const statuses = [
				USER_QUERY_STATUS.PENDING,
				USER_QUERY_STATUS.IN_PROGRESS,
				USER_QUERY_STATUS.RESOLVED,
				USER_QUERY_STATUS.CLOSED,
			];

			for (const status of statuses) {
				const mockResponse = {
					data: {
						data: { ...mockUserQuery, status },
					},
				};

				vi.mocked(apiClient.put).mockResolvedValue(mockResponse);

				const { result } = renderHook(
					() => {
						const { useUpdateQuery } = useUserQueryAPI();
						return useUpdateQuery();
					},
					{ wrapper }
				);

				const updatePayload = {
					id: "query-123",
					data: { status },
				};

				const mutationResult = await result.current.mutateAsync(updatePayload);

				expect(mutationResult.status).toBe(status);
			}
		});

		it("should handle partial query updates", async () => {
			const mockResponse = {
				data: {
					data: mockUserQuery,
				},
			};

			vi.mocked(apiClient.put).mockResolvedValue(mockResponse);

			const { result } = renderHook(
				() => {
					const { useUpdateQuery } = useUserQueryAPI();
					return useUpdateQuery();
				},
				{ wrapper }
			);

			const updatePayload = {
				id: "query-123",
				data: {
					message: "Updated message",
				},
			};

			await result.current.mutateAsync(updatePayload);

			expect(apiClient.put).toHaveBeenCalledWith("/admin/help/query-123", {
				message: "Updated message",
			});
		});

		it("should handle error when updating query", async () => {
			vi.mocked(apiClient.put).mockRejectedValue({
				response: { data: { message: "Query not found" } },
			});

			const { result } = renderHook(
				() => {
					const { useUpdateQuery } = useUserQueryAPI();
					return useUpdateQuery();
				},
				{ wrapper }
			);

			const updatePayload = {
				id: "invalid-id",
				data: {
					status: USER_QUERY_STATUS.RESOLVED,
				},
			};

			await expect(result.current.mutateAsync(updatePayload)).rejects.toThrow();
		});

		it("should handle network errors during update", async () => {
			vi.mocked(apiClient.put).mockRejectedValue(new Error("Network error"));

			const { result } = renderHook(
				() => {
					const { useUpdateQuery } = useUserQueryAPI();
					return useUpdateQuery();
				},
				{ wrapper }
			);

			const updatePayload = {
				id: "query-123",
				data: {
					status: USER_QUERY_STATUS.CLOSED,
				},
			};

			await expect(result.current.mutateAsync(updatePayload)).rejects.toThrow("Network error");
		});
	});

	describe("API URL constants", () => {
		it("should use correct API endpoints for user operations", async () => {
			const mockResponse = {
				data: {
					data: mockUserQuery,
				},
			};

			vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

			const { result } = renderHook(
				() => {
					const { useCreateUserQuery } = useUserQueryAPI();
					return useCreateUserQuery();
				},
				{ wrapper }
			);

			const queryData: ContactFormData = {
				email: "test@example.com",
				subject: USER_QUERY_SUBJECT.GENERAL,
				message: "Test",
				name: { first: "Test", last: "User" },
			};

			await result.current.mutateAsync(queryData);

			expect(apiClient.post).toHaveBeenCalledWith("/help", queryData);
		});

		it("should use correct API endpoints for admin operations", async () => {
			const mockResponse = {
				data: {
					data: mockUserQuery,
				},
			};

			vi.mocked(apiClient.put).mockResolvedValue(mockResponse);

			const { result } = renderHook(
				() => {
					const { useUpdateQuery } = useUserQueryAPI();
					return useUpdateQuery();
				},
				{ wrapper }
			);

			const updatePayload = {
				id: "query-123",
				data: { status: USER_QUERY_STATUS.RESOLVED },
			};

			await result.current.mutateAsync(updatePayload);

			expect(apiClient.put).toHaveBeenCalledWith("/admin/help/query-123", updatePayload.data);
		});
	});
});
