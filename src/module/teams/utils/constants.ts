import { FILTER_TYPE } from "@/types/filters";

export const teamSortableColumns = [
	{ key: "createdAt", label: "Date of Joining", ascLabel: "Oldest to Newest", descLabel: "Newest to Oldest" },
];

export const teamFilterableColumns = [
	{
		key: "roles",
		label: "Role",
		type: FILTER_TYPE.MULTISELECT,
		options: [
			{ value: "ADMIN", label: "ADMIN" },
			{ value: "USER", label: "USER" },
		],
	},
	{
		key: "createdAt",
		label: "Date of Joining",
		type: FILTER_TYPE.DATE,
	},
];

export const FILE_CONSTRAINTS = {
	MAX_SIZE_MB: 10,
	MAX_RECORDS: 1000,
	ACCEPTED_EXTENSIONS: [".xlsx", ".xls"],
	BATCH_SIZE: 50,
} as const;

export const VALIDATION_PATTERNS = {
	EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
	NAME: /^[a-zA-Z0-9\s\-']{2,}$/,
} as const;

export const ERROR_MESSAGES = {
	INVALID_FILE_TYPE: "Please upload a valid Excel file (.xlsx or .xls)",
	FILE_TOO_LARGE: `File size should be less than ${FILE_CONSTRAINTS.MAX_SIZE_MB}MB`,
	NO_SHEETS: "Uploaded Excel file contains no sheets.",
	NO_DATA: "No data found in Excel file",
	TOO_MANY_RECORDS: `Max ${FILE_CONSTRAINTS.MAX_RECORDS} records allowed`,
	MISSING_COLUMNS: "Excel file must contain: Email, First Name, Last Name columns",
} as const;
