"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type AxiosError } from "axios";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { FormInputWrapper } from "@/components/common/form/form-input-wrapper";
import GoBackButton from "@/components/common/go-back-button";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import AuthLayout from "@/module/auth/components/auth-layout";
import { useAuthAPI } from "@/module/auth/hooks/useAuth";
import { AUTH_PAGE_TYPE, type IForgetPasswordResponse } from "@/module/auth/types";
import { forgotPasswordFormConfig } from "@/module/auth/utils/form-field-configs/signin";
import { type ForgotPasswordFormData, forgotPasswordSchema } from "@/module/auth/utils/form-utils";

export default function ForgetPasswordForm() {
	const router = useRouter();

	const form = useForm<ForgotPasswordFormData>({
		resolver: zodResolver(forgotPasswordSchema),
		mode: "onChange",
		defaultValues: {
			email: "",
		},
	});

	const { useForgetPasswordMutation } = useAuthAPI();
	const { isPending: isForgotPasswordPending } = useForgetPasswordMutation;

	const [submissionMsg, setSubmissionMsg] = useState({
		error: "",
		success: "",
	});

	const onSubmit = (data: ForgotPasswordFormData) => {
		useForgetPasswordMutation.mutate(data, {
			onSuccess: () => {
				setSubmissionMsg({
					success: "Email sent successfully! Please check your email for further instructions.",
					error: "",
				});
			},
			onError: (error) => {
				const axiosError = error as AxiosError<IForgetPasswordResponse>;
				form.setError("email", {
					message: axiosError?.response?.data?.message || "Something went wrong!",
				});
			},
		});
	};

	return (
		<AuthLayout type={AUTH_PAGE_TYPE.FORGOT_PASSWORD}>
			<div className="space-y-10">
				<div className="space-y-5">
					<GoBackButton onClick={() => router.push(routes.auth.signIn)} />
					<h1 className="text-black-400-32-700">Forgot Password</h1>
				</div>

				<form onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}>
					<div className="space-y-10">
						<FormInputWrapper
							form={form}
							fieldConfig={forgotPasswordFormConfig.email}
							className={`${form.formState.errors.email ? "input-field-error" : "input-field"}`}
							wrapperClassName="gap-1.5"
						/>

						{submissionMsg.success && (
							<p
								className="rounded-lg border-success bg-success/10 p-2 text-success italic"
								data-testid="forgot-password-success"
							>
								{submissionMsg.success}
							</p>
						)}

						{!submissionMsg.success && (
							<Button
								className="w-full"
								type="submit"
								size="lg"
								data-testid="forgot-password-button"
								disabled={!form.formState.isValid || form.formState.isSubmitting || isForgotPasswordPending}
							>
								{form.formState.isSubmitting || isForgotPasswordPending ? (
									<Loader2Icon className="h-4 w-4 animate-spin text-white" />
								) : (
									"Forgot Password"
								)}
							</Button>
						)}
					</div>
				</form>
			</div>
		</AuthLayout>
	);
}
