import { type FormFieldConfig } from "@/components/common/form/types";
import { type PasswordFormData } from "@/module/auth/utils/form-utils";

const passwordFieldConfig: FormFieldConfig<PasswordFormData> = {
	fieldVariant: "input",
	name: "password",
	label: "Password",
	placeholder: "Enter your password",
	inputProps: {
		type: "password",
	},
};

const confirmPasswordFieldConfig: FormFieldConfig<PasswordFormData> = {
	fieldVariant: "input",
	name: "confirmPassword",
	label: "Confirm Password",
	placeholder: "Re-enter your password",
	inputProps: {
		type: "password",
	},
};

export const passwordFormFieldsConfig = {
	password: passwordFieldConfig,
	confirmPassword: confirmPasswordFieldConfig,
};
