import React from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import type { SortControlProps } from "@/types/filters";

export function SortControl({ sortableColumns, sorting, onSortChange, children }: SortControlProps) {
	const handleSort = (columnKey: string, direction: "asc" | "desc") => {
		// Find if this column is already being sorted
		const existingSortIndex = sorting.findIndex((sort) => sort.id === columnKey);

		if (existingSortIndex >= 0) {
			// Update existing sort
			const newSorting = [...sorting];
			newSorting[existingSortIndex] = { id: columnKey, desc: direction === "desc" };
			onSortChange(newSorting);
		} else {
			// Add new sort
			onSortChange([...sorting, { id: columnKey, desc: direction === "desc" }]);
		}
	};

	const clearSort = (columnKey: string) => {
		onSortChange(sorting.filter((sort) => sort.id !== columnKey));
	};

	const getSortDirection = (columnKey: string): "asc" | "desc" | null => {
		const sort = sorting.find((sort) => sort.id === columnKey);
		if (!sort) return null;
		return sort.desc ? "desc" : "asc";
	};

	return (
		<DropdownMenu data-testid="sort-control">
			<DropdownMenuTrigger asChild>
				{children ? (
					children
				) : (
					<Button variant="outline" className="bg-muted hover:bg-muted/50 size-10 gap-2 rounded-lg border-none p-0">
						<ArrowUpDown className="h-4 w-4" />
					</Button>
				)}
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56">
				<div className="p-2">
					<div className="mb-2 text-sm font-medium">Sort Options</div>
					{sortableColumns.map((column) => {
						const currentSort = getSortDirection(column.key);
						return (
							<div key={column.key} className="space-y-1">
								<div className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{column.label}</div>
								<div className="flex flex-col gap-1">
									<DropdownMenuItem
										onClick={() => handleSort(column.key, "asc")}
										className={`flex cursor-pointer items-center justify-between ${
											currentSort === "asc" ? "bg-accent" : ""
										}`}
										data-testid={`${column.key}-sort-asc-button`}
									>
										<span className="flex items-center gap-2">
											<ArrowUp className="h-3 w-3" />
											{column.ascLabel || "Ascending"}
										</span>
										{currentSort === "asc" && (
											<Button
												variant="ghost"
												size="sm"
												className="h-4 w-4 p-0"
												onClick={(e) => {
													e.stopPropagation();
													clearSort(column.key);
												}}
												data-testid={`${column.key}-sort-clear-button`}
											>
												×
											</Button>
										)}
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() => handleSort(column.key, "desc")}
										className={`flex cursor-pointer items-center justify-between ${
											currentSort === "desc" ? "bg-accent" : ""
										}`}
										data-testid={`${column.key}-sort-desc-button`}
									>
										<span className="flex items-center gap-2">
											<ArrowDown className="h-3 w-3" />
											{column.descLabel || "Descending"}
										</span>
										{currentSort === "desc" && (
											<Button
												variant="ghost"
												size="sm"
												className="h-4 w-4 p-0"
												onClick={(e) => {
													e.stopPropagation();
													clearSort(column.key);
												}}
												data-testid={`${column.key}-sort-clear-button`}
											>
												×
											</Button>
										)}
									</DropdownMenuItem>
								</div>
								{sortableColumns.length > 0 && column.key !== sortableColumns[sortableColumns.length - 1]?.key && (
									<div className="my-2 border-t" />
								)}
							</div>
						);
					})}
					{sorting.length > 0 && (
						<>
							<div className="my-2 border-t" />
							<DropdownMenuItem
								data-testid="clear-all-sorts-button"
								onClick={() => onSortChange([])}
								className="text-destructive cursor-pointer"
							>
								Clear All Sorts
							</DropdownMenuItem>
						</>
					)}
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
