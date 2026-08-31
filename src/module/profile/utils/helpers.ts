import {
	DIGEST_FREQUENCY,
	type FilterState,
	type INotificationPreference,
	NOTIFICATION_CHANNELS,
	NOTIFICATION_TYPES,
	type TSortBy,
	USER_QUERY_STATUS,
} from "@/module/profile/types";

export const getStatusStyles = (status: string) => {
	switch (status) {
		case USER_QUERY_STATUS.PENDING:
			return "bg-yellow-50 text-yellow-700 border-yellow-100";
		case USER_QUERY_STATUS.RESOLVED:
			return "bg-green-50 text-green-700 border-green-100";
		case USER_QUERY_STATUS.CLOSED:
			return "bg-gray-100 text-gray-900 border-gray-200";
		case USER_QUERY_STATUS.IN_PROGRESS:
			return "bg-blue-50 text-blue-700 border-blue-100";
		default:
			return "bg-gray-100 text-gray-900 border-gray-200";
	}
};

export const getUserNameInitials = (name: string) => {
	return name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase();
};

/**
 * Builds a query string from filter state and pagination options
 */
export const buildQueryString = (
	filters: Partial<FilterState>,
	page?: number,
	size?: number,
	searchTerm?: string
): string => {
	const params = new URLSearchParams();

	if (filters.subjects && filters.subjects.length > 0) {
		params.append("subjects", filters.subjects.join(","));
	}

	if (filters.status && filters.status.length > 0) {
		params.append("status", filters.status.join(","));
	}

	if (filters.dateFrom) {
		params.append("dateFrom", filters.dateFrom);
	}

	if (filters.dateTo) {
		params.append("dateTo", filters.dateTo);
	}

	if (searchTerm) {
		params.append("search", searchTerm);
	}

	if (page) {
		params.append("page", page.toString());
	}

	if (size) {
		params.append("size", size.toString());
	}

	if (filters.sortBy) {
		params.append("sortBy", filters.sortBy);
	}

	if (filters.sortOrder) {
		params.append("sortOrder", filters.sortOrder);
	}

	return params.toString();
};

/**
 * Parses a query string back into filter state and pagination
 */
export const parseQueryString = (
	queryString: string
): {
	filters: Partial<FilterState>;
	page?: number;
	size?: number;
	searchTerm?: string;
} => {
	const params = new URLSearchParams(queryString);
	const result: {
		filters: Partial<FilterState>;
		page?: number;
		size?: number;
		searchTerm?: string;
	} = {
		filters: {},
	};

	// Parse filter parameters
	const subjects = params.get("subjects");
	if (subjects) {
		result.filters.subjects = subjects.split(",");
	}

	const status = params.get("status");
	if (status) {
		result.filters.status = status.split(",");
	}

	const dateFrom = params.get("dateFrom");
	if (dateFrom) {
		result.filters.dateFrom = dateFrom;
	}

	const dateTo = params.get("dateTo");
	if (dateTo) {
		result.filters.dateTo = dateTo;
	}

	// Parse search term
	const search = params.get("search");
	if (search) {
		result.searchTerm = search;
	}

	// Parse pagination parameters
	const page = params.get("page");
	if (page) {
		result.page = parseInt(page, 10);
	}

	const size = params.get("size");
	if (size) {
		result.size = parseInt(size, 10);
	}

	// Parse sorting parameters
	const sortBy = params.get("sortBy");
	if (sortBy) {
		result.filters.sortBy = sortBy as TSortBy;
	}

	const sortOrder = params.get("sortOrder");
	if (sortOrder) {
		result.filters.sortOrder = sortOrder as "asc" | "desc";
	}

	return result;
};

export const getDefaultNotificationPreferences = (): Record<NOTIFICATION_TYPES, INotificationPreference> => {
	const preference = {
		[NOTIFICATION_CHANNELS.PUSH]: false,
		[NOTIFICATION_CHANNELS.EMAIL]: false,
		[NOTIFICATION_CHANNELS.IN_APP]: false,
		digestFrequency: DIGEST_FREQUENCY.OFF,
	};

	const defaults = Object.values(NOTIFICATION_TYPES).reduce(
		(acc, type) => {
			acc[type] = { ...preference };
			return acc;
		},
		{} as Record<NOTIFICATION_TYPES, INotificationPreference>
	);

	return defaults;
};
