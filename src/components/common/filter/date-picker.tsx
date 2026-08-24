"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { type DateFilterProps, type DatePickerButtonProps } from "@/types/filters";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";

function DatePickerButton({ date, isOpen, onOpenChange, onDateSelect }: DatePickerButtonProps) {
	return (
		<Popover open={isOpen} onOpenChange={onOpenChange}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					className={cn(
						"border- h-10 justify-between border border-gray-400/50 py-0 pr-4 text-left text-base",
						!date && "text-muted-foreground"
					)}
					data-testid="date-picker-trigger"
				>
					<span>{date ? format(date, "dd/MM/yyyy") : "DD/MM/YYYY"}</span>
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
					data-testid="date-picker"
				/>
			</PopoverContent>
		</Popover>
	);
}

export default function DatePicker({
	dateFrom,
	dateTo,
	onDateFromChange,
	onDateToChange,
	type = "date",
	onDateChange,
}: DateFilterProps) {
	const [fromPopoverOpen, setFromPopoverOpen] = useState(false);
	const [toPopoverOpen, setToPopoverOpen] = useState(false);

	const handleDateFromSelect = (date: Date | undefined) => {
		onDateFromChange?.(date?.toISOString());
		setFromPopoverOpen(false);
	};

	const handleDateToSelect = (date: Date | undefined) => {
		onDateToChange?.(date?.toISOString());
		setToPopoverOpen(false);
	};
	const handleDateChange = (date: Date | undefined) => {
		onDateChange?.(date?.toISOString());
		setFromPopoverOpen(false);
	};
	return (
		<div className={cn("grid grid-cols-2 gap-2", type === "date" && "flex justify-center")}>
			{type === "date-range" && (
				<>
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
				</>
			)}
			{type === "date" && onDateChange && (
				<DatePickerButton
					date={dateFrom}
					placeholder="Date"
					isOpen={fromPopoverOpen}
					onOpenChange={setFromPopoverOpen}
					onDateSelect={handleDateChange}
				/>
			)}
		</div>
	);
}
