import React, { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IOptions } from "@/components/common/form/types";

interface SearchableSelectProps {
	options: IOptions[];
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	onSearch?: (value: string) => void;
	disabled?: boolean;
	className?: string;
}

export default function SearchableSelect({
	options,
	value,
	onChange,
	placeholder = "Select an item",
	onSearch,
	disabled,
	className,
}: SearchableSelectProps) {
	const [inputValue, setInputValue] = useState("");
	const [open, setOpen] = useState(false);

	const selectedOption = options.find((option) => option.value === value);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					disabled={disabled}
					className={cn(
						"w-full justify-between rounded-lg bg-background font-normal",
						!value && "text-muted-foreground",
						className
					)}
				>
					<span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
					<ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-full p-0" align="start">
				<Command className="w-full">
					<CommandInput
						placeholder="Search..."
						value={inputValue}
						onValueChange={(searchValue) => {
							setInputValue(searchValue);
							onSearch?.(searchValue);
						}}
						className="h-8"
					/>

					<div className="max-h-60 overflow-y-auto">
						<CommandEmpty>No results found.</CommandEmpty>
						{options.length > 0 && (
							<CommandGroup>
								{options.map((option) => {
									const isSelected = value === option.value;
									return (
										<CommandItem
											key={option.value}
											onSelect={() => {
												onChange(option.value);
												setOpen(false);
											}}
											disabled={option.disabled}
											className={cn("cursor-pointer", isSelected && "bg-accent")}
										>
											<Check className={cn("mr-2 h-4 w-4", isSelected ? "opacity-100" : "opacity-0")} />
											{option.label}
										</CommandItem>
									);
								})}
							</CommandGroup>
						)}
					</div>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
