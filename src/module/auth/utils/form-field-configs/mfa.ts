import type { FormFieldConfig } from "@/components/common/form/types";
import type {
	TMfaDeviceActivationFormData,
	TMfaRecoveryCodeFormData,
	TMfaRecoveryFormData,
} from "@/module/auth/utils/mfa-schemas";

export const mfaDeviceActivationFormConfig: Record<
	keyof TMfaDeviceActivationFormData,
	FormFieldConfig<TMfaDeviceActivationFormData>
> = {
	code: {
		name: "code",
		placeholder: "Enter 6-digit code",
		fieldVariant: "input",
		label: "Enter the code displayed on your device.",
		inputProps: {
			type: "text",
			maxLength: 6,
		},
	},
};

export const mfaRecoveryFormConfig: Record<keyof TMfaRecoveryFormData, FormFieldConfig<TMfaRecoveryFormData>> = {
	savedCodes: {
		name: "savedCodes",
		fieldVariant: "input",
		label: "I've saved my recovery codes",
		inputProps: {
			type: "checkbox",
		},
	},
};

export const mfaRecoveryCodeFormConfig: Record<
	keyof TMfaRecoveryCodeFormData,
	FormFieldConfig<TMfaRecoveryCodeFormData>
> = {
	recoveryCode: {
		name: "recoveryCode",
		placeholder: "Enter your recovery code",
		fieldVariant: "input",
		label: "Recovery code",
		inputProps: {
			type: "text",
			autoCapitalize: "none",
			autoCorrect: "off",
		},
	},
};
