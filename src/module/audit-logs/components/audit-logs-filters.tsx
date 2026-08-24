"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Search, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { AuditCategory, AuditStatus, type AuditLogSearchQuery } from "@/module/audit-logs/types";
import { AUDITED_MODELS, CATEGORY_LABELS, modelLabel } from "@/module/audit-logs/utils/audit-format";

export interface AuditLogFiltersState {
	category: AuditCategory | undefined;
	action: string;
	actorSearch: string;
	status: AuditStatus | undefined;
	model: string | undefined;
	fromDate: Date | undefined;
	toDate: Date | undefined;
}

export interface AuditLogSortState {
	sortBy: NonNullable<AuditLogSearchQuery["sortBy"]>;
	sortDir: NonNullable<AuditLogSearchQuery["sortDir"]>;
}

const SORT_OPTIONS: { value: AuditLogSortState["sortBy"]; label: string }[] = [
	{ value: "timestamp", label: "Time" },
	{ value: "action", label: "Action" },
	{ value: "category", label: "Category" },
	{ value: "actorEmail", label: "Actor" },
	{ value: "status", label: "Status" },
];

interface AuditLogsFiltersProps {
	isSuperAdmin: boolean;
	filters: AuditLogFiltersState;
	sort: AuditLogSortState;
	onCategoryChange: (value: AuditCategory | undefined) => void;
	onModelChange: (value: string | undefined) => void;
	onActionChange: (value: string) => void;
	onActorSearchChange: (value: string) => void;
	onStatusChange: (value: AuditStatus | undefined) => void;
	onSortByChange: (value: AuditLogSortState["sortBy"]) => void;
	onSortDirChange: (value: AuditLogSortState["sortDir"]) => void;
	onFromDateChange: (date: Date | undefined) => void;
	onToDateChange: (date: Date | undefined) => void;
}

function DateField({
	label,
	value,
	onSelect,
}: {
	label: string;
	value: Date | undefined;
	onSelect: (date: Date | undefined) => void;
}) {
	return (
		<div className="space-y-2">
			<label className="text-sm font-medium">{label}</label>
			<Popover>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						className={cn("w-full justify-start text-left font-normal", !value && "text-muted-foreground")}
					>
						<CalendarIcon className="mr-2 h-4 w-4" />
						{value ? format(value, "PPP") : <span>Pick a date</span>}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0">
					<Calendar mode="single" selected={value} onSelect={onSelect} initialFocus />
				</PopoverContent>
			</Popover>
		</div>
	);
}

export function AuditLogsFilters({
	isSuperAdmin,
	filters,
	sort,
	onCategoryChange,
	onModelChange,
	onActionChange,
	onActorSearchChange,
	onStatusChange,
	onSortByChange,
	onSortDirChange,
	onFromDateChange,
	onToDateChange,
}: AuditLogsFiltersProps) {
	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			<div className="space-y-2">
				<label className="text-sm font-medium">Category</label>
				<Select
					value={filters.category ?? "all"}
					onValueChange={(val) => onCategoryChange(val === "all" ? undefined : (val as AuditCategory))}
				>
					<SelectTrigger>
						<SelectValue placeholder="All Categories" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Categories</SelectItem>
						{Object.values(AuditCategory).map((cat) => (
							<SelectItem key={cat} value={cat}>
								{CATEGORY_LABELS[cat]}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			<div className="space-y-2">
				<label className="text-sm font-medium">Model</label>
				<Select value={filters.model ?? "all"} onValueChange={(val) => onModelChange(val === "all" ? undefined : val)}>
					<SelectTrigger>
						<SelectValue placeholder="All Models" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Models</SelectItem>
						{AUDITED_MODELS.map((m) => (
							<SelectItem key={m} value={m}>
								{modelLabel(m)}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			<div className="space-y-2">
				<label className="text-sm font-medium">Action</label>
				<Input
					placeholder="e.g. user.login.success"
					value={filters.action}
					onChange={(e) => onActionChange(e.target.value)}
				/>
			</div>
			<div className="space-y-2">
				<label className="text-sm font-medium">{isSuperAdmin ? "Actor Search" : "Actor Email"}</label>
				<div className="relative">
					<Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
					<Input
						placeholder={isSuperAdmin ? "Search by email" : "Exact email address"}
						className="pl-8"
						value={filters.actorSearch}
						onChange={(e) => onActorSearchChange(e.target.value)}
					/>
				</div>
			</div>
			<div className="space-y-2">
				<label className="text-sm font-medium">Status</label>
				<Select
					value={filters.status ?? "all"}
					onValueChange={(val) => onStatusChange(val === "all" ? undefined : (val as AuditStatus))}
				>
					<SelectTrigger>
						<SelectValue placeholder="All Statuses" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Statuses</SelectItem>
						<SelectItem value={AuditStatus.SUCCESS}>Success</SelectItem>
						<SelectItem value={AuditStatus.FAILURE}>Failure</SelectItem>
					</SelectContent>
				</Select>
			</div>
			<div className="space-y-2">
				<label className="text-sm font-medium">Sort by</label>
				<div className="flex gap-2">
					<Select value={sort.sortBy} onValueChange={(val) => onSortByChange(val as AuditLogSortState["sortBy"])}>
						<SelectTrigger className="flex-1">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{SORT_OPTIONS.map((o) => (
								<SelectItem key={o.value} value={o.value}>
									{o.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Select value={sort.sortDir} onValueChange={(val) => onSortDirChange(val as AuditLogSortState["sortDir"])}>
						<SelectTrigger className="w-[90px]" aria-label="Sort direction">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="desc">Desc</SelectItem>
							<SelectItem value="asc">Asc</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>
			<DateField label="From" value={filters.fromDate} onSelect={onFromDateChange} />
			<DateField label="To" value={filters.toDate} onSelect={onToDateChange} />
		</div>
	);
}
