"use client";

import FilterControl from "@/components/common/filter/filter-control";
import { Pagination } from "@/components/common/pagination/pagination";
import SearchBox from "@/components/common/search-box/search-box";
import { SortControl } from "@/components/common/sort/sort";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DataTabsProps, TabState } from "@/types/tabs";
import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { Loader2 } from "lucide-react";
import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { debounce } from "lodash";

export function DataTabs<TData, TTabType extends string>({
	tabs,
	defaultTab,
	data,
	isLoading,
	onTabChange,
	searchPlaceholder = "Search",
	sortableColumns,
	filterableColumns,
	actionButtons = [],
	TableComponent,
	defaultPageSize = 10,
	className = "",
	tabCounts = {} as Record<TTabType, number>,
	actions,
	onApplyFilters,
}: DataTabsProps<TData, TTabType>) {
	const [activeTab, setActiveTab] = useState<TTabType>(defaultTab);

	const [tabStates, setTabStates] = useState<Record<TTabType, TabState>>(
		tabs.reduce(
			(acc, tab) => {
				acc[tab.key] = {
					search: "",
					sorting: [],
					filters: [],
					page: 1,
					pageSize: defaultPageSize,
				};
				return acc;
			},
			{} as Record<TTabType, TabState>
		)
	);

	const currentTabState = tabStates[activeTab];

	// Trigger data fetch when parameters change
	const triggerDataFetch = (newState?: Partial<TabState>, from?: string) => {
		const state = newState ? { ...currentTabState, ...newState } : currentTabState;

		onTabChange(activeTab, {
			search: state.search,
			sorting: state.sorting,
			filters: state.filters,
			page: state.page,
			pageSize: state.pageSize,
		});
	};

	const debouncedSearch = useCallback(
		debounce((newState: Partial<TabState>) => {
			triggerDataFetch(newState, "search");
		}, 500),
		[activeTab]
	);
	// Event handlers
	const handleInputChange = useCallback(
		(value: string) => {
			const newState = { search: value, page: 1 };
			setTabStates((prev) => ({
				...prev,
				[activeTab]: { ...prev[activeTab], ...newState },
			}));
			debouncedSearch(newState);
		},
		[debouncedSearch, activeTab]
	);

	const handlePageChange = (newPage: number) => {
		if (!data) return;
		if (newPage < 1 || newPage > data.totalPages) return;

		const newState = { page: newPage };
		setTabStates((prev) => ({
			...prev,
			[activeTab]: { ...prev[activeTab], ...newState },
		}));
		triggerDataFetch(newState, "page changes");
	};

	const handlePageSizeChange = (newPageSize: number) => {
		const newState = { pageSize: newPageSize, page: 1 };
		setTabStates((prev) => ({
			...prev,
			[activeTab]: { ...prev[activeTab], ...newState },
		}));
		triggerDataFetch(newState, "page size change");
	};

	const handleSortChange = (updaterOrValue: SortingState | ((old: SortingState) => SortingState)) => {
		setTabStates((prev) => {
			const currentSorting = prev[activeTab].sorting;
			const newSorting = typeof updaterOrValue === "function" ? updaterOrValue(currentSorting) : updaterOrValue;

			const newState = { sorting: newSorting, page: 1 };
			const updatedStates = {
				...prev,
				[activeTab]: { ...prev[activeTab], ...newState },
			};

			// Trigger data fetch with new sorting
			setTimeout(() => {
				onTabChange(activeTab, {
					search: updatedStates[activeTab].search,
					sorting: newSorting,
					filters: updatedStates[activeTab].filters,
					page: 1,
					pageSize: updatedStates[activeTab].pageSize,
				});
			}, 0);

			return updatedStates;
		});
	};

	const handleFilterChange = (
		updaterOrValue: ColumnFiltersState | ((old: ColumnFiltersState) => ColumnFiltersState)
	) => {
		setTabStates((prev) => {
			const currentFilters = prev[activeTab].filters;
			const newFilters = typeof updaterOrValue === "function" ? updaterOrValue(currentFilters) : updaterOrValue;

			const newState = { filters: newFilters, page: 1 };
			const updatedStates = {
				...prev,
				[activeTab]: { ...prev[activeTab], ...newState },
			};

			// Trigger data fetch with new filters
			setTimeout(() => {
				onTabChange(activeTab, {
					search: updatedStates[activeTab].search,
					sorting: updatedStates[activeTab].sorting,
					filters: newFilters,
					page: 1,
					pageSize: updatedStates[activeTab].pageSize,
				});
			}, 0);

			return updatedStates;
		});
	};

	const handleTabChange = (value: string) => {
		const newTab = value as TTabType;

		setActiveTab(newTab);

		// Fetch data for the new tab with its current state
		const newTabState = tabStates[newTab];
		onTabChange(newTab, {
			search: newTabState.search,
			sorting: newTabState.sorting,
			filters: newTabState.filters,
			page: newTabState.page,
			pageSize: newTabState.pageSize,
		});
	};

	return (
		<div className={className}>
			<Tabs defaultValue={defaultTab} className="w-full" onValueChange={handleTabChange}>
				<TabsList
					className={cn("h-auto w-full justify-start gap-0 rounded-none border-b border-gray-200 bg-transparent p-0")}
				>
					{tabs.map((tab) => (
						<TabsTrigger
							key={tab.key}
							value={tab.key}
							className={cn(
								"relative mr-8 rounded-none border-none bg-transparent px-0 py-3 shadow-none",
								"text-txt-secondary hover:text-txt-secondary-500 text-sm font-normal",
								"data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none",
								"data-[state=active]:border-none data-[state=active]:font-medium",
								"after:absolute after:right-0 after:bottom-0 after:left-0 after:h-1",
								"data-[state=active]:after:bg-primary after:bg-transparent",
								"transition-all duration-200"
							)}
						>
							{tab.label} ({tabCounts[tab.key] || 0})
						</TabsTrigger>
					))}
				</TabsList>

				<div className="mt-5 flex flex-col justify-between gap-5 md:flex-row md:gap-2">
					<div className="flex flex-1 items-center gap-3">
						<SearchBox
							variant="outline"
							searchTerm={currentTabState.search}
							onSearchChange={handleInputChange}
							placeholder={searchPlaceholder}
						/>

						{sortableColumns.length > 0 && (
							<SortControl
								sortableColumns={sortableColumns}
								sorting={currentTabState.sorting}
								onSortChange={handleSortChange}
							/>
						)}

						{filterableColumns.length > 0 && (
							<FilterControl
								filterableColumns={filterableColumns}
								filters={currentTabState.filters}
								onFilterChange={handleFilterChange}
								onApplyFilters={onApplyFilters}
							/>
						)}
					</div>

					{actionButtons.length > 0 && (
						<div className="flex items-center justify-end gap-3">
							{actionButtons.map((button, index) => (
								<Button
									key={index}
									type="button"
									variant={button.variant}
									className={`flex items-center gap-2 ${button.className || ""}`}
									onClick={button.onClick}
								>
									{button.icon}
									{button.label}
								</Button>
							))}
						</div>
					)}

					{actions && (
						<div className="flex items-center justify-end gap-3">{actions.map((action, index) => action)}</div>
					)}
				</div>

				{tabs.map((tab) => (
					<TabsContent key={tab.key} value={tab.key}>
						{isLoading ? (
							<div className="flex h-60 items-center justify-center">
								<Loader2 className="h-8 w-8 animate-spin text-gray-600" />
							</div>
						) : (
							<>
								<TableComponent
									data={data?.data || []}
									sorting={currentTabState.sorting}
									setSorting={handleSortChange}
									filters={currentTabState.filters}
									setFilters={handleFilterChange}
									activeTab={tab.key}
								/>

								{data && (
									<div className="mt-4 flex items-center justify-between">
										<Pagination
											page={data.currentPage}
											pageSize={currentTabState.pageSize}
											totalPages={data.totalPages}
											handlePageChange={handlePageChange}
											handlePageSizeChange={handlePageSizeChange}
											totalItems={data.totalCount}
										/>
									</div>
								)}
							</>
						)}
					</TabsContent>
				))}
			</Tabs>
		</div>
	);
}
