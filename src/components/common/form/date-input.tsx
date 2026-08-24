import type { FormDateInputProps } from "@/components/common/form/types";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import type { FieldValues } from "react-hook-form";

export function FormDateInput<TData extends FieldValues>({
	field,
	fieldConfig,
	className,
	disabled,
}: FormDateInputProps<TData>) {
	const [isOpen, setOpen] = useState(false);

	const date = field.value;

	if (!fieldConfig) return null;

	return (
		<Popover open={isOpen} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					className={cn(
						"border- relative h-10 justify-between border border-gray-400/50 py-0 pr-4 text-left text-base",
						!date && "text-muted-foreground relative",
						className
					)}
				>
					<span>{date ? format(date, "dd/MM/yyyy") : "DD/MM/YYYY"}</span>

					<CalendarIcon className="text-muted-foreground pointer-events-none top-1/2 right-2 size-5" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="start">
				<Calendar
					disabled={disabled}
					mode="single"
					selected={date ? new Date(date) : undefined}
					onSelect={(date) => {
						field.onChange(date);
						setOpen(false);
					}}
					className="pointer-events-auto p-3"
				/>
			</PopoverContent>
		</Popover>
	);
}
