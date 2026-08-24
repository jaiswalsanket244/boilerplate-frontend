"use client";

import { FormInputWrapper } from "@/components/common/form/form-input-wrapper";
import PasswordFields from "@/components/common/password/password-fields";
import { Button } from "@/components/ui/button";
import { ERROR_CODES } from "@/lib/constants/error-codes";
import { cn } from "@/lib/utils";
import { type ChangePasswordFormType, ChangePasswordSchema } from "@/module/auth/utils/form-utils";
import { useProfileAPI } from "@/module/profile/hooks/useProfile";
import type { ChangePasswordApiResponseType } from "@/module/profile/types/index";
import { changePasswordFormFieldsConfig } from "@/module/profile/utils/change-password-config";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AxiosError } from "axios";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";

export default function ChangePassword() {
	const queryClient = useQueryClient();

	const { useChangePassword, useGetUserData } = useProfileAPI();
	const { isPending: isChangePasswordPending } = useChangePassword;
	const { data: user } = useGetUserData();

	const form = useForm<ChangePasswordFormType>({
		resolver: zodResolver(ChangePasswordSchema),
		defaultValues: {
			currentPassword: "",
			password: "",
			confirmPassword: "",
		},
	});
	const [submitStatus, setSubmitStatus] = useState({
		success: {
			status: false,
			message: "",
		},
		error: {
			status: false,
			message: "",
		},
	});

	const onSubmit = (data: ChangePasswordFormType) => {
		useChangePassword.mutate(
			{
				currentPassword: data.currentPassword,
				newPassword: data.password,
				confirmedPassword: data.confirmPassword,
				email: user ? user?.email : "",
			},
			{
				onSuccess: () => {
					form.reset();
					setSubmitStatus({
						error: {
							status: false,
							message: "",
						},
						success: {
							status: true,
							message: "Password changed successfully!",
						},
					});

					queryClient.invalidateQueries({ queryKey: ["userData"] });
				},
				onError: (error) => {
					const axiosError = error as AxiosError<ChangePasswordApiResponseType>;
					const errCode = axiosError?.response?.data?.messageCode;

					let errMessage = axiosError?.response?.data?.message || "Something went wrong! Please try again.";

					if (errCode === ERROR_CODES.INVALID_PASSWORD) {
						errMessage = "Password mismatch! Please enter correct password.";
						form.setError("currentPassword", {
							message: errMessage,
						});
					} else {
						setSubmitStatus({
							error: {
								status: true,
								message: errMessage,
							},
							success: {
								status: false,
								message: "",
							},
						});
					}
				},
			}
		);
	};

	return (
		<div className="max-w-xl p-6">
			<form
				onSubmit={(e) => {
					void form.handleSubmit(onSubmit)(e);
				}}
				className="space-y-6"
			>
				<h1 className="text-black-400-32-700 mb-6 text-2xl font-bold">Change Password</h1>
				{user?.isPasswordExpired && (
					<div className="rounded-md border border-red-300 bg-red-100 p-2 text-center text-base text-red-600 dark:border-red-900 dark:bg-red-900/20 dark:text-red-400/70">
						Your password has expired. Please change your password to continue.
					</div>
				)}
				{user?.passwordExpiryDaysLeft && (
					<div className="flex justify-center rounded-md border border-red-300 bg-red-100 p-2 pr-7 text-center text-base text-red-600 dark:border-red-900 dark:bg-red-900/20 dark:text-red-400/70">
						<p className="max-w-sm">
							Password will expire in {user?.passwordExpiryDaysLeft} days. Please change your password to avoid any
							inconvenience.
						</p>
					</div>
				)}
				<FormInputWrapper
					form={form}
					fieldConfig={changePasswordFormFieldsConfig.currentPassword}
					className={cn("w-full", form.formState.errors.currentPassword ? "input-field-error" : "input-field")}
				/>

				<div className="space-y-4">
					<FormProvider {...form}>
						<PasswordFields />
					</FormProvider>
				</div>
				{submitStatus.error.status && <p className="text-center text-red-600">{submitStatus.error.message}</p>}
				{submitStatus.success.status && <p className="text-center text-green-600">{submitStatus.success.message}</p>}
				<div className="flex gap-5 pt-6">
					<Button
						type="submit"
						className="w-full rounded-md"
						disabled={form.formState.isSubmitting || isChangePasswordPending}
					>
						{form.formState.isSubmitting || isChangePasswordPending ? "Changing Password..." : "Change Password"}
					</Button>
				</div>
			</form>
		</div>
	);
}
