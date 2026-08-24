"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { type AxiosError } from "axios";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { FormInputWrapper } from "@/components/common/form/form-input-wrapper";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { ERROR_CODES } from "@/lib/constants/error-codes";
import { cn } from "@/lib/utils";
import AuthHeader from "@/module/auth/components/auth-header";
import AuthLayout from "@/module/auth/components/auth-layout";
import { useAuthAPI } from "@/module/auth/hooks/useAuth";
import { type IRequestOtpResponse, OTP_PURPOSE } from "@/module/auth/types";
import { emailSigninFormConfig } from "@/module/auth/utils/form-field-configs/signin";
import { type TEmailLoginFormData, emailLoginSchema } from "@/module/auth/utils/form-utils";

export default function RequestLoginOtpForm() {
	const router = useRouter();
	const queryClient = useQueryClient();

	const { useRequestOtpMutation } = useAuthAPI();

	const form = useForm<TEmailLoginFormData>({
		resolver: zodResolver(emailLoginSchema),
		mode: "onSubmit",
		defaultValues: {
			email: "",
		},
	});
	const { mutate: requestOtp, isPending: isRequestingOtp } = useRequestOtpMutation();
	const [isSentOtp, setIsSentOtp] = useState(false);

	const onSubmit = (data: TEmailLoginFormData) => {
		const userData = {
			email: data.email,
		};

		requestOtp(
			{ identifier: data.email, purpose: OTP_PURPOSE.LOGIN },
			{
				onSuccess: () => {
					setIsSentOtp(true);
					queryClient.setQueryData(["signInUserData"], userData);
					queryClient.setQueryDefaults(["signInUserData"], {
						gcTime: 15 * 60 * 1000,
						staleTime: 15 * 60 * 1000,
					});

					setTimeout(() => {
						router.push(routes.auth.verifyLoginOtp);
					}, 300);
				},
				onError: (error) => {
					const axiosError = error as AxiosError<IRequestOtpResponse>;
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
				description="We'll email you an OTP for a password-free sign in. You can choose to"
				linkText="Sign in with a password"
				linkHref={routes.auth.signIn}
				secondLinkHref={routes.auth.requestLoginMagicLink}
				secondLinkText="Sign in with a magic link"
			/>

			<form onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}>
				<div className="space-y-10">
					<FormInputWrapper
						form={form}
						fieldConfig={emailSigninFormConfig.email}
						className={cn(
							form.formState.errors.email ? "input-field-error" : isSentOtp ? "input-field-success" : "input-field"
						)}
						wrapperClassName="gap-2"
					/>

					<Button
						className={cn("w-full")}
						type="submit"
						size="xl"
						disabled={form.formState.isSubmitting || !form.formState.isValid || isRequestingOtp}
						data-testid="send-otp-button"
					>
						{form.formState.isSubmitting || isRequestingOtp ? (
							<Loader2Icon className="h-4 w-4 animate-spin text-white" />
						) : (
							"Send OTP"
						)}
					</Button>
				</div>
			</form>
		</AuthLayout>
	);
}
