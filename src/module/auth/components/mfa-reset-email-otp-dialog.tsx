"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { routes } from "@/config/routes";
import { ARIA_ROLE } from "@/lib/constants/aria";
import { MFA_AUTH_CONTEXT_VALUES } from "@/lib/constants/paths";
import { setCookies } from "@/lib/utils/cookies";
import { clearSessionStorage, getSessionStorage, setSessionStorage } from "@/lib/utils/session-storage";
import { useAuthAPI } from "@/module/auth/hooks/useAuth";
import type { IMfaResetEmailOtpDialogProps } from "@/module/auth/types";
import { COOKIES, SESSION_STORAGE_KEYS } from "@/types";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_MS = 30_000;

export default function MfaResetEmailOtpDialog({ open, onOpenChange }: IMfaResetEmailOtpDialogProps) {
	const router = useRouter();

	const { useInitiateMfaResetEmailOtpMutation, useVerifyMfaResetIdentityMutation } = useAuthAPI();

	const initiateResetEmailOtpMutation = useInitiateMfaResetEmailOtpMutation();
	const verifyResetIdentityMutation = useVerifyMfaResetIdentityMutation();

	const [otp, setOtp] = useState("");

	const [otpStatus, setOtpStatus] = useState<string | null>(null);
	const [otpError, setOtpError] = useState<string | null>(null);
	const [resendAvailableAt, setResendAvailableAt] = useState<number | null>(null);
	const [remainingSeconds, setRemainingSeconds] = useState(0);

	useEffect(() => {
		const storedResendAvailableAt = getSessionStorage<number>(SESSION_STORAGE_KEYS.MFA_RESET_EMAIL_OTP_RESEND_AT);
		if (!storedResendAvailableAt || storedResendAvailableAt <= Date.now()) {
			clearSessionStorage(SESSION_STORAGE_KEYS.MFA_RESET_EMAIL_OTP_RESEND_AT);
			setResendAvailableAt(null);
			setRemainingSeconds(0);
			return;
		}

		setResendAvailableAt(storedResendAvailableAt);
		setRemainingSeconds(Math.ceil((storedResendAvailableAt - Date.now()) / 1000));
	}, []);

	useEffect(() => {
		if (!open) {
			setOtp("");
			setOtpStatus(null);
			setOtpError(null);
		}
	}, [open]);

	useEffect(() => {
		if (!resendAvailableAt) {
			setRemainingSeconds(0);
			return;
		}

		const syncCountdown = () => {
			const secondsLeft = Math.max(0, Math.ceil((resendAvailableAt - Date.now()) / 1000));
			setRemainingSeconds(secondsLeft);

			if (secondsLeft === 0) {
				clearSessionStorage(SESSION_STORAGE_KEYS.MFA_RESET_EMAIL_OTP_RESEND_AT);
				setResendAvailableAt(null);
			}
		};

		syncCountdown();
		const interval = setInterval(syncCountdown, 1000);

		return () => clearInterval(interval);
	}, [resendAvailableAt]);

	const handleSendCode = async () => {
		try {
			await initiateResetEmailOtpMutation.mutateAsync();
			const nextResendAvailableAt = Date.now() + RESEND_COOLDOWN_MS;

			setSessionStorage(SESSION_STORAGE_KEYS.MFA_RESET_EMAIL_OTP_RESEND_AT, nextResendAvailableAt);

			setResendAvailableAt(nextResendAvailableAt);
			setRemainingSeconds(Math.ceil(RESEND_COOLDOWN_MS / 1000));
			setOtpStatus("A verification code was sent to your registered email.");
			setOtpError(null);
		} catch {
			setOtpStatus(null);
			setOtpError("We couldn't send the verification code right now. Please try again.");
		}
	};

	const handleVerify = async () => {
		try {
			await verifyResetIdentityMutation.mutateAsync({ method: "email_otp", code: otp });

			setCookies({ [COOKIES.MFA_AUTH_CONTEXT]: MFA_AUTH_CONTEXT_VALUES.RESET_SETUP }, 1 / 24);
			router.push(routes.auth.mfaSetup);
			onOpenChange(false);
		} catch {
			setOtpStatus(null);
			setOtpError("Invalid OTP. Please try again.");
			return;
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader className="space-y-3 text-left">
					<DialogTitle className="text-foreground text-xl">Verify your email to reset MFA</DialogTitle>
					<DialogDescription className="text-foreground/80 text-sm leading-6">
						We&apos;ll send a one-time password to your registered email address. Enter it below to confirm this is
						really you.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<div className="flex items-center justify-between gap-3 rounded-lg border p-3">
						<p className="text-foreground/80 text-sm">Need a verification code?</p>
						<Button
							type="button"
							variant="outline"
							onClick={() => void handleSendCode()}
							disabled={
								initiateResetEmailOtpMutation.isPending || verifyResetIdentityMutation.isPending || remainingSeconds > 0
							}
						>
							{initiateResetEmailOtpMutation.isPending ? (
								<Loader2Icon className="h-4 w-4 animate-spin" />
							) : remainingSeconds > 0 ? (
								`Resend in ${remainingSeconds}s`
							) : otpStatus ? (
								"Resend code"
							) : (
								"Send code"
							)}
						</Button>
					</div>

					<Field data-invalid={!!otpError} className="flex flex-col gap-3">
						<FieldLabel className="text-sm font-medium">Enter OTP</FieldLabel>
						<InputOTP
							id="mfa-reset-email-otp"
							maxLength={OTP_LENGTH}
							pattern={REGEXP_ONLY_DIGITS}
							value={otp}
							onChange={(value) => {
								setOtp(value);
								if (otpError) {
									setOtpError(null);
								}
							}}
							data-testid="mfa-reset-email-otp"
							className="flex w-full justify-center"
							containerClassName="flex w-full justify-center"
						>
							<InputOTPGroup className="justify-center gap-2">
								{Array.from({ length: OTP_LENGTH }).map((_, index) => (
									<InputOTPSlot
										key={`mfa-reset-email-otp-slot-${index}`}
										index={index}
										className="border-border/50 bg-muted/70 size-10 rounded-md border text-base shadow-none data-[state=active]:ring-2 data-[state=active]:ring-black/80 sm:size-12 sm:text-lg"
									/>
								))}
							</InputOTPGroup>
						</InputOTP>
						{otpError ? <FieldError className="text-center">{otpError}</FieldError> : null}
					</Field>

					{otpStatus ? (
						<p className="text-success text-center text-sm" role={ARIA_ROLE.STATUS}>
							{otpStatus}
						</p>
					) : null}
				</div>

				<DialogFooter className="mt-2 flex-col gap-3 sm:flex-row sm:justify-end">
					<Button
						type="button"
						variant="outline"
						className="w-full sm:w-auto"
						onClick={() => onOpenChange(false)}
						disabled={initiateResetEmailOtpMutation.isPending || verifyResetIdentityMutation.isPending}
					>
						Cancel
					</Button>
					<Button
						type="button"
						className="w-full sm:w-auto"
						onClick={() => void handleVerify()}
						disabled={
							initiateResetEmailOtpMutation.isPending ||
							verifyResetIdentityMutation.isPending ||
							otp.length !== OTP_LENGTH
						}
					>
						{verifyResetIdentityMutation.isPending ? (
							<Loader2Icon className="h-4 w-4 animate-spin text-white" />
						) : (
							"Verify"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
