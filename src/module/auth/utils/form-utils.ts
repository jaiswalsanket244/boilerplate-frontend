import { z } from "zod";

import { strongPasswordSchema } from "@/lib/constants/password-policy";

export { hasMinLength, hasNumber, hasSpecialChar, hasUpperAndLower } from "@/lib/constants/password-policy";

const alphaOnlyRegex = /^[A-Za-z]+$/;
const strictEmailRegex =
	/^(?![.-])([A-Za-z0-9]+([._%+-]?[A-Za-z0-9]+)*)@([A-Za-z0-9]+(-?[A-Za-z0-9]+)*\.)+[A-Za-z]{2,}$/;

export const SignUpSchema = z.object({
	_id: z.string().optional(),

	firstName: z.string().min(1, { message: "First name is required" }).regex(alphaOnlyRegex, {
		message: "First name must contain only alphabetic characters",
	}),

	lastName: z.string().min(1, { message: "Last name is required" }).regex(alphaOnlyRegex, {
		message: "Last name must contain only alphabetic characters",
	}),

	email: z
		.string()
		.min(1, { message: "Email is required" })
		.refine((email) => strictEmailRegex.test(email), {
			message: "Invalid email address",
		}),
});

export type SignUpFormData = z.infer<typeof SignUpSchema>;

export const loginSchema = z.object({
	email: z.string().min(1, { message: "Email is required" }).email({ message: "Invalid email address" }),
	password: z.string().min(1, { message: "Password is required" }),
	rememberMe: z.boolean().optional(),
});
export type LoginFormData = z.infer<typeof loginSchema>;

export const PasswordSchema = z
	.object({
		password: strongPasswordSchema,
		confirmPassword: z.string().min(1, { message: "Please confirm your password" }),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});
export type PasswordFormData = z.infer<typeof PasswordSchema>;

export const ChangePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, { message: "Current password is required" }),
		password: strongPasswordSchema,
		confirmPassword: z.string().min(1, { message: "Please confirm your password" }),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});
export type ChangePasswordFormType = z.infer<typeof ChangePasswordSchema>;

export const forgotPasswordSchema = z.object({
	email: z
		.string()
		.min(1, { message: "Email is required" })
		.email({ message: "Invalid email address" })
		.refine((email) => strictEmailRegex.test(email), {
			message: "Invalid email address",
		}),
});
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const emailLoginSchema = z.object({
	email: z
		.string()
		.min(1, { message: "Email is required" })
		.refine((email) => strictEmailRegex.test(email), {
			message: "Invalid email address",
		}),
});
export type TEmailLoginFormData = z.infer<typeof emailLoginSchema>;

export const otpSchema = z.object({
	otp: z
		.string()
		.min(4, "OTP must be exactly 4 digits")
		.max(4, "OTP must be exactly 4 digits")
		.regex(/^\d{4}$/, "OTP must contain only numbers"),
});
