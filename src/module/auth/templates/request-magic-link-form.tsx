"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { Loader2Icon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { FormInputWrapper } from "@/components/common/form/form-input-wrapper";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { ERROR_CODES } from "@/lib/constants/error-codes";
import AuthHeader from "@/module/auth/components/auth-header";
import AuthLayout from "@/module/auth/components/auth-layout";
import { useAuthAPI } from "@/module/auth/hooks/useAuth";
import type { IRequestMagicLinkResponse } from "@/module/auth/types";
import { emailSigninFormConfig } from "@/module/auth/utils/form-field-configs/signin";
import { type TEmailLoginFormData, emailLoginSchema } from "@/module/auth/utils/form-utils";

export default function RequestMagicLinkForm() {
	const form = useForm<TEmailLoginFormData>({
		resolver: zodResolver(emailLoginSchema),
		mode: "onSubmit",
		defaultValues: {
			email: "",
		},
	});
	const { useRequestMagicLinkMutation } = useAuthAPI();
	const { mutate: sendMagicLink, isPending: isEmailOtpPending } = useRequestMagicLinkMutation;

	const queryClient = useQueryClient();
	const [isSentMagicLink, setIsSentMagicLink] = useState(false);

	const onSubmit = (data: TEmailLoginFormData) => {
		const userData = {
			email: data.email,
		};

		sendMagicLink(
			{ email: data.email },
			{
				onSuccess: () => {
					queryClient.setQueryData(["signInUserData"], userData);
					queryClient.setQueryDefaults(["signInUserData"], {
						gcTime: 15 * 60 * 1000,
						staleTime: 15 * 60 * 1000,
					});

					setIsSentMagicLink(true);
				},
				onError: (error) => {
					const axiosError = error as AxiosError<IRequestMagicLinkResponse>;
					if (axiosError?.response?.data?.messageCode === ERROR_CODES.EMAIL_NOT_FOUND) {
						form.setError("email", {
							message: "Email not found",
						});
					} else {
						form.setError("email", {
							message: axiosError?.response?.data?.message || "Something went wrong!",
						});
					}
				},
			}
		);
	};

	return (
		<AuthLayout>
			<AuthHeader
				title="Sign In"
				description="We'll email you a link  for a password-free sign in. You can choose to"
				linkText="Sign in with a password"
				linkHref={routes.auth.signIn}
				secondLinkHref={routes.auth.requestLoginOtp}
				secondLinkText="Sign in with OTP"
			/>

			<form onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}>
				<div className="space-y-10">
					<FormInputWrapper
						form={form}
						fieldConfig={emailSigninFormConfig.email}
						className={`${form.formState.errors.email ? "input-field-error" : "input-field"}`}
					/>

					{isSentMagicLink ? (
						<div className="space-y-2 rounded-lg border border-success bg-success/10 p-2 text-center text-base text-success">
							<p>Email sent successfully! Please check your email for further instructions.</p>
						</div>
					) : (
						<Button
							className="w-full"
							type="submit"
							size="xl"
							disabled={form.formState.isSubmitting || !form.formState.isValid || isEmailOtpPending}
						>
							{form.formState.isSubmitting || isEmailOtpPending ? (
								<Loader2Icon className="h-4 w-4 animate-spin text-white" />
							) : (
								"Get Magic Link"
							)}
						</Button>
					)}
				</div>
			</form>
		</AuthLayout>
	);
}
