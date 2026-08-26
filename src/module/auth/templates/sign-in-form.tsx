"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { type AxiosError } from "axios";
import { Loader2Icon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { PiArrowRightBold } from "react-icons/pi";

import { FormInputWrapper } from "@/components/common/form/form-input-wrapper";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { ERROR_CODES } from "@/lib/constants/error-codes";
import { MFA_AUTH_CONTEXT_VALUES } from "@/lib/constants/paths";
import { setCookies } from "@/lib/utils/cookies";
import AuthHeader from "@/module/auth/components/auth-header";
import AuthLayout from "@/module/auth/components/auth-layout";
import { useAuthAPI } from "@/module/auth/hooks/useAuth";
import { AUTH_PAGE_TYPE, type ILoginResponse } from "@/module/auth/types";
import { signinFormConfig } from "@/module/auth/utils/form-field-configs/signin";
import { type LoginFormData, loginSchema } from "@/module/auth/utils/form-utils";
import { useMenuStore } from "@/stores/menu-store";
import { COOKIES } from "@/types";

export default function SignInForm() {
	const router = useRouter();
	const queryClient = useQueryClient();

	const { useLoginMutation } = useAuthAPI();
	const loginMutation = useLoginMutation();
	const setMenuForUser = useMenuStore((state) => state.setMenuForUser);
	const [isRedirecting, setIsRedirecting] = useState(false);

	const form = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		mode: "onChange",
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const onSubmit = (data: LoginFormData) => {
		const loginData = {
			email: data.email,
			password: data.password,
			loginType: "password",
		};

		loginMutation.mutate(loginData, {
			onSuccess: async (data) => {
				setIsRedirecting(true);

				if (data.isPasswordExpired) {
					router.replace(routes.settings.changePassword);
					return;
				}

				await queryClient.setQueryData(["userEmail"], data.user.email);

				const { user } = data;
				const userMfa = user.mfa ?? { enabled: false, enrolled: false };

				if (userMfa.enabled && userMfa.enrolled) {
					setCookies({ [COOKIES.MFA_AUTH_CONTEXT]: MFA_AUTH_CONTEXT_VALUES.VERIFICATION }, 1 / 24);
					router.replace(routes.auth.mfaVerify);
					return;
				}

				const { defaultRedirectUrl } = setMenuForUser(user, false);

				router.replace(defaultRedirectUrl);
			},
			onError: (error) => {
				const axiosError = error as AxiosError<ILoginResponse>;
				const messageCode = axiosError?.response?.data?.messageCode as string;

				if (messageCode === ERROR_CODES.USER_NOT_FOUND) {
					form.setError("email", {
						message: "User not found! Please check your email and try again.",
					});
				} else if (
					messageCode === ERROR_CODES.ACCOUNT_LOCKED ||
					messageCode === ERROR_CODES.ACCOUNT_LOCKED_RESET_REQUIRED
				) {
					// Account lockout is a form-level condition, not a bad-field error, so
					// surface it as a root message and leave the reset link reachable.
					form.setError("root", {
						message:
							axiosError.response?.data?.message || "Your account is locked due to too many failed login attempts.",
					});
				} else {
					form.setError("password", {
						message: axiosError.response?.data?.message || "Something went wrong!",
					});
					form.setError("email", {});
				}
			},
		});
	};

	return (
		<AuthLayout type={AUTH_PAGE_TYPE.SIGN_IN} showSocialAuth>
			<AuthHeader
				title="Sign In"
				description="Want to skip using a password?"
				linkText="Sign In with Magic Link"
				linkHref={routes.auth.requestLoginMagicLink}
				secondLinkText="Sign In with OTP"
				secondLinkHref={routes.auth.requestLoginOtp}
			/>

			<form onSubmit={(event) => void form.handleSubmit(onSubmit)(event)} className="space-y-10 px-3">
				<div className="space-y-4">
					<FormInputWrapper
						form={form}
						fieldConfig={signinFormConfig.email}
						className={
							form.formState.errors.email
								? "input-field-error"
								: `${isRedirecting ? "input-field-success" : "input-field"} `
						}
					/>
					<FormInputWrapper
						form={form}
						fieldConfig={signinFormConfig.password}
						className={
							form.formState.errors.email
								? "input-field-error"
								: `${isRedirecting ? "input-field-success" : "input-field"} `
						}
					/>
					<div className="flex-between">
						<Link
							href={routes.auth.forgotPassword}
							className="ml-auto text-sm leading-5 font-normal text-txt-tertiary-900 underline underline-offset-4"
						>
							Reset Password
						</Link>
					</div>
					{form.formState.errors.root && (
						<p role="alert" className="text-sm font-normal text-destructive">
							{form.formState.errors.root.message}
						</p>
					)}
				</div>
				<Button
					className="w-full"
					type="submit"
					size="xl"
					disabled={!form.formState.isValid || form.formState.isSubmitting || loginMutation.isPending}
					data-testid="signin-btn"
				>
					<span>
						{form.formState.isSubmitting || loginMutation.isPending ? (
							<Loader2Icon className="h-4 w-4 animate-spin text-primary-foreground" />
						) : (
							"Sign In"
						)}
					</span>{" "}
					<PiArrowRightBold className="ms-2 mt-0.5 h-5 w-5" />
				</Button>
			</form>
		</AuthLayout>
	);
}
