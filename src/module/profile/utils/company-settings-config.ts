import type { FormFieldConfig } from "@/components/common/form/types";
import { type TCompanySettingsForm } from "@/module/profile/types";

export const companySettingsFormConfig: {
	supportEmail: FormFieldConfig<TCompanySettingsForm>;
	passwordValidityDays: FormFieldConfig<TCompanySettingsForm>;
	gracePeriodDays: FormFieldConfig<TCompanySettingsForm>;
} = {
	supportEmail: {
		fieldVariant: "input",
		name: "supportEmail",
		label: "Support Email",
		placeholder: "Enter support email",
		className: "h-12 w-full rounded-lg border border-border px-4 py-3 focus:ring-2",
	},
	passwordValidityDays: {
		fieldVariant: "input",
		name: "passwordValidityDays",
		label: "Password Validity Days",
		placeholder: "e.g., 90",
		inputProps: {
			type: "number",
			min: 1,
		},
		className: "h-12 w-full rounded-lg border border-border px-4 py-3 focus:ring-2",
	},
	gracePeriodDays: {
		fieldVariant: "input",
		name: "gracePeriodDays",
		label: "Grace Period Days",
		placeholder: "e.g., 5",
		inputProps: {
			type: "number",
			min: 0,
		},
		className: "h-12 w-full rounded-lg border border-border px-4 py-3 focus:ring-2",
	},
};
