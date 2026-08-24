"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { type AxiosError } from "axios";
import { Loader2Icon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { FormInputWrapper } from "@/components/common/form/form-input-wrapper";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { routes } from "@/config/routes";
import { setSessionStorage } from "@/lib/utils/session-storage";
import AuthLayout from "@/module/auth/components/auth-layout";
import { useAuthAPI } from "@/module/auth/hooks/useAuth";
import { AUTH_PAGE_TYPE, type IRequestOtpResponse, OTP_PURPOSE } from "@/module/auth/types";
import { signupFormConfig } from "@/module/auth/utils/form-field-configs/signup";
import { type SignUpFormData, SignUpSchema } from "@/module/auth/utils/form-utils";
import { SESSION_STORAGE_KEYS } from "@/types";

export default function SignUpForm() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const searchParams = useSearchParams();

	const { useGetEmailsFromTokenMutation, useRequestOtpMutation } = useAuthAPI();

	const { mutate: getEmailsFromToken } = useGetEmailsFromTokenMutation();
	const { mutate: requestOtp, isPending: isRequestingOtp } = useRequestOtpMutation();

	const token = searchParams.get("inviteToken");

	const [isTokenExpiredError, setIsTokenExpiredError] = useState(false);
	const [error, setError] = useState("");

	const form = useForm<SignUpFormData>({
		resolver: zodResolver(SignUpSchema),
		mode: "onChange",
		reValidateMode: "onChange",
		defaultValues: {
			firstName: "",
			lastName: "",
			email: "",
		},
	});

	//user sign up flow using the invite token
	useEffect(() => {
		if (token) {
			setSessionStorage(SESSION_STORAGE_KEYS.INVITE_TOKEN, token);
			getEmailsFromToken(
				{ inviteToken: token },
				{
					onSuccess: (data) => {
						form.setValue("email", data.data);
					},
					onError: () => {
						setIsTokenExpiredError(true);
					},
				}
			);
		}
	}, [token, getEmailsFromToken, form]);

	const onSubmit = (data: SignUpFormData) => {
		// Store user data in React Query cache
		const userData = {
			firstName: data.firstName,
			lastName: data.lastName,
			email: data.email,
			...(token && { inviteToken: token }),
		};

		requestOtp(
			{ identifier: data.email, purpose: OTP_PURPOSE.SIGNUP },
			{
				onSuccess: () => {
					queryClient.setQueryData(["signupUserData"], userData);
					queryClient.setQueryDefaults(["signupUserData"], {
						gcTime: 15 * 60 * 1000,
						staleTime: 15 * 60 * 1000,
					});

					router.push(routes.auth.verifySignUpOtp);
				},
				onError: (error) => {
					const axiosError = error as AxiosError<IRequestOtpResponse>;

					setError(axiosError?.response?.data?.message || "Something went wrong!");
				},
			}
		);
	};

	const isEmailFieldDisabled = Boolean(token);

	return (
		<AuthLayout type={AUTH_PAGE_TYPE.SIGN_UP} showSocialAuth>
			<div className="space-y-10">
				<h1 className="font-lato text-[32px] font-bold">Sign Up</h1>

				<form onSubmit={(event) => void form.handleSubmit(onSubmit)(event)} className="space-y-4 px-3">
					<FieldGroup>
						<div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
							<FormInputWrapper form={form} fieldConfig={signupFormConfig.firstName} className="input-field" />
							<FormInputWrapper form={form} fieldConfig={signupFormConfig.lastName} className="input-field" />
						</div>

						<FormInputWrapper
							form={form}
							fieldConfig={signupFormConfig.email}
							className="input-field focus:ring-blue-500"
							disabled={isEmailFieldDisabled}
						/>
					</FieldGroup>
					{error && (
						<p className="text-error italic" data-testid="signup-error">
							{error}
						</p>
					)}

					{isTokenExpiredError && (
						<p className="text-error italic">Your Token is expired. Kindly ask for resend the invitation again!</p>
					)}

					<div className="pt-10">
						<Button
							type="submit"
							className="w-full"
							size="xl"
							disabled={form.formState.isSubmitting || !form.formState.isValid || isRequestingOtp}
							data-testid="signup-button"
						>
							{form.formState.isSubmitting || isRequestingOtp ? (
								<Loader2Icon className="h-4 w-4 animate-spin text-white" />
							) : (
								"Verify Email"
							)}
						</Button>
					</div>
				</form>
			</div>
		</AuthLayout>
	);
}
