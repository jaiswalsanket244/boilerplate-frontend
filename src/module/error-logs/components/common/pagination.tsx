import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type PaginationType } from "@/module/error-logs/types";

export function Pagination({ page, pageSize, totalPages, handlePageChange, handlePageSizeChange }: PaginationType) {
	return (
		<div className="mt-1 flex items-center justify-between rounded-md p-2">
			<p>
				Showing:{" "}
				<span className="font-bold">
					{(page - 1) * pageSize + 1} - {page * pageSize}
				</span>
			</p>
			<div className="flex items-center gap-2">
				<Select onValueChange={(value) => handlePageSizeChange(Number(value))} defaultValue={String(pageSize)}>
					<SelectTrigger className="w-[70px]">
						<SelectValue placeholder="Theme" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="10">10</SelectItem>
						<SelectItem value="25">25</SelectItem>
						<SelectItem value="50">50</SelectItem>
						<SelectItem value="100">100</SelectItem>
					</SelectContent>
				</Select>
				<Button variant="outline" disabled={page <= 1} onClick={() => handlePageChange(page - 1)}>
					Previous
				</Button>
				<p className="font-bold">Page No: {page}</p>
				<Button variant="outline" disabled={page >= totalPages} onClick={() => handlePageChange(page + 1)}>
					Next
				</Button>
			</div>
		</div>
	);
}
