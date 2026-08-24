"use client";

import { useEffect, useMemo, useState } from "react";
import debounce from "lodash/debounce";
import { useAuditLogsAPI } from "@/module/audit-logs/hooks/useAuditLogs";
import type {
	AuditStatus,
	AuditCategory,
	AuditExportFormat,
	AuditLogSearchQuery,
	IAuditLog,
} from "@/module/audit-logs/types";
import { triggerDownload } from "@/module/audit-logs/utils/trigger-download";
import { ERROR_CODES } from "@/lib/constants/error-codes";
import { ARIA_ROLE } from "@/lib/constants/aria";
import { isAxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Pagination } from "@/module/error-logs/components/common/pagination";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RotateCcw, AlertCircle, FileSearch, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfileAPI } from "@/module/profile/hooks/useProfile";
import { ROLES } from "@/types";
import AuditLogDrawer from "@/module/audit-logs/components/audit-log-drawer";
import { AuditLogsToolbar } from "@/module/audit-logs/components/audit-logs-toolbar";
import {
	AuditLogsFilters,
	type AuditLogFiltersState,
	type AuditLogSortState,
} from "@/module/audit-logs/components/audit-logs-filters";
import { AuditRow, SkeletonRows } from "@/module/audit-logs/components/audit-log-row";

const INTERNAL_UPDATES_HINT = "App-generated updates to internal fields. Turn off to show all.";

const EMPTY_FILTERS: AuditLogFiltersState = {
	category: undefined,
	action: "",
	actorSearch: "",
	status: undefined,
	model: undefined,
	fromDate: undefined,
	toDate: undefined,
};

