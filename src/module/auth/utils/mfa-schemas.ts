import { z } from "zod";

export const mfaDeviceActivationSchema = z.object({
	code: z
		.string()
		.min(6, "Code must be exactly 6 digits")
		.max(6, "Code must be exactly 6 digits")
		.regex(/^\d{6}$/, "Code must contain only numbers"),
});

export type TMfaDeviceActivationFormData = z.infer<typeof mfaDeviceActivationSchema>;

export const mfaRecoveryCodeSchema = z.object({
	recoveryCode: z.string().trim().min(1, "Recovery code is required"),
});

export type TMfaRecoveryCodeFormData = z.infer<typeof mfaRecoveryCodeSchema>;

export const mfaRecoverySchema = z.object({
	savedCodes: z.boolean().refine((val) => val === true, {
		message: "You must confirm that you have saved your recovery codes.",
	}),
});

export type TMfaRecoveryFormData = z.infer<typeof mfaRecoverySchema>;
