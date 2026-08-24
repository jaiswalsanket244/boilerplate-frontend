import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import React from "react";
import { FilterDialog } from "@/module/profile/components/user-queries/filter-dialog";
import SortOptions from "@/module/profile/components/user-queries/sort-options";
import type { IFiltersProps } from "@/module/profile/types";

const Filters = ({ searchTerm, onSearchChange, filters, onFiltersChange, onSortChange }: IFiltersProps) => {
	return (
		<div className="border-border bg-card flex gap-1 border-b p-4" data-testid="filters-container">
			<div className="bg-muted relative flex-1 rounded-lg">
				<Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
				<Input
					placeholder="Search by name or email"
					value={searchTerm}
					onChange={(e) => onSearchChange(e.target.value)}
					className="h-10 border-none bg-transparent pl-10 text-sm shadow-none outline-hidden focus-visible:border-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-hidden focus-visible:outline-offset-0"
					data-testid="search-input"
				/>
			</div>

			<div className="flex shrink-0 items-center gap-2">
				<FilterDialog
					filters={filters}
					onFiltersChange={onFiltersChange}
					searchTerm={searchTerm}
					onSearchChange={onSearchChange}
				/>

				<SortOptions onSortChange={onSortChange} sortBy={filters.sortBy} sortOrder={filters.sortOrder} />
			</div>
		</div>
	);
};

export default Filters;
