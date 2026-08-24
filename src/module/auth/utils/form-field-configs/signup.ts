import type { FormFieldConfig } from "@/components/common/form/types";
import type { SignUpFormData } from "@/module/auth/utils/form-utils";

const emailFieldConfig: FormFieldConfig<SignUpFormData> = {
	name: "email",
	placeholder: "example@gmail.com",
	fieldVariant: "input",
	label: "Email",
	inputProps: {
		type: "email",
	},
};

const firstNameFieldConfig: FormFieldConfig<SignUpFormData> = {
	name: "firstName",
	placeholder: "John",
	fieldVariant: "input",
	label: "First Name",
	inputProps: {
		type: "text",
	},
};
const lastNameFieldConfig: FormFieldConfig<SignUpFormData> = {
	name: "lastName",
	placeholder: "Doe",
	fieldVariant: "input",
	label: "Last Name",
	inputProps: {
		type: "text",
	},
};

export const signupFormConfig = {
	email: emailFieldConfig,
	firstName: firstNameFieldConfig,
	lastName: lastNameFieldConfig,
};
