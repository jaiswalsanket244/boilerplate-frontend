"use client";

import { useErrorLogsAPI } from "@/module/error-logs/hooks/useErrorLogs";
import { ERROR_TYPE, SORT_BY, type UpdateErrorLogType } from "@/module/error-logs/types";
import { useState } from "react";
import EmailErrorLogDrawer from "@/module/error-logs/components/email-error-log-components/email-error-log-drawer";
import { Pagination } from "@/module/error-logs/components/common/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRecentlyChangedRows } from "@/hooks/use-recently-changed-rows";

export function EmailErrorLogs() {
	const [page, setPage] = useState<number>(1);
	const [pageSize, setPageSize] = useState<number>(10);
	const [sortBy, setSortBy] = useState<SORT_BY>(SORT_BY.NEWEST);
	const { useUpdateErrorLogMutation, useGetAllErrorLogsQuery } = useErrorLogsAPI();
	const {
		data: emailErrorLogs,
		isSuccess,
		refetch: refetchEmailErrorLogs,
	} = useGetAllErrorLogsQuery({
		errorType: ERROR_TYPE.EMAIL,
		page,
		pageSize,
		sortBy,
	});
	const totalPages = Math.ceil(((emailErrorLogs && emailErrorLogs[0]?.total) || 0) / pageSize);

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
					void refetchEmailErrorLogs();
				},
				onError: () => {
					addRow("errors", id);
				},
			}
		);
	};

	const columns = ["Flag", "Name", "Message", ""];

	return (
		<div className="rounded-xl bg-white p-2 shadow-[0px_8px_24px_rgba(149,157,165,0.2)]">
			<div className="px-4 py-4">
				<div className="flex">
					<h3 className="text-2xl font-semibold">Email Errors</h3>
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
						{isSuccess && emailErrorLogs[0]?.items?.length ? (
							emailErrorLogs[0].items.map((emailErrorLog) => (
								<TableRow key={String(emailErrorLog._id)} className={getRowAnimationClasses(emailErrorLog._id)}>
									<TableCell>
										<Checkbox
											checked={emailErrorLog.isImportant}
											onCheckedChange={(checked) =>
												handleUpdate({ id: emailErrorLog._id, isImportantFlag: Boolean(checked) })
											}
										/>
									</TableCell>
									<TableCell>{emailErrorLog.name}</TableCell>
									<TableCell>{emailErrorLog.message}</TableCell>
									<TableCell className="flex">
										<EmailErrorLogDrawer errorLogInfo={emailErrorLog} />
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={4}>
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
