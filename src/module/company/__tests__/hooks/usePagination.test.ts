import { usePagination } from "@/module/company/hooks/usePagination";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("usePagination Hook", () => {
	describe("Initialization", () => {
		it("should initialize with default values", () => {
			const { result } = renderHook(() => usePagination());

			expect(result.current.page).toBe(1);
			expect(result.current.pageSize).toBe(10);
		});

		it("should initialize with custom initial page", () => {
			const { result } = renderHook(() => usePagination({ initialPage: 5 }));

			expect(result.current.page).toBe(5);
			expect(result.current.pageSize).toBe(10);
		});

		it("should initialize with custom initial page size", () => {
			const { result } = renderHook(() => usePagination({ initialPageSize: 25 }));

			expect(result.current.page).toBe(1);
			expect(result.current.pageSize).toBe(25);
		});

		it("should initialize with both custom page and page size", () => {
			const { result } = renderHook(() => usePagination({ initialPage: 3, initialPageSize: 50 }));

			expect(result.current.page).toBe(3);
			expect(result.current.pageSize).toBe(50);
		});
	});

	describe("handlePageChange", () => {
		it("should change to a valid page", () => {
			const { result } = renderHook(() => usePagination());

			act(() => {
				result.current.handlePageChange(2, 10);
			});

			expect(result.current.page).toBe(2);
		});

		it("should not change to page less than 1", () => {
			const { result } = renderHook(() => usePagination({ initialPage: 2 }));

			act(() => {
				result.current.handlePageChange(0, 10);
			});

			expect(result.current.page).toBe(2);
		});

		it("should not change to page greater than total pages", () => {
			const { result } = renderHook(() => usePagination({ initialPage: 5 }));

			act(() => {
				result.current.handlePageChange(11, 10);
			});

			expect(result.current.page).toBe(5);
		});

		it("should allow changing to the last page", () => {
			const { result } = renderHook(() => usePagination());

			act(() => {
				result.current.handlePageChange(10, 10);
			});

			expect(result.current.page).toBe(10);
		});

		it("should allow changing to the first page", () => {
			const { result } = renderHook(() => usePagination({ initialPage: 5 }));

			act(() => {
				result.current.handlePageChange(1, 10);
			});

			expect(result.current.page).toBe(1);
		});

		it("should handle multiple consecutive page changes", () => {
			const { result } = renderHook(() => usePagination());

			act(() => {
				result.current.handlePageChange(2, 10);
			});
			expect(result.current.page).toBe(2);

			act(() => {
				result.current.handlePageChange(3, 10);
			});
			expect(result.current.page).toBe(3);

			act(() => {
				result.current.handlePageChange(1, 10);
			});
			expect(result.current.page).toBe(1);
		});
	});

	describe("handlePageSizeChange", () => {
		it("should change page size", () => {
			const { result } = renderHook(() => usePagination());

			act(() => {
				result.current.handlePageSizeChange(25);
			});

			expect(result.current.pageSize).toBe(25);
		});

		it("should reset page to 1 when page size changes", () => {
			const { result } = renderHook(() => usePagination({ initialPage: 5 }));

			act(() => {
				result.current.handlePageSizeChange(50);
			});

			expect(result.current.page).toBe(1);
			expect(result.current.pageSize).toBe(50);
		});

		it("should handle changing to different page sizes", () => {
			const { result } = renderHook(() => usePagination());

			const pageSizes = [25, 50, 100, 10];

			pageSizes.forEach((size) => {
				act(() => {
					result.current.handlePageSizeChange(size);
				});

				expect(result.current.pageSize).toBe(size);
				expect(result.current.page).toBe(1);
			});
		});
	});

	describe("calculateTotalPages", () => {
		it("should calculate total pages correctly", () => {
			const { result } = renderHook(() => usePagination({ initialPageSize: 10 }));

			expect(result.current.calculateTotalPages(100)).toBe(10);
		});

		it("should round up for partial pages", () => {
			const { result } = renderHook(() => usePagination({ initialPageSize: 10 }));

			expect(result.current.calculateTotalPages(95)).toBe(10);
		});

		it("should return 0 for 0 items", () => {
			const { result } = renderHook(() => usePagination());

			expect(result.current.calculateTotalPages(0)).toBe(0);
		});

		it("should return 1 for items less than page size", () => {
			const { result } = renderHook(() => usePagination({ initialPageSize: 10 }));

			expect(result.current.calculateTotalPages(5)).toBe(1);
		});

		it("should calculate correctly with different page sizes", () => {
			const { result } = renderHook(() => usePagination({ initialPageSize: 25 }));

			expect(result.current.calculateTotalPages(100)).toBe(4);
			expect(result.current.calculateTotalPages(101)).toBe(5);
		});

		it("should handle large numbers", () => {
			const { result } = renderHook(() => usePagination({ initialPageSize: 10 }));

			expect(result.current.calculateTotalPages(10000)).toBe(1000);
		});

		it("should recalculate when page size changes", () => {
			const { result } = renderHook(() => usePagination({ initialPageSize: 10 }));

			expect(result.current.calculateTotalPages(100)).toBe(10);

			act(() => {
				result.current.handlePageSizeChange(25);
			});

			expect(result.current.calculateTotalPages(100)).toBe(4);
		});
	});

	describe("Integration Scenarios", () => {
		it("should handle complete pagination workflow", () => {
			const { result } = renderHook(() => usePagination());
			const totalItems = 100;

			// Initial state
			expect(result.current.page).toBe(1);
			expect(result.current.pageSize).toBe(10);
			expect(result.current.calculateTotalPages(totalItems)).toBe(10);

			// Navigate to page 5
			act(() => {
				result.current.handlePageChange(5, 10);
			});
			expect(result.current.page).toBe(5);

			// Change page size (should reset to page 1)
			act(() => {
				result.current.handlePageSizeChange(25);
			});
			expect(result.current.page).toBe(1);
			expect(result.current.pageSize).toBe(25);
			expect(result.current.calculateTotalPages(totalItems)).toBe(4);

			// Navigate to last page
			act(() => {
				result.current.handlePageChange(4, 4);
			});
			expect(result.current.page).toBe(4);
		});

		it("should prevent navigation beyond boundaries", () => {
			const { result } = renderHook(() => usePagination());
			const totalPages = 5;

			// Try to go to page 0
			act(() => {
				result.current.handlePageChange(0, totalPages);
			});
			expect(result.current.page).toBe(1);

			// Try to go beyond total pages
			act(() => {
				result.current.handlePageChange(10, totalPages);
			});
			expect(result.current.page).toBe(1);

			// Valid navigation
			act(() => {
				result.current.handlePageChange(3, totalPages);
			});
			expect(result.current.page).toBe(3);
		});
	});

	describe("Edge Cases", () => {
		it("should handle negative page numbers", () => {
			const { result } = renderHook(() => usePagination());

			act(() => {
				result.current.handlePageChange(-5, 10);
			});

			expect(result.current.page).toBe(1);
		});

		it("should handle zero as total pages", () => {
			const { result } = renderHook(() => usePagination());

			act(() => {
				result.current.handlePageChange(1, 0);
			});

			expect(result.current.page).toBe(1);
		});

		it("should handle very large page sizes", () => {
			const { result } = renderHook(() => usePagination());

			act(() => {
				result.current.handlePageSizeChange(1000);
			});

			expect(result.current.pageSize).toBe(1000);
			expect(result.current.calculateTotalPages(10000)).toBe(10);
		});

		it("should handle fractional total items in calculation", () => {
			const { result } = renderHook(() => usePagination({ initialPageSize: 10 }));

			// Should still work even though fractional items don't make sense in practice
			expect(result.current.calculateTotalPages(95.5)).toBe(10);
		});
	});
});
