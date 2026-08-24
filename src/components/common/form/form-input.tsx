import type { FormInputProps, FormTextAreaProps } from "@/components/common/form/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { useMemo, useState } from "react";
import { type FieldValues } from "react-hook-form";

export function FormInput<TData extends FieldValues>({
	field,
	fieldConfig,
	className,
	disabled,
}: FormInputProps<TData>) {
	const baseClassName = "rounded-lg bg-background";
	const [showPassword, setShowPassword] = useState(false);

	const isPassword = fieldConfig.inputProps?.type === "password";

	const togglePassword = () => setShowPassword((prev) => !prev);

	return (
		<div className="relative">
			<Input
				{...field}
				{...fieldConfig.inputProps}
				type={isPassword && showPassword ? "text" : fieldConfig.inputProps?.type}
				placeholder={fieldConfig.placeholder}
				id={field.name}
				disabled={disabled || fieldConfig.disabled}
				className={cn(baseClassName, isPassword && "pr-8", fieldConfig.className, className)}
			/>
			{isPassword && (
				<Button
					type="button"
					onClick={togglePassword}
					aria-label={showPassword ? "Hide password" : "Show password"}
					className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
					variant="plain"
					size="icon"
				>
					{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
				</Button>
			)}
		</div>
	);
}

export function FormTextarea<TData extends FieldValues>({
	field,
	fieldConfig,
	className,
	disabled,
}: FormTextAreaProps<TData>) {
	const baseClassName = "rounded-lg bg-background resize-none";

	const maxLength = fieldConfig.textareaProps?.maxLength;

	const count = useMemo(() => (typeof field.value === "string" ? field.value.length : 0) as number, [field.value]);

	return (
		<div className="space-y-1">
			<Textarea
				{...field}
				{...fieldConfig.textareaProps}
				id={field.name}
				placeholder={fieldConfig.placeholder}
				disabled={disabled || fieldConfig.disabled}
				maxLength={maxLength}
				className={cn(baseClassName, fieldConfig.className, className)}
			/>
			{fieldConfig.showCharCount && maxLength && (
				<div className="text-right text-xs text-muted-foreground">
					{count} / {maxLength}
				</div>
			)}
		</div>
	);
}
