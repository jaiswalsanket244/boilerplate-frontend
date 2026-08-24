import { type FormFieldConfig } from "@/components/common/form/types";
import { type ProfileFormTypes } from "@/module/profile/types";

export const profileFormConfig: Record<keyof ProfileFormTypes, FormFieldConfig<ProfileFormTypes>> = {
	firstName: {
		fieldVariant: "input",
		name: "firstName",
		label: "First Name",
		placeholder: "Enter your first name",
		className: "h-12 w-full rounded-lg border border-border px-4 py-3 focus:ring-2",
	},

	lastName: {
		fieldVariant: "input",
		name: "lastName",
		label: "Last Name",
		placeholder: "Enter your last name",
		className: "h-12 w-full rounded-lg border border-border px-4 py-3 focus:ring-2",
	},

	email: {
		fieldVariant: "input",
		name: "email",
		label: "Email",
		placeholder: "Enter your email",
		disabled: true,
		className:
			"h-12 w-full rounded-lg border border-border px-4 py-3 focus:ring-2 disabled:bg-muted/30 disabled:text-txt-secondary-900",
	},
};
