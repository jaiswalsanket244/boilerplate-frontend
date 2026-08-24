"use client";

import DatePicker from "@/components/common/filter/date-picker";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { FilterOption } from "@/types";
import { FILTER_TYPE, type FilterControlProps, type RangeSliderProps } from "@/types/filters";
import { debounce } from "lodash";
import { ChevronDown, ChevronRight, Filter, Search, X } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

const RangeSlider: React.FC<RangeSliderProps> = ({ min, max, step = 10, value, onChange }) => {
	const [localValue, setLocalValue] = useState(value);

	const debouncedOnChange = useMemo(
		() =>
			debounce((val: [number, number]) => {
				onChange(val);
			}, 500),
		[onChange]
	);

	const handleChange = (val: number[]) => {
		const updatedValue = [...val] as [number, number];
		setLocalValue(updatedValue);
		debouncedOnChange(updatedValue);
	};

	useEffect(() => {
		return () => {
			debouncedOnChange.cancel();
		};
	}, [debouncedOnChange]);

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between text-sm">
				<span className="font-medium">Selected Range: </span>
				<span className="text-muted-foreground">
					${localValue[0]} - ${localValue[1]}
				</span>
			</div>
			<div className="flex items-center gap-2">
				<span>{min}</span>
				<Slider
					data-testid="filter-control-range-slider"
					value={localValue}
					onValueChange={handleChange}
					step={step}
					min={min}
					max={max}
				/>
				<span>{max}</span>
			</div>
		</div>
	);
};

