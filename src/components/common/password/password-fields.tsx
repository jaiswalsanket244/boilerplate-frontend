import { Check } from "lucide-react";
import { useFormContext } from "react-hook-form";

import { FormInputWrapper } from "@/components/common/form/form-input-wrapper";
import { passwordFormFieldsConfig } from "@/components/common/password/form-fields-config";
import CheckIcon from "@/components/shape/check-icon";
import {
	type PasswordFormData,
	hasLetter,
	hasMinLength,
	hasNumber,
	hasSpecialChar,
} from "@/module/auth/utils/form-utils";

export default function PasswordFields() {
	const form = useFormContext<PasswordFormData>();

	const password = form.watch("password");
	const confirmPassword = form.watch("confirmPassword");

	const goodPassword = () =>
		hasMinLength(password) && hasLetter(password) && hasNumber(password) && hasSpecialChar(password);

	return (
		<>
			<div>
				<FormInputWrapper
					form={form}
					fieldConfig={passwordFormFieldsConfig.password}
					className={`w-full ${goodPassword() ? "input-field-success" : form.formState.errors.confirmPassword ? "input-field-error" : "input-field"}`}
					wrapperClassName="gap-2"
				/>

				{goodPassword() && (
					<div className="mt-1 flex items-center gap-2">
						<div className="rounded-full bg-green p-0.5">
							<Check size={8} className="text-white" />
						</div>
						<p className="text-xs text-green">Password Strength: Good</p>
					</div>
				)}

				<div className="mt-2 space-y-2 text-xs">
					<PasswordRequirement valid={hasMinLength(password)} label="Minimum 8 characters" />
					<PasswordRequirement valid={hasLetter(password)} label="At least one letter" />
					<PasswordRequirement valid={hasNumber(password)} label="At least one number" />
					<PasswordRequirement valid={hasSpecialChar(password)} label="At least one special character" />
				</div>
			</div>

			<div>
				<FormInputWrapper
					form={form}
					fieldConfig={passwordFormFieldsConfig.confirmPassword}
					className={`${form.formState.errors.confirmPassword ? "input-field-error" : goodPassword() && confirmPassword === password ? "input-field-success" : "input-field"} w-full`}
					wrapperClassName="gap-2"
				/>

				{goodPassword() && confirmPassword === password && (
					<div className="mt-1 flex items-center gap-2 text-xs text-green">
						<div className="rounded-full bg-green p-0.5">
							<Check size={8} className="text-white" />
						</div>
						<p>Passwords match</p>
					</div>
				)}
			</div>
		</>
	);
}

function PasswordRequirement({ valid, label }: { valid: boolean; label: string }) {
	return (
		<div className="flex items-center font-lato">
			<div
				className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border ${
					valid ? "bg-primary text-primary-foreground" : "border-border"
				}`}
			>
				{valid && <CheckIcon />}
			</div>
			<span className={valid ? "text-green-600" : "text-txt-secondary-800"}>{label}</span>
		</div>
	);
}
