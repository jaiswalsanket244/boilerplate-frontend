import { RenderFormInput } from "@/components/common/form/render-form-input";
import type { FormInputWrapperProps } from "@/components/common/form/types";
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { Controller, type FieldValues } from "react-hook-form";

export function FormInputWrapper<TData extends FieldValues>({
	form,
	fieldConfig,
	className,
	wrapperClassName,
	disabled,
}: FormInputWrapperProps<TData>) {
	return (
		<Controller
			name={fieldConfig.name}
			control={form.control}
			render={({ field, fieldState }) => (
				<Field data-invalid={fieldState.invalid} className={cn("gap-1.5", wrapperClassName)}>
					<FieldContent className="flex-none">
						{fieldConfig.label && <FieldLabel htmlFor={field.name}>{fieldConfig.label}</FieldLabel>}
						{fieldConfig.description && <FieldDescription>{fieldConfig.description}</FieldDescription>}
					</FieldContent>
					<RenderFormInput field={field} fieldConfig={fieldConfig} className={className} disabled={disabled} />
					{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
				</Field>
			)}
		/>
	);
}
