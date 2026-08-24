import type { FormFieldConfig } from "@/components/common/form/types";
import type { ForgotPasswordFormData, LoginFormData, TEmailLoginFormData } from "@/module/auth/utils/form-utils";

const emailFieldConfig: FormFieldConfig<LoginFormData> = {
	name: "email",
	placeholder: "Email",
	fieldVariant: "input",
	label: "Email",
	inputProps: {
		type: "email",
	},
};

const passwordFieldConfig: FormFieldConfig<LoginFormData> = {
	name: "password",
	placeholder: "Password",
	fieldVariant: "input",
	label: "Password",
	inputProps: {
		type: "password",
	},
};

export const signinFormConfig = {
	email: emailFieldConfig,
	password: passwordFieldConfig,
};

export const emailSigninFormConfig: Record<keyof TEmailLoginFormData, FormFieldConfig<TEmailLoginFormData>> = {
	email: {
		name: "email",
		placeholder: "Email",
		fieldVariant: "input",
		label: "Email Address",
		inputProps: {
			type: "email",
		},
	},
};
export const forgotPasswordFormConfig: Record<keyof ForgotPasswordFormData, FormFieldConfig<ForgotPasswordFormData>> = {
	email: {
		name: "email",
		placeholder: "john@example.com",
		fieldVariant: "input",
		label: "Email Address",
		inputProps: {
			type: "email",
		},
	},
};
