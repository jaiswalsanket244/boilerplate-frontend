import { debounce } from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";

import useUserQueryAPI from "@/module/profile/hooks/useUserQueryAPI";
import type { FilterState, IPaginationState, IUseUserQueriesProps, TSortBy, TSortOrder } from "@/module/profile/types";
import { buildQueryString } from "@/module/profile/utils/helpers";

export const useUserQueries = ({ initialFilters = {}, pageSize = 15 }: IUseUserQueriesProps = {}) => {
	const { useGetAllQueries } = useUserQueryAPI();

	const [filters, setFilters] = useState<FilterState>({
		subjects: [],
		dateFrom: "",
		dateTo: "",
		status: [],
		sortBy: "createdAt",
		sortOrder: "desc",
		...initialFilters,
	});

	const [searchTerm, setSearchTerm] = useState("");
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
	const [pagination, setPagination] = useState<IPaginationState>({
		page: 1,
		size: pageSize,
		totalPages: 1,
		totalItems: 0,
	});

	const queryString = buildQueryString(filters, pagination.page, pagination.size, debouncedSearchTerm);

	const { data, isPending, error, refetch } = useGetAllQueries(queryString);

	const queries = data?.items || [];

	useEffect(() => {
		if (!data) return;

		setPagination({
			page: data?.page || 1,
			size: data?.pageSize || pageSize,
			totalPages: Math.ceil(Number(data?.total) / pageSize),
			totalItems: data.total,
		});
	}, [data, pageSize]);

	const handlePageChange = (page: number) => {
		setPagination((prev) => ({ ...prev, page }));
	};

	const handleFiltersChange = (newFilters: FilterState) => {
		setFilters(newFilters);

		setPagination((prev) => ({ ...prev, page: 1 }));
	};

	// Created once so a single pending timer exists at a time; recreating it per render
	// would leak uncancelled timers that can fire after unmount.
	const debouncedSearchChange = useMemo(
		() =>
			debounce((term: string) => {
				setDebouncedSearchTerm(term);
			}, 500),
		[]
	);

	// Cancel the pending timer on unmount so no state update/request fires afterward.
	useEffect(() => () => debouncedSearchChange.cancel(), [debouncedSearchChange]);

	const handleSearchChange = useCallback(
		(term: string) => {
			setSearchTerm(term);

			debouncedSearchChange(term);

			setPagination((prev) => ({ ...prev, page: 1 }));
		},
		[debouncedSearchChange]
	);

	const handleSortChange = (sortBy: TSortBy, sortOrder?: TSortOrder) => {
		setFilters((prev) => {
			return {
				...prev,
				sortBy: sortBy,
				sortOrder: sortOrder ? sortOrder : prev.sortOrder === "asc" ? "desc" : "asc",
			};
		});
	};

	const handleRefetch = useCallback(async () => {
		await refetch();
	}, [refetch]);

	return {
		queries,
		isLoading: isPending,
		error,
		refetch: handleRefetch,
		filters,
		searchTerm,
		pagination,
		handleFiltersChange,
		handleSearchChange,
		handlePageChange,
		handleSortChange,
	};
};
