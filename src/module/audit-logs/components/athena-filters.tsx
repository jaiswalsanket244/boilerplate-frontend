"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Filter, Search, CalendarIcon, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { AuditStatus } from "@/module/audit-logs/types";
import { type AthenaFilters } from "@/module/audit-logs/utils/athena";

interface AthenaFiltersCardProps {
	filters: AthenaFilters;
	onChange: <K extends keyof AthenaFilters>(key: K, value: AthenaFilters[K]) => void;
	onReset: () => void;
}

function TextFilter({
	label,
	placeholder,
	value,
	onChange,
	withSearchIcon,
}: {
	label: string;
	placeholder: string;
	value: string;
	onChange: (value: string) => void;
	withSearchIcon?: boolean;
}) {
	return (
		<div className="space-y-2">
			<label className="text-sm font-medium">{label}</label>
			<div className={withSearchIcon ? "relative" : undefined}>
				{withSearchIcon && <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />}
				<Input
					placeholder={placeholder}
					className={withSearchIcon ? "pl-8" : undefined}
					value={value}
					onChange={(e) => onChange(e.target.value)}
				/>
			</div>
		</div>
	);
}

function DateFilter({
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

export function AthenaFiltersCard({ filters, onChange, onReset }: AthenaFiltersCardProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Filter className="h-5 w-5" />
					Filters
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					<TextFilter
						label="Actor"
						placeholder="Name, email or ID"
						value={filters.actor}
						onChange={(v) => onChange("actor", v)}
						withSearchIcon
					/>
					<TextFilter
						label="Action"
						placeholder="e.g. user.created"
						value={filters.action}
						onChange={(v) => onChange("action", v)}
					/>
					<TextFilter
						label="Resource"
						placeholder="e.g. users"
						value={filters.resource}
						onChange={(v) => onChange("resource", v)}
					/>
					<TextFilter
						label="Resource ID"
						placeholder="Search by ID"
						value={filters.resourceId}
						onChange={(v) => onChange("resourceId", v)}
					/>
					<div className="space-y-2">
						<label className="text-sm font-medium">Status</label>
						<Select
							value={filters.status ?? "all"}
							onValueChange={(val) => onChange("status", val === "all" ? undefined : (val as AuditStatus))}
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
					<DateFilter label="Start Date" value={filters.startDate} onSelect={(d) => onChange("startDate", d)} />
					<DateFilter label="End Date" value={filters.endDate} onSelect={(d) => onChange("endDate", d)} />
					<div className="flex items-end">
						<Button variant="outline" className="w-full" onClick={onReset}>
							<RotateCcw className="mr-2 h-4 w-4" />
							Reset Filters
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
