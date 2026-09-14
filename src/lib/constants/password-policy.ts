// Single source of truth for the frontend password policy.
// Rules are byte-identical to the backend policy (CYR-84): min 8, upper+lower, number, special @$%*&?!.
import { z } from "zod";

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_SPECIAL_CHARS = "@$%*&?!";

// Built from the canonical set so the validation regex and the checklist can never drift.
const specialCharRegex = new RegExp(`[${PASSWORD_SPECIAL_CHARS}]`);

export const hasMinLength = (password: string) => password.length >= PASSWORD_MIN_LENGTH;
export const hasUpperAndLower = (password: string) => /[A-Z]/.test(password) && /[a-z]/.test(password);
export const hasNumber = (password: string) => /\d/.test(password);
export const hasSpecialChar = (password: string) => specialCharRegex.test(password);

export const PASSWORD_REQUIREMENTS = [
	{ label: `Minimum ${PASSWORD_MIN_LENGTH} characters`, isSatisfied: hasMinLength },
	{ label: "Uppercase and lowercase", isSatisfied: hasUpperAndLower },
	{ label: "At least one number", isSatisfied: hasNumber },
	{ label: "At least one special character", isSatisfied: hasSpecialChar },
] as const;

export const strongPasswordSchema = z
	.string()
	.min(PASSWORD_MIN_LENGTH, { message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters` })
	.refine(hasUpperAndLower, {
		message: "Password must contain uppercase and lowercase letters",
	})
	.refine(hasNumber, {
		message: "Password must contain at least one number",
	})
	.refine(hasSpecialChar, {
		message: "Password must contain at least one special character",
	});
