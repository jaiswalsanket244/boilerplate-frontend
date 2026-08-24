"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { routes } from "@/config/routes";
import { ARIA_ROLE } from "@/lib/constants/aria";
import { MFA_AUTH_CONTEXT_VALUES } from "@/lib/constants/paths";
import { clearCookies, setCookies } from "@/lib/utils/cookies";
import { clearSessionStorage, getSessionStorage, setSessionStorage } from "@/lib/utils/session-storage";
import { useAuthAPI } from "@/module/auth/hooks/useAuth";
import { mfaDeviceActivationSchema, type TMfaDeviceActivationFormData } from "@/module/auth/utils/mfa-schemas";
import { useProfileAPI } from "@/module/profile/hooks/useProfile";
import { COOKIES, SESSION_STORAGE_KEYS } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_MS = 60_000;
const AUTO_RESEND_COOLDOWN_MS = 1000 * 60 * 5; // 5 minutes

export default function MfaResetVerificationForm() {
	const router = useRouter();
	const queryClient = useQueryClient();

	const { useGetUserData } = useProfileAPI();
	const { useInitiateMfaResetEmailOtpMutation, useVerifyMfaResetIdentityMutation } = useAuthAPI();

	const { data: userData } = useGetUserData();

	const [emailOtpStatus, setEmailOtpStatus] = useState<string | null>(null);
	const [remainingSeconds, setRemainingSeconds] = useState(0);
	const [resendAvailableAt, setResendAvailableAt] = useState<number | null>(null);

	const initiateResetEmailOtpMutation = useInitiateMfaResetEmailOtpMutation();
	const verifyResetIdentityMutation = useVerifyMfaResetIdentityMutation();

	const form = useForm<TMfaDeviceActivationFormData>({
		resolver: zodResolver(mfaDeviceActivationSchema),
		defaultValues: {
			code: "",
		},
	});
	const code = form.watch("code");

	const triggerOtpRequest = useCallback(async () => {
		if (remainingSeconds > 0 || initiateResetEmailOtpMutation.isPending) return;

		const nextAutoSendAt = Date.now() + AUTO_RESEND_COOLDOWN_MS;
		setSessionStorage(SESSION_STORAGE_KEYS.MFA_AUTO_EMAIL_OTP_SEND_AT, nextAutoSendAt);

		try {
			await initiateResetEmailOtpMutation.mutateAsync();
			setEmailOtpStatus("A verification code was sent to your email. Check your inbox.");

			const targetTime = Date.now() + RESEND_COOLDOWN_MS;
			setSessionStorage(SESSION_STORAGE_KEYS.MFA_RESET_EMAIL_OTP_RESEND_AT, targetTime);
			setResendAvailableAt(targetTime);
			setRemainingSeconds(60);
		} catch {
			clearSessionStorage(SESSION_STORAGE_KEYS.MFA_AUTO_EMAIL_OTP_SEND_AT);
			setEmailOtpStatus("We couldn't send the code. Please try again manually.");
		}
	}, [initiateResetEmailOtpMutation, remainingSeconds]);

	// Initialize: Handle auto-send and persistent countdown on mount
	useEffect(() => {
		const storedTime = getSessionStorage<number>(SESSION_STORAGE_KEYS.MFA_RESET_EMAIL_OTP_RESEND_AT);

		if (storedTime && storedTime > Date.now()) {
			// Cooldown still active, show old countdown
			setResendAvailableAt(storedTime);
			setRemainingSeconds(Math.ceil((storedTime - Date.now()) / 1000));
			setEmailOtpStatus("A verification code was sent to your email. Check your inbox.");
			return;
		}
		const autoSendTime = getSessionStorage<number>(SESSION_STORAGE_KEYS.MFA_AUTO_EMAIL_OTP_SEND_AT) ?? 0;

		if (autoSendTime > Date.now()) {
			return;
		}
		triggerOtpRequest();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (!resendAvailableAt) return;

		const interval = setInterval(() => {
			const secondsLeft = Math.max(0, Math.ceil((resendAvailableAt - Date.now()) / 1000));
			setRemainingSeconds(secondsLeft);

			if (secondsLeft === 0) {
				setResendAvailableAt(null);
				clearSessionStorage(SESSION_STORAGE_KEYS.MFA_RESET_EMAIL_OTP_RESEND_AT);
			}
		}, 1000);

		return () => clearInterval(interval);
	}, [resendAvailableAt]);

	const handleCodeChange = (value: string) => {
		form.setValue("code", value);
		if (form.formState.errors.code) {
			form.clearErrors("code");
		}
	};

	const onSubmit = async (data: TMfaDeviceActivationFormData) => {
		try {
			await verifyResetIdentityMutation.mutateAsync({ method: "email_otp", code: data.code });
			queryClient.removeQueries({ queryKey: ["mfa-setup-data"], exact: true });

			const contextValue = userData?.mfa?.enrolled
				? MFA_AUTH_CONTEXT_VALUES.RESET_SETUP
				: MFA_AUTH_CONTEXT_VALUES.SETUP;

			setCookies({ [COOKIES.MFA_AUTH_CONTEXT]: contextValue }, 1 / 24);
			router.push(routes.auth.mfaSetup);
		} catch {
			form.setError("code", { message: "Invalid code" });
		}
	};

	return (
		<div className="flex justify-center p-2">
			<div className="border-border/60 mt-20 w-full max-w-md rounded-xl border p-4">
				<div className="mb-8 space-y-2">
					<h1 className="text-foreground text-2xl font-bold">Verify Your Identity</h1>
					<p className="text-foreground/80 text-sm">
						Confirm it is really you before configuring multi-factor authentication.
					</p>
				</div>

				<div className="mb-6 space-y-4">
					<div className="flex items-center justify-between gap-3 rounded-lg border p-3">
						<p className="text-foreground/80 text-sm">Hasn&apos;t received the code?</p>
						<Button
							type="button"
							onClick={() => void triggerOtpRequest()}
							disabled={initiateResetEmailOtpMutation.isPending || remainingSeconds > 0}
						>
							{initiateResetEmailOtpMutation.isPending ? (
								<Loader2Icon className="h-4 w-4 animate-spin" />
							) : remainingSeconds > 0 ? (
								`Resend in ${remainingSeconds}s`
							) : (
								"Resend otp"
							)}
						</Button>
					</div>

					{emailOtpStatus ? (
						<p className="text-txt-primary text-center text-sm" role={ARIA_ROLE.STATUS}>
							{emailOtpStatus}
						</p>
					) : null}
				</div>

				<form onSubmit={(event) => void form.handleSubmit(onSubmit)(event)} className="space-y-6">
					<div className="flex w-full justify-center space-y-4">
						<Field data-invalid={!!form.formState.errors.code} className="flex w-full items-center justify-center">
							<FieldLabel className="text-foreground flex justify-center text-sm font-medium">
								Enter the email verification code
							</FieldLabel>
							<InputOTP
								id="mfa-reset-code"
								maxLength={OTP_LENGTH}
								pattern={REGEXP_ONLY_DIGITS}
								value={code}
								onChange={handleCodeChange}
								data-testid="input-otp"
								className="flex w-full justify-center"
								containerClassName="flex w-full justify-center custom-class"
							>
								<InputOTPGroup className="justify-center gap-2">
									{Array.from({ length: OTP_LENGTH }).map((_, index) => (
										<InputOTPSlot
											key={`mfa-reset-code-slot-${index}`}
											index={index}
											className="border-border/50 bg-muted/70 size-10 rounded-md border text-base shadow-none data-[state=active]:ring-2 data-[state=active]:ring-black/80 sm:size-14 sm:text-xl"
										/>
									))}
								</InputOTPGroup>
							</InputOTP>
							<FieldError>{form.formState.errors.code?.message}</FieldError>
						</Field>
					</div>

					<Button
						className="w-full"
						type="submit"
						size="lg"
						disabled={
							initiateResetEmailOtpMutation.isPending ||
							verifyResetIdentityMutation.isPending ||
							code.length !== OTP_LENGTH
						}
					>
						{verifyResetIdentityMutation.isPending ? (
							<Loader2Icon className="h-4 w-4 animate-spin text-white" />
						) : (
							"Continue"
						)}
					</Button>

					<div className="mt-4 text-center">
						<button
							type="button"
							onClick={() => {
								clearCookies([COOKIES.MFA_AUTH_CONTEXT]);
								router.push(routes.settings.profile);
							}}
							className="text-foreground hover:text-blue text-sm underline"
						>
							Back to Settings
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
