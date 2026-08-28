import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiClient } from "@/lib/api";
import { wrapper } from "@/module/profile/__tests__/utils";
import { useUserQueries } from "@/module/profile/hooks/useUserQueries";
import { type IUserQuery, USER_QUERY_STATUS, USER_QUERY_SUBJECT } from "@/module/profile/types";

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

const mockQueriesResponse = {
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

const getApiResponse = (data?: any) => {
	return {
		data: {
			data: [
				{
					items: [mockUserQuery],
					total: 1,
					page: 1,
					pageSize: 15,
					...data,
				},
			],
		},
	};
};

describe("useUserQueries hook", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("Initialization", () => {
		it("should initialize with default values", async () => {
			vi.mocked(apiClient.get).mockResolvedValue(mockQueriesResponse);

			const { result } = renderHook(() => useUserQueries(), { wrapper });

			expect(result.current.filters).toEqual({
				subjects: [],
				dateFrom: "",
				dateTo: "",
				status: [],
				sortBy: "createdAt",
				sortOrder: "desc",
			});

			expect(result.current.searchTerm).toBe("");
			expect(result.current.pagination).toEqual({
				page: 1,
				size: 15,
				totalPages: 1,
				totalItems: 0,
			});
		});

		it("should initialize with custom initial filters", async () => {
			vi.mocked(apiClient.get).mockResolvedValue(mockQueriesResponse);

			const initialFilters = {
				subjects: [USER_QUERY_SUBJECT.TECHNICAL],
				status: [USER_QUERY_STATUS.PENDING],
				sortBy: "email" as const,
				sortOrder: "asc" as const,
			};

			const { result } = renderHook(() => useUserQueries({ initialFilters }), { wrapper });

			expect(result.current.filters).toEqual({
				subjects: [USER_QUERY_SUBJECT.TECHNICAL],
				dateFrom: "",
				dateTo: "",
				status: [USER_QUERY_STATUS.PENDING],
				sortBy: "email",
				sortOrder: "asc",
			});
		});

		it("should initialize with custom page size", async () => {
			vi.mocked(apiClient.get).mockResolvedValue(mockQueriesResponse);

			const { result } = renderHook(() => useUserQueries({ pageSize: 25 }), {
				wrapper,
			});

			expect(result.current.pagination.size).toBe(25);
		});

		it("should initialize with both custom filters and page size", async () => {
			vi.mocked(apiClient.get).mockResolvedValue(mockQueriesResponse);

			const initialFilters = {
				subjects: [USER_QUERY_SUBJECT.BILLING],
			};

			const { result } = renderHook(() => useUserQueries({ initialFilters, pageSize: 30 }), { wrapper });

			expect(result.current.filters.subjects).toEqual([USER_QUERY_SUBJECT.BILLING]);
			expect(result.current.pagination.size).toBe(30);
		});
	});

	describe("Data Fetching", () => {
		it("should fetch queries successfully", async () => {
			vi.mocked(apiClient.get).mockResolvedValue(mockQueriesResponse);

			const { result } = renderHook(() => useUserQueries(), { wrapper });

			await waitFor(() => {
				expect(result.current.queries).toEqual([mockUserQuery]);
			});

			expect(result.current.isLoading).toBe(false);
			expect(result.current.error).toBeNull();
		});

		it("should handle empty query results", async () => {
			vi.mocked(apiClient.get).mockResolvedValue({
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
			});

			const { result } = renderHook(() => useUserQueries(), { wrapper });

			await waitFor(() => {
				expect(result.current.queries).toEqual([]);
			});

			expect(result.current.pagination.totalItems).toBe(0);
		});

		it("should handle loading state", () => {
			vi.mocked(apiClient.get).mockImplementation(() => new Promise(() => {}));

			const { result } = renderHook(() => useUserQueries(), { wrapper });

			expect(result.current.isLoading).toBe(true);
		});

		it("should handle error state", async () => {
			vi.mocked(apiClient.get).mockRejectedValue(new Error("Network error"));

			const { result } = renderHook(() => useUserQueries(), { wrapper });

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			await waitFor(() => {
				expect(result.current.error).toBeDefined();
			});
		});

		it("should fetch multiple queries", async () => {
			const multipleQueries = [
				mockUserQuery,
				{ ...mockUserQuery, _id: "query-456", email: "test2@example.com" },
				{ ...mockUserQuery, _id: "query-789", email: "test3@example.com" },
			];

			vi.mocked(apiClient.get).mockResolvedValue({
				data: {
					data: [
						{
							items: multipleQueries,
							total: 3,
							page: 1,
							pageSize: 15,
						},
					],
				},
			});

			const { result } = renderHook(() => useUserQueries(), { wrapper });

			await waitFor(() => {
				expect(result.current.queries).toHaveLength(3);
			});
		});
	});

	describe("Pagination", () => {
		it("should update pagination state from API response", async () => {
			vi.mocked(apiClient.get).mockResolvedValue({
				data: {
					data: [
						{
							items: [mockUserQuery],
							total: 50,
							page: 1,
							pageSize: 15,
						},
					],
				},
			});

			const { result } = renderHook(() => useUserQueries(), { wrapper });

			await waitFor(() => {
				expect(result.current.pagination).toEqual({
					page: 1,
					size: 15,
					totalPages: 4, // Math.ceil(50 / 15) = 4
					totalItems: 50,
				});
			});
		});

		it("should handle page change", async () => {
			vi.mocked(apiClient.get).mockResolvedValue(mockQueriesResponse);

			const { result } = renderHook(() => useUserQueries(), { wrapper });

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			act(() => {
				result.current.handlePageChange(2);
			});

			expect(result.current.pagination.page).toBe(2);
		});

		it("should calculate total pages correctly", async () => {
			const testCases = [
				{ total: 15, pageSize: 15, expectedPages: 1 },
				{ total: 16, pageSize: 15, expectedPages: 2 },
				{ total: 45, pageSize: 15, expectedPages: 3 },
				{ total: 100, pageSize: 25, expectedPages: 4 },
			];

			for (const testCase of testCases) {
				vi.mocked(apiClient.get).mockResolvedValue({
					data: {
						data: [
							{
								items: [],
								total: testCase.total,
								page: 1,
								pageSize: testCase.pageSize,
							},
						],
					},
				});

				const { result } = renderHook(() => useUserQueries({ pageSize: testCase.pageSize }), { wrapper });

				await waitFor(() => {
					expect(result.current.pagination.totalPages).toBe(testCase.expectedPages);
				});
			}
		});

		it("should handle page change to last page", async () => {
			vi.mocked(apiClient.get).mockResolvedValue({
				data: {
					data: [
						{
							items: [mockUserQuery],
							total: 50,
							page: 1,
							pageSize: 15,
						},
					],
				},
			});

			const { result } = renderHook(() => useUserQueries(), { wrapper });

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			act(() => {
				result.current.handlePageChange(4);
			});

			expect(result.current.pagination.page).toBe(4);
		});
	});

	describe("Filters", () => {
		it("should handle filter changes", async () => {
			vi.mocked(apiClient.get).mockResolvedValue(mockQueriesResponse);

			const { result } = renderHook(() => useUserQueries(), { wrapper });

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			const newFilters = {
				subjects: [USER_QUERY_SUBJECT.TECHNICAL],
				dateFrom: "2024-01-01",
				dateTo: "2024-12-31",
				status: [USER_QUERY_STATUS.PENDING],
				sortBy: "createdAt" as const,
				sortOrder: "desc" as const,
			};

			act(() => {
				result.current.handleFiltersChange(newFilters);
			});

			expect(result.current.filters).toEqual(newFilters);
		});

		it("should reset page to 1 when filters change", async () => {
			vi.mocked(apiClient.get).mockResolvedValue(mockQueriesResponse);

			const { result } = renderHook(() => useUserQueries(), { wrapper });

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			// First change page
			act(() => {
				result.current.handlePageChange(3);
			});

			expect(result.current.pagination.page).toBe(3);

			// Then change filters
			act(() => {
				result.current.handleFiltersChange({
					subjects: [USER_QUERY_SUBJECT.BILLING],
					dateFrom: "",
					dateTo: "",
					status: [],
					sortBy: "createdAt",
					sortOrder: "desc",
				});
			});

			expect(result.current.pagination.page).toBe(1);
		});

		it("should handle multiple subject filters", async () => {
			vi.mocked(apiClient.get).mockResolvedValue(mockQueriesResponse);

			const { result } = renderHook(() => useUserQueries(), { wrapper });

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			act(() => {
				result.current.handleFiltersChange({
					subjects: [USER_QUERY_SUBJECT.TECHNICAL, USER_QUERY_SUBJECT.BILLING, USER_QUERY_SUBJECT.FEATURE],
					dateFrom: "",
					dateTo: "",
					status: [],
					sortBy: "createdAt",
					sortOrder: "desc",
				});
			});

			expect(result.current.filters.subjects).toHaveLength(3);
		});

		it("should handle multiple status filters", async () => {
			vi.mocked(apiClient.get).mockResolvedValue(mockQueriesResponse);

			const { result } = renderHook(() => useUserQueries(), { wrapper });

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			act(() => {
				result.current.handleFiltersChange({
					subjects: [],
					dateFrom: "",
					dateTo: "",
					status: [USER_QUERY_STATUS.PENDING, USER_QUERY_STATUS.IN_PROGRESS],
					sortBy: "createdAt",
					sortOrder: "desc",
				});
			});

			expect(result.current.filters.status).toHaveLength(2);
		});

		it("should handle date range filters", async () => {
			vi.mocked(apiClient.get).mockResolvedValue(mockQueriesResponse);

			const { result } = renderHook(() => useUserQueries(), { wrapper });

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			act(() => {
				result.current.handleFiltersChange({
					subjects: [],
					dateFrom: "2024-01-01",
					dateTo: "2024-12-31",
					status: [],
					sortBy: "createdAt",
					sortOrder: "desc",
				});
			});

			expect(result.current.filters.dateFrom).toBe("2024-01-01");
			expect(result.current.filters.dateTo).toBe("2024-12-31");
		});
	});

	describe("Search", () => {
		it("should handle search term change", async () => {
			vi.mocked(apiClient.get).mockResolvedValue(mockQueriesResponse);

			const { result } = renderHook(() => useUserQueries(), { wrapper });

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			act(() => {
				result.current.handleSearchChange("test search");
			});

			expect(result.current.searchTerm).toBe("test search");
		});

		it("should debounce search term", async () => {
			vi.useFakeTimers({ shouldAdvanceTime: true });
			vi.mocked(apiClient.get).mockResolvedValue(mockQueriesResponse);

			const { result } = renderHook(() => useUserQueries(), { wrapper });

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			act(() => {
				result.current.handleSearchChange("test");
			});

			expect(result.current.searchTerm).toBe("test");

			// Debounced search term should not update immediately
			act(() => {
				vi.advanceTimersByTime(100);
			});

			act(() => {
				result.current.handleSearchChange("test search");
			});

			// Wait for debounce
			act(() => {
				vi.advanceTimersByTime(500);
			});

			expect(result.current.searchTerm).toBe("test search");

			vi.useRealTimers();
		});

		it("should reset page to 1 when search changes", async () => {
			vi.mocked(apiClient.get).mockResolvedValue(mockQueriesResponse);

			const { result } = renderHook(() => useUserQueries(), { wrapper });

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			act(() => {
				result.current.handlePageChange(3);
			});

			expect(result.current.pagination.page).toBe(3);

			act(() => {
				result.current.handleSearchChange("search term");
			});

			expect(result.current.pagination.page).toBe(1);
		});

		it("should handle empty search term", async () => {
			vi.mocked(apiClient.get).mockResolvedValue(mockQueriesResponse);

			const { result } = renderHook(() => useUserQueries(), { wrapper });

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			act(() => {
				result.current.handleSearchChange("");
			});

			expect(result.current.searchTerm).toBe("");
		});

		it("should handle special characters in search", async () => {
			vi.mocked(apiClient.get).mockResolvedValue(mockQueriesResponse);

			const { result } = renderHook(() => useUserQueries(), { wrapper });

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			act(() => {
				result.current.handleSearchChange("test@example.com");
			});

			expect(result.current.searchTerm).toBe("test@example.com");
		});

		it("should collapse a burst of rapid search changes into a single debounced update", async () => {
			vi.useFakeTimers({ shouldAdvanceTime: true });
			vi.mocked(apiClient.get).mockResolvedValue(mockQueriesResponse);

			const { result } = renderHook(() => useUserQueries(), { wrapper });

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			// Each keystroke arrives before the 500ms window elapses, so the debounce keeps resetting.
			const intermediateTerms = ["a", "ab", "abc", "abcd"];
			for (const term of intermediateTerms) {
				act(() => {
					result.current.handleSearchChange(term);
				});
				act(() => {
					vi.advanceTimersByTime(100);
				});
			}

			act(() => {
				result.current.handleSearchChange("abcde");
			});

			act(() => {
				vi.advanceTimersByTime(500);
			});

			// Only the final term should ever reach a request; intermediate terms are collapsed away.
			await waitFor(() => {
				const urls = vi.mocked(apiClient.get).mock.calls.map((call) => call[0] as string);
				expect(urls.some((url) => url.includes("search=abcde"))).toBe(true);
			});

			const searchUrls = vi.mocked(apiClient.get).mock.calls.map((call) => call[0] as string);
			for (const term of intermediateTerms) {
				expect(searchUrls.some((url) => url.includes(`search=${term}&`) || url.endsWith(`search=${term}`))).toBe(false);
			}

			vi.useRealTimers();
		});

		it("should not fire the debounced update after unmount", async () => {
			vi.useFakeTimers({ shouldAdvanceTime: true });
			const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
			vi.mocked(apiClient.get).mockResolvedValue(mockQueriesResponse);

			const { result, unmount } = renderHook(() => useUserQueries(), { wrapper });

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			act(() => {
				result.current.handleSearchChange("unmount-term");
			});

			const callsBeforeUnmount = vi.mocked(apiClient.get).mock.calls.length;

			// Unmount before the 500ms window elapses; the cleanup should cancel the pending timer.
			unmount();

			act(() => {
				vi.advanceTimersByTime(500);
			});

			// No debounced state update fired, so no new request was made and no unmounted-update warning logged.
			expect(vi.mocked(apiClient.get).mock.calls.length).toBe(callsBeforeUnmount);
			const warned = consoleErrorSpy.mock.calls.some((call) => String(call[0]).includes("unmounted"));
			expect(warned).toBe(false);

			consoleErrorSpy.mockRestore();
			vi.useRealTimers();
		});
	});

	describe("Sorting", () => {
		it("should handle sort by createdAt", async () => {
			vi.mocked(apiClient.get).mockResolvedValue(mockQueriesResponse);

			const { result } = renderHook(() => useUserQueries(), { wrapper });

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			act(() => {
				result.current.handleSortChange("createdAt", "asc");
			});

			expect(result.current.filters.sortBy).toBe("createdAt");
			expect(result.current.filters.sortOrder).toBe("asc");
		});

		it("should handle sort by email", async () => {
			vi.mocked(apiClient.get).mockResolvedValue(mockQueriesResponse);

			const { result } = renderHook(() => useUserQueries(), { wrapper });

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			act(() => {
				result.current.handleSortChange("email", "desc");
			});

			expect(result.current.filters.sortBy).toBe("email");
			expect(result.current.filters.sortOrder).toBe("desc");
		});

		it("should toggle sort order when sortOrder not provided", async () => {
			vi.mocked(apiClient.get).mockResolvedValue(mockQueriesResponse);

			const { result } = renderHook(() => useUserQueries(), { wrapper });

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			// Initial sort order is desc
			expect(result.current.filters.sortOrder).toBe("desc");

			act(() => {
				result.current.handleSortChange("createdAt");
			});

			// Should toggle to asc
			expect(result.current.filters.sortOrder).toBe("asc");

			act(() => {
				result.current.handleSortChange("createdAt");
			});

			// Should toggle back to desc
			expect(result.current.filters.sortOrder).toBe("desc");
		});

		it("should maintain sortBy when toggling order", async () => {
			vi.mocked(apiClient.get).mockResolvedValue(mockQueriesResponse);

			const { result } = renderHook(() => useUserQueries(), { wrapper });

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			act(() => {
				result.current.handleSortChange("email", "asc");
			});

			expect(result.current.filters.sortBy).toBe("email");

			act(() => {
				result.current.handleSortChange("email");
			});

			expect(result.current.filters.sortBy).toBe("email");
			expect(result.current.filters.sortOrder).toBe("desc");
		});
	});

	describe("Refetch", () => {
		it("should refetch queries", async () => {
			vi.mocked(apiClient.get).mockResolvedValue(mockQueriesResponse);

			const { result } = renderHook(() => useUserQueries(), { wrapper });

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			const initialCallCount = vi.mocked(apiClient.get).mock.calls.length;

			await act(async () => {
				await result.current.refetch();
			});

			expect(vi.mocked(apiClient.get).mock.calls.length).toBeGreaterThan(initialCallCount);
		});

		it("should handle refetch error", async () => {
			vi.mocked(apiClient.get)
				.mockResolvedValueOnce(mockQueriesResponse)
				.mockRejectedValueOnce(new Error("Refetch failed"));

			const { result } = renderHook(() => useUserQueries(), { wrapper });

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			await act(async () => {
				await result.current.refetch();
			});

			// Should still have the previous data
			expect(result.current.queries).toEqual([mockUserQuery]);
		});
	});

	describe("Query String Building", () => {
		it("should build query string with all filters", async () => {
			vi.useFakeTimers({ shouldAdvanceTime: true });
			vi.mocked(apiClient.get).mockResolvedValue(mockQueriesResponse);

			const { result } = renderHook(() => useUserQueries(), { wrapper });

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			act(() => {
				result.current.handleFiltersChange({
					subjects: [USER_QUERY_SUBJECT.TECHNICAL],
					dateFrom: "2024-01-01",
					dateTo: "2024-12-31",
					status: [USER_QUERY_STATUS.PENDING],
					sortBy: "createdAt",
					sortOrder: "asc",
				});
			});

			act(() => {
				result.current.handleSearchChange("test");
			});

			act(() => {
				vi.advanceTimersByTime(500);
			});

			await waitFor(() => {
				const lastCall = vi.mocked(apiClient.get).mock.calls[vi.mocked(apiClient.get).mock.calls.length - 1]!;
				const url = lastCall[0] as string;

				expect(url).toContain("subjects=");
				expect(url).toContain("status=");
				expect(url).toContain("dateFrom=");
				expect(url).toContain("dateTo=");
				expect(url).toContain("search=");
				expect(url).toContain("sortBy=");
				expect(url).toContain("sortOrder=");
			});

			vi.useRealTimers();
		});

		it("should build query string with pagination", async () => {
			vi.mocked(apiClient.get).mockResolvedValue(getApiResponse({ pageSize: 25 }));

			const { result } = renderHook(() => useUserQueries({ pageSize: 25 }), {
				wrapper,
			});

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			act(() => {
				result.current.handlePageChange(2);
			});

			await waitFor(() => {
				const lastCall = vi.mocked(apiClient.get).mock.calls[vi.mocked(apiClient.get).mock.calls.length - 1]!;
				const url = lastCall[0] as string;

				expect(url).toContain("page=2");
				expect(url).toContain("size=25");
			});
		});
	});

	describe("Edge Cases", () => {
		it("should handle undefined data from API", async () => {
			vi.mocked(apiClient.get).mockResolvedValue({
				data: {
					data: undefined,
				},
			});

			const { result } = renderHook(() => useUserQueries(), { wrapper });

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			expect(result.current.queries).toEqual([]);
		});

		it("should handle null items in response", async () => {
			vi.mocked(apiClient.get).mockResolvedValue({
				data: {
					data: [
						{
							items: null,
							total: 0,
							page: 1,
							pageSize: 15,
						},
					],
				},
			});

			const { result } = renderHook(() => useUserQueries(), { wrapper });

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			expect(result.current.queries).toEqual([]);
		});

		it("should handle very large page numbers", async () => {
			vi.mocked(apiClient.get).mockResolvedValue(mockQueriesResponse);

			const { result } = renderHook(() => useUserQueries(), { wrapper });

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			act(() => {
				result.current.handlePageChange(9999);
			});

			expect(result.current.pagination.page).toBe(9999);
		});

		it("should handle zero total items", async () => {
			vi.mocked(apiClient.get).mockResolvedValue({
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
			});

			const { result } = renderHook(() => useUserQueries(), { wrapper });

			await waitFor(() => {
				expect(result.current.pagination.totalPages).toBe(0);
			});
		});

		it("should handle rapid filter changes", async () => {
			vi.mocked(apiClient.get).mockResolvedValue(mockQueriesResponse);

			const { result } = renderHook(() => useUserQueries(), { wrapper });

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			act(() => {
				result.current.handleFiltersChange({
					subjects: [USER_QUERY_SUBJECT.TECHNICAL],
					dateFrom: "",
					dateTo: "",
					status: [],
					sortBy: "createdAt",
					sortOrder: "desc",
				});
				result.current.handleFiltersChange({
					subjects: [USER_QUERY_SUBJECT.BILLING],
					dateFrom: "",
					dateTo: "",
					status: [],
					sortBy: "createdAt",
					sortOrder: "desc",
				});
				result.current.handleFiltersChange({
					subjects: [USER_QUERY_SUBJECT.FEATURE],
					dateFrom: "",
					dateTo: "",
					status: [],
					sortBy: "createdAt",
					sortOrder: "desc",
				});
			});

			expect(result.current.filters.subjects).toEqual([USER_QUERY_SUBJECT.FEATURE]);
		});
	});
});
