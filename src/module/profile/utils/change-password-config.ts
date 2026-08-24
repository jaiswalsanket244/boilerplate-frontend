import type { FormFieldConfig } from "@/components/common/form/types";
import type { ChangePasswordFormType } from "@/module/auth/utils/form-utils";

const currentPasswordFieldConfig: FormFieldConfig<ChangePasswordFormType> = {
	fieldVariant: "input",
	name: "currentPassword",
	label: "Current Password",
	placeholder: "Enter your current password",
	inputProps: {
		type: "password",
	},
};

export const changePasswordFormFieldsConfig = {
	currentPassword: currentPasswordFieldConfig,
};