export function AuditLogsPage() {
	const { useGetUserData } = useProfileAPI();
	const { data: user } = useGetUserData();
	const isSuperAdmin = user?.roles === ROLES.SUPER_ADMIN;

	const [page, setPage] = useState<number>(1);
	const [pageSize, setPageSize] = useState<number>(10);
	const [filters, setFilters] = useState<AuditLogFiltersState>(EMPTY_FILTERS);
	const [sort, setSort] = useState<AuditLogSortState>({ sortBy: "timestamp", sortDir: "desc" });

	const [debouncedText, setDebouncedText] = useState({ action: "", actorSearch: "" });

	const [selectedLog, setSelectedLog] = useState<IAuditLog | null>(null);
	const [drawerOpen, setDrawerOpen] = useState(false);

	const [hideInternalChanges, setHideInternalChanges] = useState(true);

	const commitTextFilters = useMemo(
		() =>
			debounce((next: { action: string; actorSearch: string }) => {
				setDebouncedText(next);
				setPage(1);
			}, 400),
		[]
	);

	useEffect(() => () => commitTextFilters.cancel(), [commitTextFilters]);

	const { useGetAllAuditLogsQuery, useExportAuditLogsMutation } = useAuditLogsAPI();
	const exportMutation = useExportAuditLogsMutation();

	const [exportFormat, setExportFormat] = useState<AuditExportFormat>("json");
	const [exportNotice, setExportNotice] = useState<{ tone: "info" | "error"; text: string } | null>(null);

	const query: AuditLogSearchQuery = {
		page,
		pageSize,
		category: filters.category,
		action: debouncedText.action || undefined,
		search: isSuperAdmin ? debouncedText.actorSearch || undefined : undefined,
		actorEmail: !isSuperAdmin ? debouncedText.actorSearch || undefined : undefined,
		status: filters.status,
		targetType: filters.model,
		from: filters.fromDate?.toISOString(),
		to: filters.toDate?.toISOString(),
		sortBy: sort.sortBy,
		sortDir: sort.sortDir,
		hideInternalChanges,
	};

	const { data: auditLogsData, isLoading, isError, refetch, isFetching } = useGetAllAuditLogsQuery(query, user?.roles);

	const rows = auditLogsData?.data ?? [];
	const totalPages = auditLogsData?.pagination?.totalPages ?? 0;

	const handleRowClick = (log: IAuditLog) => {
		setSelectedLog(log);
		setDrawerOpen(true);
	};

	const handlePageChange = (newPage: number) => setPage(newPage);
	const handlePageSizeChange = (newPageSize: number) => {
		setPageSize(newPageSize);
		setPage(1);
	};

	const hasActiveFilters =
		!!filters.category ||
		!!filters.action ||
		!!filters.actorSearch ||
		!!filters.status ||
		!!filters.model ||
		!!filters.fromDate ||
		!!filters.toDate;

	const resetFilters = () => {
		commitTextFilters.cancel();
		setFilters(EMPTY_FILTERS);
		setDebouncedText({ action: "", actorSearch: "" });
		setPage(1);
		setExportNotice(null);
	};

	// Selects/dates reset to page 1 immediately; the two text inputs go through the debounce instead.
	const onCategoryChange = (value: AuditCategory | undefined) => {
		setFilters((f) => ({ ...f, category: value }));
		setPage(1);
	};
	const onModelChange = (value: string | undefined) => {
		setFilters((f) => ({ ...f, model: value }));
		setPage(1);
	};
	const onStatusChange = (value: AuditStatus | undefined) => {
		setFilters((f) => ({ ...f, status: value }));
		setPage(1);
	};
	const onFromDateChange = (date: Date | undefined) => {
		setFilters((f) => ({ ...f, fromDate: date }));
		setPage(1);
	};
	const onToDateChange = (date: Date | undefined) => {
		setFilters((f) => ({ ...f, toDate: date }));
		setPage(1);
	};
	const onActionChange = (value: string) => {
		setFilters((f) => ({ ...f, action: value }));
		commitTextFilters({ action: value, actorSearch: filters.actorSearch });
	};
	const onActorSearchChange = (value: string) => {
		setFilters((f) => ({ ...f, actorSearch: value }));
		commitTextFilters({ action: filters.action, actorSearch: value });
	};

	const handleExport = () => {
		if (exportMutation.isPending || !user?.roles) return;
		setExportNotice(null);
		exportMutation.mutate(
			{ query, format: exportFormat, role: user.roles },
			{
				onSuccess: (data) => {
					if (!data?.url) {
						setExportNotice({ tone: "error", text: "Export failed. Please try again." });
						return;
					}
					triggerDownload(data.url);
					if (data.truncated) {
						setExportNotice({
							tone: "info",
							text: "Export limited to the first 5000 rows. Narrow your filters to export the rest.",
						});
					}
				},
				onError: (error) => {
					const axiosError = isAxiosError<{ messageCode?: string }>(error) ? error : undefined;
					const messageCode = axiosError?.response?.data?.messageCode;
					const httpStatus = axiosError?.response?.status;
					if (messageCode === ERROR_CODES.RATE_LIMIT_EXCEEDED || httpStatus === 429) {
						setExportNotice({ tone: "error", text: "Export rate limit reached. Please try again later." });
					} else {
						setExportNotice({ tone: "error", text: "Export failed. Please try again." });
					}
				},
			}
		);
	};

	return (
		<div className="font-inter space-y-6 p-6">
			<AuditLogsToolbar
				isSuperAdmin={isSuperAdmin}
				hasActiveFilters={hasActiveFilters}
				onReset={resetFilters}
				exportFormat={exportFormat}
				onExportFormatChange={setExportFormat}
				onExport={handleExport}
				isExporting={exportMutation.isPending}
			/>

			{exportNotice && (
				<div
					role={ARIA_ROLE.STATUS}
					className={cn(
						"flex items-center gap-2 rounded-lg border p-3 text-sm",
						exportNotice.tone === "error"
							? "border-red-200 bg-red-50 text-red-700"
							: "border-amber-200 bg-amber-50 text-amber-800"
					)}
				>
					<span>{exportNotice.text}</span>
				</div>
			)}

			<AuditLogsFilters
				isSuperAdmin={isSuperAdmin}
				filters={filters}
				sort={sort}
				onCategoryChange={onCategoryChange}
				onModelChange={onModelChange}
				onActionChange={onActionChange}
				onActorSearchChange={onActorSearchChange}
				onStatusChange={onStatusChange}
				onSortByChange={(value) => setSort((s) => ({ ...s, sortBy: value }))}
				onSortDirChange={(value) => setSort((s) => ({ ...s, sortDir: value }))}
				onFromDateChange={onFromDateChange}
				onToDateChange={onToDateChange}
			/>

			{isError ? (
				<div className="flex flex-col items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
					<AlertCircle className="h-6 w-6" />
					<span>Failed to load audit logs. Check permissions or try again.</span>
					<Button variant="outline" size="sm" onClick={() => void refetch()}>
						<RotateCcw className="mr-2 h-4 w-4" />
						Retry
					</Button>
				</div>
			) : (
				<div className="space-y-4">
					<div className="flex items-center gap-2">
						<Switch
							id="hide-internal-changes"
							checked={hideInternalChanges}
							onCheckedChange={(checked) => {
								setHideInternalChanges(checked);
								setPage(1);
							}}
						/>
						<Label htmlFor="hide-internal-changes" className="cursor-pointer text-sm font-medium">
							Hide internal updates
						</Label>
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<button
										type="button"
										aria-label="What are internal updates?"
										className="text-muted-foreground hover:text-foreground sm:hidden"
									>
										<Info className="h-3.5 w-3.5" />
									</button>
								</TooltipTrigger>
								<TooltipContent className="max-w-xs">{INTERNAL_UPDATES_HINT}</TooltipContent>
							</Tooltip>
						</TooltipProvider>
						<span className="text-muted-foreground hidden text-xs sm:inline">{INTERNAL_UPDATES_HINT}</span>
					</div>
					<div className="bg-card overflow-hidden rounded-lg border">
						{isLoading ? (
							<SkeletonRows />
						) : rows.length === 0 ? (
							<Empty className="border-0">
								<EmptyHeader>
									<EmptyMedia variant="icon">
										<FileSearch />
									</EmptyMedia>
									<EmptyTitle>No audit logs found</EmptyTitle>
									<EmptyDescription>
										{hasActiveFilters
											? "No events match the active filters. Try widening or clearing them."
											: "There are no audit events recorded yet."}
									</EmptyDescription>
								</EmptyHeader>
								{hasActiveFilters && (
									<EmptyContent>
										<Button variant="outline" size="sm" onClick={resetFilters}>
											<RotateCcw className="mr-2 h-4 w-4" />
											Reset Filters
										</Button>
									</EmptyContent>
								)}
							</Empty>
						) : (
							<div className={cn("divide-y", isFetching && "opacity-60 transition-opacity")}>
								{rows.map((log) => (
									<AuditRow key={log._id} log={log} onClick={() => handleRowClick(log)} />
								))}
							</div>
						)}
					</div>
					{rows.length > 0 && (
						<Pagination
							page={page}
							pageSize={pageSize}
							totalPages={totalPages}
							handlePageChange={handlePageChange}
							handlePageSizeChange={handlePageSizeChange}
						/>
					)}
				</div>
			)}

			<AuditLogDrawer
				auditLog={selectedLog}
				open={drawerOpen}
				onOpenChange={setDrawerOpen}
				isSuperAdmin={isSuperAdmin}
			/>
		</div>
	);
}
