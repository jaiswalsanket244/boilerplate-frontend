"use client";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type PaginationType } from "@/types";
import { isNumber } from "lodash";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({
	page,
	pageSize,
	totalPages,
	handlePageChange,
	totalItems,
	handlePageSizeChange,
}: PaginationType) {
	function getPageNumbers() {
		const delta = 2; // how many pages to show around current page
		const range: number[] = [];
		const rangeWithDots: (number | string)[] = [];

		// Build full range
		for (let i = 1; i <= totalPages; i++) {
			if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
				range.push(i);
			}
		}

		// Insert dots
		let prev: number | null = null;
		for (const i of range) {
			if (prev) {
				if (i - prev === 2) {
					// gap of exactly 1 → insert the missing page
					rangeWithDots.push(prev + 1);
				} else if (i - prev > 2) {
					// bigger gap → insert dots
					rangeWithDots.push("...");
				}
			}
			rangeWithDots.push(i);
			prev = i;
		}

		return rangeWithDots;
	}

	return (
		<div
			className="flex w-full flex-wrap items-center justify-between gap-2 px-2 py-4"
			data-testid="pagination-component"
		>
			{/* Info */}
			<div className="text-sm text-muted-foreground">
				Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, totalItems)} of {totalItems} results
			</div>

			{/* Page numbers */}
			<div className="flex flex-wrap items-center justify-center space-x-1">
				{getPageNumbers().map((p, i) =>
					!isNumber(p) ? (
						<span key={`dots-${i}`} className="px-2 text-muted-foreground">
							...
						</span>
					) : (
						<Button
							key={p}
							variant={page === p ? "default" : "ghost"}
							size="sm"
							className="h-8 w-8 p-0"
							onClick={() => handlePageChange(p)}
						>
							{p}
						</Button>
					)
				)}
			</div>

			{/* Prev / Next */}
			<div className="flex items-center space-x-2">
				{handlePageSizeChange && (
					<Select
						data-testid="page-size-select"
						value={String(pageSize)}
						onValueChange={(val) => handlePageSizeChange(Number(val))}
					>
						<SelectTrigger className="w-[100px]">
							<SelectValue placeholder="Page size" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="10">10</SelectItem>
							<SelectItem value="25">25</SelectItem>
							<SelectItem value="50">50</SelectItem>
							<SelectItem value="100">100</SelectItem>
						</SelectContent>
					</Select>
				)}
				<Button
					data-testid="prev-page-button"
					variant="ghost"
					size="sm"
					onClick={() => handlePageChange(page - 1)}
					disabled={page <= 1}
					className="bg-muted text-muted-foreground"
				>
					<ChevronLeft className="mr-2 h-4 w-4" /> Prev.
				</Button>
				<Button
					data-testid="next-page-button"
					variant="ghost"
					size="sm"
					onClick={() => handlePageChange(page + 1)}
					disabled={page >= totalPages}
					className="bg-muted text-muted-foreground"
				>
					Next <ChevronRight className="ml-2 h-4 w-4" />
				</Button>
			</div>
		</div>
	);
}
