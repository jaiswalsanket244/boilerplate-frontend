export interface IPagination {
	currentPage: number;
	pageSize: number;
	totalCount: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
	nextPage: number | null;
	previousPage: number | null;
}

export interface PaginatedResponse<T> {
	data: T[];
	pagination: IPagination;
}
