import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type {
	CollapsibleSectionProps,
	DateFilterProps,
	DatePickerButtonProps,
	FilterDialogProps,
	FilterState,
	StatusFilterProps,
	SubjectFilterProps,
} from "@/module/profile/types";
import { USER_QUERY_STATUS, USER_QUERY_SUBJECT } from "@/module/profile/types";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ChevronDown, ChevronRight, Search } from "lucide-react";
import { useState } from "react";
import { FaFilter } from "react-icons/fa";

const subjectOptions = Object.values(USER_QUERY_SUBJECT);
const statusOptions = Object.values(USER_QUERY_STATUS);

function CollapsibleSection({ title, defaultOpen = false, children, ...props }: CollapsibleSectionProps) {
	const [isOpen, setIsOpen] = useState(defaultOpen);

	return (
		<Collapsible open={isOpen} onOpenChange={setIsOpen} className="border-b py-2">
			<CollapsibleTrigger {...props} className="flex h-10 w-full items-center gap-3 text-left">
				{isOpen ? (
					<ChevronDown className="text-muted-foreground size-5" />
				) : (
					<ChevronRight className="text-muted-foreground size-5" />
				)}
				<span className="text-txt-primary text-base font-medium">{title}</span>
			</CollapsibleTrigger>
			<CollapsibleContent className="mt-2">{children}</CollapsibleContent>
		</Collapsible>
	);
}

function DatePickerButton({ date, placeholder, isOpen, onOpenChange, onDateSelect }: DatePickerButtonProps) {
	return (
		<Popover open={isOpen} onOpenChange={onOpenChange}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					className={cn(
						"border- border-border h-10 justify-between border py-0 pr-4 text-left text-base",
						!date && "text-muted-foreground"
					)}
				>
					<span>{date ? format(new Date(date), "dd/MM/yyyy") : "DD/MM/YYYY"}</span>
					<span className="h-6 w-px bg-gray-400"></span>
					<CalendarIcon className="text-muted-foreground pointer-events-none top-1/2 right-2 size-5" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="start">
				<Calendar
					mode="single"
					selected={date ? new Date(date) : undefined}
					onSelect={onDateSelect}
					className="pointer-events-auto p-3"
				/>
			</PopoverContent>
		</Popover>
	);
}

function SubjectFilter({ selectedSubjects, onSubjectsChange }: SubjectFilterProps) {
	const handleSubjectChange = (subject: string, checked: boolean) => {
		const updatedSubjects = checked ? [...selectedSubjects, subject] : selectedSubjects.filter((s) => s !== subject);
		onSubjectsChange(updatedSubjects);
	};

	return (
		<CollapsibleSection title="Subject" defaultOpen={true}>
			<div className="grid space-y-2">
				{subjectOptions.map((option) => (
					<div key={option} className="flex items-center space-x-2">
						<Checkbox
							id={option}
							checked={selectedSubjects.includes(option)}
							onCheckedChange={(checked) => handleSubjectChange(option, !!checked)}
							className="data-[state=checked]:border-primary data-[state=checked]:bg-primary"
						/>
						<Label htmlFor={option} className="text-foreground cursor-pointer text-base">
							{option}
						</Label>
					</div>
				))}
			</div>
		</CollapsibleSection>
	);
}

function DateFilter({ dateFrom, dateTo, onDateFromChange, onDateToChange }: DateFilterProps) {
	const [fromPopoverOpen, setFromPopoverOpen] = useState(false);
	const [toPopoverOpen, setToPopoverOpen] = useState(false);

	const handleDateFromSelect = (date: Date | undefined) => {
		onDateFromChange(date?.toISOString());
		setFromPopoverOpen(false); // Close popover after selection
	};

	const handleDateToSelect = (date: Date | undefined) => {
		onDateToChange(date?.toISOString());
		setToPopoverOpen(false); // Close popover after selection
	};

	return (
		<CollapsibleSection title="Date" defaultOpen={false}>
			<div className="grid grid-cols-2 gap-2">
				<DatePickerButton
					date={dateFrom}
					placeholder="From Date"
					isOpen={fromPopoverOpen}
					onOpenChange={setFromPopoverOpen}
					onDateSelect={handleDateFromSelect}
				/>
				<DatePickerButton
					date={dateTo}
					placeholder="To Date"
					isOpen={toPopoverOpen}
					onOpenChange={setToPopoverOpen}
					onDateSelect={handleDateToSelect}
				/>
			</div>
		</CollapsibleSection>
	);
}

function StatusFilter({ selectedStatus, onStatusChange }: StatusFilterProps) {
	const handleStatusChange = (status: string, checked: boolean) => {
		const updatedStatus = checked ? [...selectedStatus, status] : selectedStatus.filter((s) => s !== status);
		onStatusChange(updatedStatus);
	};

	return (
		<CollapsibleSection title="Status" defaultOpen={false} data-testid="status-filter-section">
			<div className="grid grid-cols-2 space-y-2">
				{statusOptions.map((option) => (
					<div key={option} className="flex items-center space-x-2">
						<Checkbox
							id={`status-${option}`}
							data-testid={`status-${option}`}
							checked={selectedStatus.includes(option)}
							onCheckedChange={(checked) => handleStatusChange(option, !!checked)}
							className="data-[state=checked]:border-primary data-[state=checked]:bg-primary"
						/>
						<Label htmlFor={`status-${option}`} className="text-txt-primary cursor-pointer text-base">
							{option}
						</Label>
					</div>
				))}
			</div>
		</CollapsibleSection>
	);
}

export function FilterDialog({ filters, onFiltersChange, searchTerm, onSearchChange }: FilterDialogProps) {
	const updateFilters = (updates: Partial<FilterState>) => {
		onFiltersChange({ ...filters, ...updates });
	};

	return (
		<>
			<Popover>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						data-testid="filter-dialog-trigger"
						size="sm"
						className="bg-muted text-txt-primary hover:bg-muted/50 [&_svg]:text-txt-primary size-10 gap-2 border-none text-xs"
					>
						<FaFilter className="size-5" />
					</Button>
				</PopoverTrigger>
				<PopoverContent
					data-testid="filter-dialog"
					className="w-[95%] min-w-[310px] gap-0 p-0 sm:w-full sm:max-w-[384px] sm:min-w-[384px]"
				>
					<div className="bg-card p-4 pb-2">
						<h3 className="text-foreground text-lg font-semibold">Filter By</h3>
					</div>

					<div className="space-y-0 px-4 pb-4">
						<div className="bg-muted relative flex-1 rounded-xl">
							<Input
								placeholder="Search by name or email"
								value={searchTerm}
								onChange={(e) => onSearchChange(e.target.value)}
								className="h-10 border-none bg-transparent pr-10 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-hidden focus-visible:outline-offset-0"
							/>
							<Search className="text-txt-primary absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 transform" />
						</div>
						<SubjectFilter
							selectedSubjects={filters.subjects}
							onSubjectsChange={(subjects) => updateFilters({ subjects })}
						/>

						<DateFilter
							dateFrom={filters.dateFrom}
							dateTo={filters.dateTo}
							onDateFromChange={(dateFrom) => updateFilters({ dateFrom })}
							onDateToChange={(dateTo) => updateFilters({ dateTo })}
						/>

						<StatusFilter selectedStatus={filters.status} onStatusChange={(status) => updateFilters({ status })} />
					</div>
				</PopoverContent>
			</Popover>
		</>
	);
}
