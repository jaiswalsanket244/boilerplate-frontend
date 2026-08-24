import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";

export interface FilterOption {
	label: string;
	value: string;
}

export enum FILTER_TYPE {
	SELECT = "select",
	RADIO = "radio",
	MULTISELECT = "multiselect",
	DATE = "date",
	DATERANGE = "daterange",
	RANGE = "range",
	SEARCH = "search",
}

export interface FilterColumn {
	key: string;
	label: string;
	type: FILTER_TYPE;
	options?: FilterOption[];
	min?: number;
	max?: number;
	step?: number;
	placeholder?: string;
}

export interface FilterControlProps {
	filterableColumns: FilterColumn[];
	filters: ColumnFiltersState;
	onFilterChange: (filters: ColumnFiltersState) => void;
	className?: string;
	children?: React.ReactNode;
	onApplyFilters?: (() => void) | ((filters: ColumnFiltersState) => void);
}

export interface DateFilterProps {
	dateFrom?: string;
	dateTo?: string;
	onDateFromChange?: (date?: string) => void;
	onDateToChange?: (date?: string) => void;
	type?: "date" | "date-range";
	onDateChange?: (date?: string) => void;
}

export interface DatePickerButtonProps {
	date?: string;
	placeholder: string;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onDateSelect: (date: Date | undefined) => void;
}

export interface RangeSliderProps {
	min: number;
	max: number;
	step?: number;
	value: [number, number];
	onChange: (value: [number, number]) => void;
	label: string;
}

export interface SortableColumn {
	key: string;
	label: string;
	ascLabel?: string;
	descLabel?: string;
}

export interface SortControlProps {
	sortableColumns: { key: string; label: string; ascLabel?: string; descLabel?: string }[];
	sorting: SortingState;
	onSortChange: (sorting: SortingState) => void;
	children?: React.ReactNode;
}

export enum TIME_FRAMES {
	YEARLY = "yearly",
	MONTHLY = "monthly",
	WEEKLY = "weekly",
	DAILY = "daily",
}
