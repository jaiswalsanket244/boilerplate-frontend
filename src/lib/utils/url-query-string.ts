import type { FilterColumn, SortableColumn } from "@/types/filters";
import type { ColumnFilter, ColumnFiltersState, SortingState } from "@tanstack/react-table";

export const VALUE_SEPARATOR_DELIMETER = ",";
export const RANGE_DELIMETER = "|";
export const RANGE_VALUE_DELIMETER = "#";

/**
 * Convert filters and sorting arrays to query string with type information
 */
export function getQueryString({
	filters,
	sorting,
	filterableColumns,
	searchTerm,
	page = 1,
	pageSize = 10,
}: {
	filters: ColumnFiltersState;
	sorting: SortingState;
	filterableColumns: FilterColumn[];
	searchTerm?: string;
	page?: number;
	pageSize?: number;
}): string {
	const params = new URLSearchParams();

	if (searchTerm?.trim()) {
		params.set("search", searchTerm);
	}

	params.set("page", page.toString());
	params.set("pageSize", pageSize.toString());

	filters.forEach((filter) => {
		const column = filterableColumns.find((c) => c.key === filter.id);
		if (!column) return;

		if (Array.isArray(filter.value)) {
			// if it's an array, it's a multi-select and we need to join the values
			if (filter.value.length > 0) {
				params.set(`${filter.id}`, `${column?.type}${RANGE_VALUE_DELIMETER}${filter.value.join(",")}`);
			}
		} else if (filter.value && typeof filter.value === "object" && column?.type === "daterange") {
			const dateRange = filter.value as {
				from: string;
				to: string;
			};

			if (!dateRange.from && !dateRange.to) return;

			params.set(`${filter.id}`, `daterange${RANGE_VALUE_DELIMETER}${dateRange.from}${RANGE_DELIMETER}${dateRange.to}`);
		} else if (filter.value && typeof filter.value !== "object") {
			params.set(`${filter.id}`, `${column?.type}${RANGE_VALUE_DELIMETER}${filter.value.toString()}`);
		}
	});

	// Process sorting
	if (sorting.length > 0) {
		const sortString = sorting
			.map((sort) => `${sort.id}${RANGE_VALUE_DELIMETER}${sort.desc ? "desc" : "asc"}`)
			.join(",");
		params.set("sort", sortString);
	}

	return params.toString();
}

/**
 * Parse query string back to filters and sorting arrays (Frontend version with column definitions)
 */
export function parseQueryString(
	queryString: string,
	filterColumns: FilterColumn[],
	sortableColumns: SortableColumn[]
): { filters: ColumnFiltersState; sorting: SortingState } {
	const params = new URLSearchParams(queryString);
	const filters: ColumnFiltersState = [];
	const sorting: SortingState = [];

	// Create maps for quick lookup
	const filterColumnMap = new Map(filterColumns.map((col) => [col.key, col]));
	const sortableColumnMap = new Map(sortableColumns.map((col) => [col.key, col]));

	// Process filter parameters
	for (const [key, value] of params.entries()) {
		if (key === "sort") continue; // Skip sort parameter

		if (filterColumnMap.has(key)) {
			const parsedFilter = parseFilterValue(key, value);
			if (parsedFilter) {
				filters.push(parsedFilter);
			}
		}
	}

	// Process sorting
	const sortParam = params.get("sort");
	if (sortParam) {
		const sortItems = sortParam.split(",");
		sortItems.forEach((item) => {
			const [id, direction] = item.split(RANGE_VALUE_DELIMETER);
			if (!id || !direction) return;
			if (sortableColumnMap.has(id)) {
				sorting.push({
					id,
					desc: direction === "desc",
				});
			}
		});
	}

	return { filters, sorting };
}

/**
 * Helper function to parse filter values with type information
 */
function parseFilterValue(id: string, value: string): ColumnFilter | null {
	if (value.startsWith("multiselect:")) {
		const filterValue = value.replace("multiselect:", "");
		return {
			id,
			value: filterValue.split(","),
		};
	} else if (value.startsWith("range:")) {
		const filterValue = value.replace("range:", "");
		const rangeValues = filterValue.split(",").map(Number);
		if (rangeValues.length >= 2 && !isNaN(rangeValues[0]!) && !isNaN(rangeValues[1]!)) {
			return {
				id,
				value: rangeValues,
			};
		}
	} else if (value.startsWith("daterange:")) {
		const filterValue = value.replace("daterange:", "");
		const [from, to] = filterValue.split(RANGE_DELIMETER);

		return {
			id,
			value: { from, to },
		};
	}
	return null;
}