export default function FilterControl({
	filterableColumns,
	filters,
	onFilterChange,
	className = "",
	children,
	onApplyFilters,
}: FilterControlProps) {
	const [searchTerm, setSearchTerm] = useState("");
	const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
	const [isOpen, setIsOpen] = useState(false);

	const getFilterValue = (columnKey: string): unknown => {
		const filter = filters.find((f) => f.id === columnKey);
		return filter?.value || undefined;
	};

	const updateFilter = (columnKey: string, value: unknown) => {
		const existingFilterIndex = filters.findIndex((f) => f.id === columnKey);

		if (
			value === null ||
			value === undefined ||
			(Array.isArray(value) && value.length === 0) ||
			(typeof value === "string" && value.trim() === "")
		) {
			// Remove filter
			if (existingFilterIndex >= 0) {
				onFilterChange(filters.filter((f) => f.id !== columnKey));
			}
		} else {
			// Add or update filter
			const newFilter = { id: columnKey, value };
			if (existingFilterIndex >= 0) {
				const newFilters = [...filters];
				newFilters[existingFilterIndex] = newFilter;
				onFilterChange(newFilters);
			} else {
				onFilterChange([...filters, newFilter]);
			}
		}
	};

	const handleMultiSelectChange = (columnKey: string, optionValue: string) => {
		const currentValue = getFilterValue(columnKey) || [];
		const currentArray = Array.isArray(currentValue) ? currentValue : [currentValue];

		const newValue = currentArray.includes(optionValue)
			? currentArray.filter((v) => v !== optionValue)
			: [...(currentArray as string[]), optionValue];

		updateFilter(columnKey, newValue.length > 0 ? newValue : null);
	};

	const handleRadioSelectChange = (columnKey: string, optionValue: string) => {
		updateFilter(columnKey, optionValue);
	};

	const clearAllFilters = () => {
		onFilterChange([]);
		setSearchTerm("");
		onApplyFilters?.([]);
	};

	const applyFilters = () => {
		setIsOpen(false);
		onApplyFilters?.(filters);
	};

	useEffect(() => {
		// Set initial open sections
		const initialOpenSections = filterableColumns.reduce(
			(acc, column, index) => {
				acc[column.key] = index === 0;
				return acc;
			},
			{} as Record<string, boolean>
		);
		setOpenSections(initialOpenSections);
	}, [filterableColumns]);

	const toggleSection = (sectionKey: string) => {
		setOpenSections((prev) => ({
			...prev,
			[sectionKey]: !prev[sectionKey],
		}));
	};

	const activeFiltersCount = filters.length;
	const hasActiveFilters = activeFiltersCount > 0;

	const filteredColumns = filterableColumns.filter((column) =>
		column.label.toLowerCase().includes(searchTerm.toLowerCase())
	);

	return (
		<>
			<Popover open={isOpen} onOpenChange={setIsOpen}>
				<PopoverTrigger asChild data-testid="filter-control">
					{children ? (
						children
					) : (
						<Button
							variant="outline"
							data-testid="filter-control-trigger"
							className="bg-muted hover:bg-muted/50 size-10 gap-2 rounded-lg border-none p-0"
						>
							<Filter className="size-5" />
						</Button>
					)}
				</PopoverTrigger>
				<PopoverContent
					data-testid="filter-control-content"
					className="w-[95%] min-w-[310px] gap-0 p-0 sm:w-full sm:max-w-[384px] sm:min-w-[384px]"
				>
					<div className={`bg-background rounded-lg text-base ${className}`}>
						<div className="border-b p-4">
							<div className="mb-3 flex items-center justify-between">
								<h3 className="font-semibold">Filter By</h3>

								<Button
									variant="ghost"
									data-testid="filter-control-close-button"
									size="sm"
									onClick={() => setIsOpen(false)}
								>
									<X className="h-4 w-4" />
								</Button>
							</div>

							<div className="relative">
								<Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
								<Input
									placeholder="Search filters..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-9"
									data-testid="filter-control-search"
								/>
							</div>
						</div>

						<div className="max-h-96 overflow-y-auto">
							{filteredColumns.map((column) => (
								<Collapsible
									key={column.key}
									open={openSections[column.key]}
									onOpenChange={() => toggleSection(column.key)}
									data-testid={`filter-control-section-${column.key}`}
								>
									<CollapsibleTrigger
										data-testid={`filter-control-section-trigger-${column.key}`}
										className={cn(
											"hover:bg-muted/50 flex w-full items-center justify-between p-4 text-left",
											!openSections[column.key] && "border-b"
										)}
									>
										<span className="font-medium">{column.label}</span>
										{openSections[column.key] ? (
											<ChevronDown className="h-4 w-4" />
										) : (
											<ChevronRight className="h-4 w-4" />
										)}
									</CollapsibleTrigger>
									<CollapsibleContent className="bg-muted/20 border-b p-4">
										{column.type === FILTER_TYPE.MULTISELECT && (
											<div className="space-y-2">
												{column.options?.map((option: FilterOption) => {
													const currentValue = getFilterValue(column.key) || [];
													const isChecked = Array.isArray(currentValue)
														? currentValue.includes(option.value)
														: currentValue === option.value;

													return (
														<div key={option.value} className="flex items-center space-x-2">
															<Checkbox
																id={`${column.key}-${option.value}`}
																checked={isChecked}
																onCheckedChange={() => handleMultiSelectChange(column.key, option.value)}
															/>
															<label htmlFor={`${column.key}-${option.value}`} className="cursor-pointer text-sm">
																{option.label}
															</label>
														</div>
													);
												})}
											</div>
										)}
										{column.type === FILTER_TYPE.RADIO && (
											<div className="space-y-2">
												<RadioGroup
													onValueChange={(value) => handleRadioSelectChange(column.key, value)}
													value={(getFilterValue(column.key) as string) || ""}
													className="flex flex-wrap items-center gap-3"
												>
													{column.options?.map((option) => (
														<div key={option.value} className="flex items-center space-x-2">
															<RadioGroupItem value={option.value} id={`${column.key}-${option.value}`} />
															<Label
																htmlFor={`${column.key}-${option.value}`}
																className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
															>
																{option.label}
															</Label>
														</div>
													))}
												</RadioGroup>
											</div>
										)}

										{column.type === FILTER_TYPE.RANGE && (
											<RangeSlider
												min={column.min || 0}
												max={column.max || 100}
												step={column.step || 10}
												value={(getFilterValue(column.key) as [number, number]) || [column.min || 0, column.max || 100]}
												onChange={(value) => updateFilter(column.key, value)}
												label={column.label}
											/>
										)}

										{column.type === FILTER_TYPE.DATERANGE && (
											<>
												{(() => {
													const current = (getFilterValue(column.key) || { from: "", to: "" }) as {
														from: string;
														to: string;
													};
													return (
														<DatePicker
															type="date-range"
															dateFrom={current?.from}
															dateTo={current?.to}
															onDateFromChange={(date) => {
																const current = getFilterValue(column.key) || {};
																updateFilter(column.key, { ...current, from: date });
															}}
															onDateToChange={(date) => {
																const current = getFilterValue(column.key) || {};
																updateFilter(column.key, { ...current, to: date });
															}}
														/>
													);
												})()}
											</>
										)}

										{column.type === FILTER_TYPE.SEARCH && (
											<Input
												data-testid={`filter-control-search-${column.key}`}
												placeholder={column.placeholder || `Search ${column.label.toLowerCase()}...`}
												value={(getFilterValue(column.key) as string) || ""}
												onChange={(e) => updateFilter(column.key, e.target.value)}
											/>
										)}
										{column.type === FILTER_TYPE.DATE && (
											<DatePicker
												type="date"
												dateFrom={(getFilterValue(column.key) as string) || ""}
												onDateChange={(date) => updateFilter(column.key, date)}
											/>
										)}
									</CollapsibleContent>
								</Collapsible>
							))}
						</div>

						<div className="bg-muted/20 border-t p-4">
							<div className="flex gap-2">
								<Button
									variant="outline"
									data-testid="clear-all-filters-button"
									onClick={clearAllFilters}
									disabled={!hasActiveFilters}
									className="flex-1"
								>
									Clear all filters
								</Button>

								<Button
									data-testid="apply-filters-button"
									onClick={applyFilters}
									className="flex-1 bg-black text-white hover:bg-black/90"
								>
									Apply Filters
								</Button>
							</div>
						</div>
					</div>
				</PopoverContent>
			</Popover>
		</>
	);
}
