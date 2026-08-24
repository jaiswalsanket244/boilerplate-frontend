import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import type { FilterColumn, SortableColumn } from "@/types/filters";

export interface TabConfig<T extends string> {
	key: T;
	label: string;
}

export interface ActionButton {
	label: string;
	icon?: React.ReactNode;
	variant?: "default" | "outline" | "ghost";
	className?: string;
	onClick: () => void;
	visible?: boolean;
}

export type TableAction = React.ReactElement<any>;

export type TableActions = TableAction[];

export interface TabState {
	search: string;
	sorting: Array<{ id: string; desc: boolean }>;
	filters: ColumnFiltersState;
	page: number;
	pageSize: number;
}

export interface DataResponse<TData> {
	data: TData[];
	totalCount: number;
	currentPage: number;
	totalPages: number;
}

export interface DataTabsProps<TData, TTabType extends string> {
	// Tab configuration
	tabs: TabConfig<TTabType>[];
	defaultTab: TTabType;

	data: DataResponse<TData> | null;
	isLoading: boolean;
	onTabChange: (tab: TTabType, params: FilterState) => void;

	searchPlaceholder?: string;

	sortableColumns: SortableColumn[];

	filterableColumns: FilterColumn[];

	actionButtons?: ActionButton[];

	actions?: TableActions;

	TableComponent: React.ComponentType<{
		data: TData[];
		sorting: SortingState;
		setSorting: (sorting: SortingState | ((old: SortingState) => SortingState)) => void;
		filters: ColumnFiltersState;
		setFilters: (filters: ColumnFiltersState | ((old: ColumnFiltersState) => ColumnFiltersState)) => void;
		activeTab: TTabType;
	}>;

	defaultPageSize?: number;
	className?: string;

	tabCounts?: Record<TTabType, number>;

	onApplyFilters?: (() => void) | ((filters: ColumnFiltersState) => void);
}

export interface FilterState {
	search: string;
	sorting: SortingState;
	filters: ColumnFiltersState;
	page: number;
	pageSize: number;
}
