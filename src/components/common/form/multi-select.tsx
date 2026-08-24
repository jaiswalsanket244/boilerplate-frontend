import React, { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IOptions } from "@/components/common/form/types";

interface MultiSelectProps {
	options: IOptions[];
	value: string[];
	onChange: (value: string[]) => void;
	placeholder?: string;
	onSearch?: (value: string) => void;
	disabled?: boolean;
	className?: string;
}

export default function MultiSelect({
	options,
	value = [],
	onChange,
	placeholder = "Select items",
	onSearch,
	disabled,
	className,
}: MultiSelectProps) {
	const [inputValue, setInputValue] = useState("");
	const [open, setOpen] = useState(false);

	const handleToggle = (selectedValue: string) => {
		const isAlreadySelected = value.includes(selectedValue);
		if (isAlreadySelected) {
			onChange(value.filter((v) => v !== selectedValue));
		} else {
			onChange([...value, selectedValue]);
		}
	};

	const handleRemove = (selectedValue: string) => {
		onChange(value.filter((v) => v !== selectedValue));
	};

	const getSelectedLabels = () => {
		return value.map((v) => options.find((opt) => opt.value === v)?.label || v);
	};

	return (
		<div className={cn("w-full space-y-2", className)}>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						role="combobox"
						aria-expanded={open}
						disabled={disabled}
						className={cn(
							"bg-background w-full justify-between rounded-lg font-normal",
							!value.length && "text-muted-foreground"
						)}
					>
						<span className="truncate">{value.length > 0 ? `${value.length} selected` : placeholder}</span>
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
							className="border-border focus-visible:border-border h-9"
						/>

						<div className="max-h-60 overflow-y-auto">
							<CommandEmpty>No results found.</CommandEmpty>
							{options.length > 0 && (
								<CommandGroup>
									{options.map((option) => {
										const isSelected = value.includes(option.value);
										return (
											<CommandItem
												key={option.value}
												onSelect={() => handleToggle(option.value)}
												disabled={option.disabled}
												className={cn("cursor-pointer", isSelected && "bg-accent")}
											>
												<div className="flex items-center gap-2">
													<div
														className={cn(
															"border-primary flex h-4 w-4 items-center justify-center rounded-sm border",
															isSelected ? "bg-primary text-primary-foreground" : "opacity-50"
														)}
													>
														{isSelected && <Check className="h-3 w-3" />}
													</div>
													<span>{option.label}</span>
												</div>
											</CommandItem>
										);
									})}
								</CommandGroup>
							)}
						</div>
					</Command>
				</PopoverContent>
			</Popover>

			{value.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{getSelectedLabels()
						.slice(0, 3)
						.map((label, index) => (
							<Badge key={value[index]} variant="secondary" className="gap-1">
								{label}
								<button
									type="button"
									className="ring-offset-background focus:ring-ring ml-1 rounded-full outline-hidden focus:ring-2 focus:ring-offset-2"
									onClick={() => handleRemove(value[index]!)}
								>
									<X className="text-muted-foreground hover:text-foreground h-3 w-3" />
								</button>
							</Badge>
						))}
					{value.length > 3 && <Badge variant="secondary">+{value.length - 3} more</Badge>}
				</div>
			)}
		</div>
	);
}
