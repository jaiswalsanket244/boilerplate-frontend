"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type AxiosError } from "axios";
import { Loader2Icon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import PasswordFields from "@/components/common/password/password-fields";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import AuthLayout from "@/module/auth/components/auth-layout";
import { useAuthAPI } from "@/module/auth/hooks/useAuth";
import { AUTH_PAGE_TYPE, type IForgetPasswordResponse } from "@/module/auth/types";
import { type PasswordFormData, PasswordSchema } from "@/module/auth/utils/form-utils";

export default function ResetPasswordForm() {
	const searchParams = useSearchParams();
	const { useUpdatePasswordMutation } = useAuthAPI();
	const { isPending: isUpdatePasswordPending } = useUpdatePasswordMutation;
	const token: string = searchParams.get("token") as string;
	const paramsEmail = searchParams.get("email");

	const form = useForm<PasswordFormData>({
		resolver: zodResolver(PasswordSchema),
		mode: "onChange",
		defaultValues: {
			password: "",
			confirmPassword: "",
		},
	});

	const [errorMsg, setErrorMsg] = useState("");
	const [isSuccess, setIsSuccess] = useState(false);

	const onSubmit = (data: PasswordFormData) => {
		const formDataWithEmail = {
			...data,
			email: paramsEmail || "",
		};

		useUpdatePasswordMutation.mutate(
			{ userData: formDataWithEmail, token },
			{
				onSuccess: () => {
					setIsSuccess(true);
				},
				onError: (error) => {
					const axiosError = error as AxiosError<IForgetPasswordResponse>;
					const msg = axiosError.response?.data?.message || "Something went wrong!";

					setErrorMsg(msg);
				},
			}
		);
	};

	return (
		<AuthLayout type={AUTH_PAGE_TYPE.RESET_PASSWORD}>
			<form className="space-y-6" onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}>
				<h1 className="text-black-400-32-700">Reset Password</h1>

				<FormProvider {...form}>
					<PasswordFields />
				</FormProvider>
				{errorMsg && (
					<p className="my-1 text-error italic" data-testid="reset-password-error">
						{errorMsg}
					</p>
				)}
				{!isSuccess && (
					<Button
						className="mt-2 w-full"
						type="submit"
						size="xl"
						color="info"
						data-testid="reset-password-button"
						disabled={!form.formState.isValid || form.formState.isSubmitting || isUpdatePasswordPending}
					>
						{form.formState.isSubmitting || isUpdatePasswordPending ? (
							<Loader2Icon className="h-4 w-4 animate-spin text-white" />
						) : (
							"Reset Password"
						)}
					</Button>
				)}
				{isSuccess && (
					<div className="flex flex-col items-center gap-1 text-sm text-txt-primary">
						<p className="text-success">Password updated successfully!</p>
						<p>
							Please{" "}
							<Link className="text-blue underline underline-offset-1" href={routes.auth.signIn}>
								sign in
							</Link>{" "}
							with your new password.
						</p>
					</div>
				)}
			</form>
		</AuthLayout>
	);
}
