import { useState } from "react";

interface UsePaginationProps {
	initialPage?: number;
	initialPageSize?: number;
}

export function usePagination({ initialPage = 1, initialPageSize = 10 }: UsePaginationProps = {}) {
	const [page, setPage] = useState<number>(initialPage);
	const [pageSize, setPageSize] = useState<number>(initialPageSize);

	const handlePageChange = (newPage: number, totalPages: number) => {
		if (newPage < 1 || newPage > totalPages) return;
		setPage(newPage);
	};

	const handlePageSizeChange = (newPageSize: number) => {
		setPageSize(newPageSize);
		setPage(1); // Reset to first page when page size changes
	};

	const calculateTotalPages = (totalItems: number) => {
		return Math.ceil(totalItems / pageSize);
	};

	return {
		page,
		pageSize,
		handlePageChange,
		handlePageSizeChange,
		calculateTotalPages,
	};
}
