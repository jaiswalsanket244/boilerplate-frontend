"use client";

import { useErrorLogsAPI } from "@/module/error-logs/hooks/useErrorLogs";
import { ERROR_TYPE, SORT_BY, type UpdateErrorLogType } from "@/module/error-logs/types";
import { useState } from "react";
import GenericErrorLogDrawer from "@/module/error-logs/components/generic-error-logs-components/generic-error-log-drawer";
import { Pagination } from "@/module/error-logs/components/common/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRecentlyChangedRows } from "@/hooks/use-recently-changed-rows";

export function GenericErrorLogs() {
	const [page, setPage] = useState<number>(1);
	const [pageSize, setPageSize] = useState<number>(10);
	const [sortBy, setSortBy] = useState<SORT_BY>(SORT_BY.NEWEST);
	const { useUpdateErrorLogMutation, useGetAllErrorLogsQuery } = useErrorLogsAPI();
	const {
		data: genericErrorLogs,
		isSuccess,
		refetch: refetchGenericErrorLogs,
	} = useGetAllErrorLogsQuery({
		errorType: ERROR_TYPE.GENERIC,
		page,
		pageSize,
		sortBy,
	});
	const totalPages = Math.ceil(((genericErrorLogs && genericErrorLogs[0]?.total) || 0) / pageSize);

	const handlePageChange = (newPage: number) => {
		if (newPage < 1) return;
		if (newPage > totalPages) return;
		setPage(newPage);
	};

	const handlePageSizeChange = (newPageSize: number) => {
		setPageSize(newPageSize);
		setPage(1);
	};
	const { addRow, getRowAnimationClasses } = useRecentlyChangedRows();

	const handleUpdate = ({ id, isImportantFlag }: UpdateErrorLogType) => {
		useUpdateErrorLogMutation.mutate(
			{ id, isImportantFlag },
			{
				onSuccess: () => {
					addRow("updated", id);
					void refetchGenericErrorLogs();
				},
				onError: () => {
					addRow("errors", id);
				},
			}
		);
	};

	const columns = ["Flag", "Verb", "Name", "Url", ""];

	return (
		<div className="rounded-xl bg-white p-2 shadow-[0px_8px_24px_rgba(149,157,165,0.2)]">
			<div className="px-4 py-4">
				<div className="flex">
					<h3 className="text-2xl font-semibold">Request Errors</h3>
				</div>
				<div className="flex w-auto items-center justify-end gap-2">
					<p className="font-bold">Sort by:</p>
					<Select value={sortBy} onValueChange={(value) => setSortBy(value as SORT_BY)}>
						<SelectTrigger className="w-[120px] text-sm capitalize">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value={SORT_BY.NEWEST}>Newest first</SelectItem>
							<SelectItem value={SORT_BY.OLDEST}>Oldest first</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className="overflow-x-auto rounded-md border shadow-md">
				<Table>
					<TableHeader>
						<TableRow className="bg-black text-white">
							{columns.map((column, key) => {
								return (
									<TableHead color={"white"} key={key}>
										{column}
									</TableHead>
								);
							})}
						</TableRow>
					</TableHeader>
					<TableBody>
						{isSuccess && genericErrorLogs[0]?.items?.length ? (
							genericErrorLogs[0].items.map((genericErrorLog, key) => (
								<TableRow key={key} className={getRowAnimationClasses(genericErrorLog._id)}>
									<TableCell>
										<Checkbox
											checked={genericErrorLog.isImportant}
											onCheckedChange={(checked) =>
												handleUpdate({ id: genericErrorLog._id, isImportantFlag: Boolean(checked) })
											}
										/>
									</TableCell>

									<TableCell>
										<div className="flex min-w-40 items-center">
											<div className="inline-block rounded-sm bg-black px-2 py-0.5 text-xs text-white">
												{genericErrorLog.request?.method}
											</div>
										</div>
									</TableCell>

									<TableCell>{genericErrorLog.name}</TableCell>

									<TableCell className="max-w-[200px] truncate">
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<span>{genericErrorLog.request?.url}</span>
												</TooltipTrigger>
												<TooltipContent>{genericErrorLog.request?.url}</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									</TableCell>

									<TableCell>
										<GenericErrorLogDrawer errorLogInfo={genericErrorLog} />
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={5}>
									<div className="text-center">
										<p className="mt-3">No Data !!</p>
									</div>
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>

				{/* Table footer */}
				{/* Pagination */}
				<Pagination
					page={page}
					pageSize={pageSize}
					totalPages={totalPages}
					handlePageChange={handlePageChange}
					handlePageSizeChange={handlePageSizeChange}
				/>
			</div>
		</div>
	);
}
