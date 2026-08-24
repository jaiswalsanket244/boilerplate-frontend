import { FormInput, FormTextarea } from "@/components/common/form/form-input";
import MultiSelect from "@/components/common/form/multi-select";
import { FormRadioGroup } from "@/components/common/form/radio-group";
import SearchableSelect from "@/components/common/form/searchable-select";
import type { RenderFormInputProps } from "@/components/common/form/types";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { type FieldValues } from "react-hook-form";
import { FormDateInput } from "@/components/common/form/date-input";

export function RenderFormInput<TData extends FieldValues>({
	field,
	fieldConfig,
	className,
	disabled,
}: RenderFormInputProps<TData>) {
	const baseClassName = "rounded-lg bg-background";

	switch (fieldConfig.fieldVariant) {
		case "input":
			return <FormInput field={field} fieldConfig={fieldConfig} className={className} disabled={disabled} />;

		case "textarea":
			return <FormTextarea field={field} fieldConfig={fieldConfig} className={className} disabled={disabled} />;

		case "radio-group":
			return <FormRadioGroup field={field} fieldConfig={fieldConfig} className={className} disabled={disabled} />;

		case "date":
			return <FormDateInput field={field} fieldConfig={fieldConfig} className={className} disabled={disabled} />;

		case "select":
			return (
				<Select onValueChange={field.onChange} value={field.value} disabled={disabled || fieldConfig.disabled}>
					<SelectTrigger id={field.name} className={cn(baseClassName, fieldConfig.className, className)}>
						<SelectValue placeholder={fieldConfig.placeholder} />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							{fieldConfig.options.map((option) => (
								<SelectItem key={option.value} value={option.value} disabled={option.disabled}>
									{option.label}
								</SelectItem>
							))}
						</SelectGroup>
					</SelectContent>
				</Select>
			);

		case "multi-select":
			return (
				<MultiSelect
					options={fieldConfig.options}
					value={field.value || []}
					onChange={field.onChange}
					placeholder={fieldConfig.placeholder}
					onSearch={fieldConfig.onSearch}
					disabled={disabled || fieldConfig.disabled}
					className={cn(fieldConfig.className, className)}
				/>
			);

		case "searchable-select":
			return (
				<SearchableSelect
					options={fieldConfig.options}
					value={String(field.value)}
					onChange={field.onChange}
					placeholder={fieldConfig.placeholder}
					onSearch={fieldConfig.onSearch}
					disabled={disabled || fieldConfig.disabled}
					className={cn(fieldConfig.className, className)}
				/>
			);

		case "currency-input":
			return (
				<div className={cn("relative", fieldConfig.className)}>
					<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
						{fieldConfig.currencySymbol || "$"}
					</span>
					<Input
						{...field}
						{...fieldConfig.inputProps}
						type="number"
						id={field.name}
						disabled={disabled || fieldConfig.disabled}
						className={cn(baseClassName, "pl-8")}
						placeholder={fieldConfig.placeholder}
					/>
				</div>
			);

		default:
			return null;
	}
}
