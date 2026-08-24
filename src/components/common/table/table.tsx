"use client";

import React from "react";
import {
	flexRender,
	getCoreRowModel,
	useReactTable,
	getSortedRowModel,
	getFilteredRowModel,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { DataTableProps } from "@/types/index";
import { cn } from "@/lib/utils";
import { useRecentlyChangedRows } from "@/hooks/use-recently-changed-rows";

export function DataTable<TData, TValue>({
	columns,
	data,
	onSortingChange,
	onFiltersChange,
	rowClassname,
	headerRowClassname,
}: DataTableProps<TData, TValue>) {
	const table = useReactTable({
		data: data || [],
		columns,
		getCoreRowModel: getCoreRowModel(),
		onSortingChange,
		getSortedRowModel: getSortedRowModel(),
		onColumnFiltersChange: onFiltersChange,
		getFilteredRowModel: getFilteredRowModel(),
	});

	const { getRowAnimationClasses } = useRecentlyChangedRows();

	return (
		<div className="border-border w-full overflow-hidden rounded-md border">
			<Table data-testid="data-table">
				<TableHeader className={cn("text-txt-primary")}>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow
							key={headerGroup.id}
							className={cn("border-border text-txt-primary bg-muted h-12 text-base", headerRowClassname)}
						>
							{headerGroup.headers.map((header) => {
								return (
									<TableHead key={header.id} className="text-txt-primary-800 font-semibold">
										{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
									</TableHead>
								);
							})}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{table.getRowModel().rows?.length ? (
						table.getRowModel().rows.map((row) => (
							<TableRow
								key={row.id}
								data-testid={`table-row-${row.id}`}
								data-state={row.getIsSelected() && "selected"}
								className={cn("border-border text-base", rowClassname, getRowAnimationClasses(row.id))}
							>
								{row.getVisibleCells().map((cell) => (
									<TableCell key={cell.id} className="text-txt-primary">
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</TableRow>
						))
					) : (
						<TableRow data-testid="no-results-row">
							<TableCell colSpan={columns.length} className="h-24 text-center">
								No results.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}
