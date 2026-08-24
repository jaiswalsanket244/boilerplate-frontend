import { type ComponentPropsWithoutRef } from "react";
import type { ControllerRenderProps, FieldValues, Path, UseFormReturn } from "react-hook-form";

export interface IOptions {
	value: string;
	label: string;
	disabled?: boolean;
}

// Base field configuration
export interface BaseFieldConfig {
	label?: string;
	description?: string;
	placeholder?: string;
	disabled?: boolean;
	className?: string;
}

// Input field variant with all Input props
export interface InputFieldConfig extends BaseFieldConfig {
	fieldVariant: "input";
	inputProps?: Omit<ComponentPropsWithoutRef<"input">, "disabled" | "className" | "placeholder">;
}

// Textarea field variant with all Textarea props
export interface TextareaFieldConfig extends BaseFieldConfig {
	fieldVariant: "textarea";
	showCharCount?: boolean;
	textareaProps?: Omit<ComponentPropsWithoutRef<"textarea">, "disabled" | "className" | "placeholder">;
}

// Select field variant
export interface SelectFieldConfig extends BaseFieldConfig {
	fieldVariant: "select";
	options: IOptions[];
	placeholder?: string;
}

// Multi-select field variant
export interface MultiSelectFieldConfig extends BaseFieldConfig {
	fieldVariant: "multi-select";
	options: IOptions[];
	placeholder?: string;
	onSearch?: (value: string) => void;
}

export interface RadioGroupFieldConfig extends BaseFieldConfig {
	fieldVariant: "radio-group";
	options: IOptions[];
}

// Searchable select field variant
export interface SearchableSelectFieldConfig extends BaseFieldConfig {
	fieldVariant: "searchable-select";
	options: IOptions[];
	placeholder?: string;
	onSearch?: (value: string) => void;
}

// Currency input field variant
export interface CurrencyInputFieldConfig extends BaseFieldConfig {
	fieldVariant: "currency-input";
	inputProps?: Omit<ComponentPropsWithoutRef<"input">, "type" | "disabled" | "className" | "placeholder">;
	currencySymbol?: string;
}

export interface DateInputFieldConfig extends BaseFieldConfig {
	fieldVariant: "date";
	inputProps?: Omit<ComponentPropsWithoutRef<"input">, "type" | "disabled" | "className" | "placeholder">;
}

// Union type for all field configurations
export type FormFieldConfig<TData extends FieldValues> = (
	| InputFieldConfig
	| TextareaFieldConfig
	| SelectFieldConfig
	| MultiSelectFieldConfig
	| SearchableSelectFieldConfig
	| CurrencyInputFieldConfig
	| RadioGroupFieldConfig
	| DateInputFieldConfig
) & {
	name: Path<TData>;
};

export interface RenderFormInputProps<TData extends FieldValues> {
	field: ControllerRenderProps<TData, Path<TData>>;
	fieldConfig: FormFieldConfig<TData>;
	className?: string;
	disabled?: boolean;
}

export interface FormInputWrapperProps<TData extends FieldValues> {
	form: UseFormReturn<TData>;
	fieldConfig: FormFieldConfig<TData>;
	className?: string;
	wrapperClassName?: string;
	disabled?: boolean;
}

export type VariantFieldConfig<
	TData extends FieldValues,
	TVariant extends FormFieldConfig<TData>["fieldVariant"],
> = Extract<FormFieldConfig<TData>, { fieldVariant: TVariant }>;

export interface FormTextAreaProps<TData extends FieldValues> {
	field: ControllerRenderProps<TData, Path<TData>>;
	fieldConfig: VariantFieldConfig<TData, "textarea">;
	className?: string;
	disabled?: boolean;
}

export interface FormInputProps<TData extends FieldValues> {
	field: ControllerRenderProps<TData, Path<TData>>;
	fieldConfig: VariantFieldConfig<TData, "input">;
	className?: string;
	disabled?: boolean;
}

export interface FormRadioGroupProps<TData extends FieldValues> {
	field: ControllerRenderProps<TData, Path<TData>>;
	fieldConfig: VariantFieldConfig<TData, "radio-group">;
	className?: string;
	disabled?: boolean;
}

export interface FormDateInputProps<TData extends FieldValues> {
	field: ControllerRenderProps<TData, Path<TData>>;
	fieldConfig: VariantFieldConfig<TData, "date">;
	className?: string;
	disabled?: boolean;
}
