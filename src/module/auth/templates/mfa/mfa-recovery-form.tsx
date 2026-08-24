"use client";

import { FormInputWrapper } from "@/components/common/form/form-input-wrapper";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { MFA_AUTH_CONTEXT_VALUES } from "@/lib/constants/paths";
import { clearCookies, getUserCookies, setCookies } from "@/lib/utils/cookies";
import MfaRecoverySuccessDialog from "@/module/auth/components/mfa-recovery-success-dialog";
import MfaResetEmailOtpDialog from "@/module/auth/components/mfa-reset-email-otp-dialog";
import { useAuthAPI } from "@/module/auth/hooks/useAuth";
import { mfaRecoveryCodeFormConfig } from "@/module/auth/utils/form-field-configs/mfa";
import { mfaRecoveryCodeSchema, type TMfaRecoveryCodeFormData } from "@/module/auth/utils/mfa-schemas";
import { useMenuStore } from "@/stores/menu-store";
import { COOKIES } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function MfaRecoveryForm() {
	const router = useRouter();

	const { useMfaRecoveryVerifyMutation, useUpdateRecoveryReconfigureSessionMutation } = useAuthAPI();

	const recoveryVerifyMutation = useMfaRecoveryVerifyMutation();
	const updateSession = useUpdateRecoveryReconfigureSessionMutation();

	const [isRecoverySuccessDialogOpen, setIsRecoverySuccessDialogOpen] = useState(false);
	const [isResetEmailOtpDialogOpen, setIsResetEmailOtpDialogOpen] = useState(false);

	const form = useForm<TMfaRecoveryCodeFormData>({
		resolver: zodResolver(mfaRecoveryCodeSchema),
		defaultValues: {
			recoveryCode: "",
		},
	});

	const onSubmit = async (data: TMfaRecoveryCodeFormData) => {
		try {
			await recoveryVerifyMutation.mutateAsync({
				recoveryCode: data.recoveryCode.trim(),
			});

			setIsRecoverySuccessDialogOpen(true);
		} catch {
			form.setError("recoveryCode", { message: "Invalid recovery code. Please try again." });
		}
	};

	const handleSkip = () => {
		const { userType } = getUserCookies();
		if (!userType) {
			return;
		}

		clearCookies([COOKIES.MFA_AUTH_CONTEXT]);
		router.push(useMenuStore.getState().defaultRedirectUrl);
	};

	const handleReregisterMfa = async () => {
		await updateSession.mutateAsync();

		setCookies({ [COOKIES.MFA_AUTH_CONTEXT]: MFA_AUTH_CONTEXT_VALUES.RESET_SETUP }, 1 / 24);
		router.push(routes.auth.mfaSetup);
	};

	const handleOpenResetEmailOtpDialog = () => {
		setIsResetEmailOtpDialogOpen(true);
	};

	return (
		<div className="mt-20 flex justify-center p-2 md:p-4">
			<div className="border-border/60 w-full max-w-lg rounded-xl border p-4 py-8">
				<div className="mb-8 flex flex-col items-center space-y-2">
					<h1 className="text-foreground text-center text-[24px] font-bold">Enter Recovery Code</h1>
					<p className="text-foreground/80 max-w-sm text-center text-sm font-normal">
						Enter any of the recovery codes that we shared with you during the time of Sign Up.
					</p>
				</div>

				<form onSubmit={(event) => void form.handleSubmit(onSubmit)(event)} className="space-y-6">
					<FormInputWrapper
						form={form}
						fieldConfig={mfaRecoveryCodeFormConfig.recoveryCode}
						className={`${form.formState.errors.recoveryCode ? "input-field-error" : "input-field"} h-12`}
					/>

					<Button
						className="w-full"
						type="submit"
						size="lg"
						disabled={!form.formState.isValid || recoveryVerifyMutation.isPending}
					>
						{recoveryVerifyMutation.isPending ? (
							<Loader2Icon className="h-4 w-4 animate-spin text-white" />
						) : (
							"Continue"
						)}
					</Button>
					<div className="text-txt-primary flex flex-col items-center justify-center gap-3 text-sm">
						<div className="max-w-sm text-center">
							Don&apos;t have an access to the Recovery Code? Use{" "}
							<Button
								variant={"plain"}
								type="button"
								onClick={() => {
									setCookies({ [COOKIES.MFA_AUTH_CONTEXT]: MFA_AUTH_CONTEXT_VALUES.VERIFICATION }, 1 / 24);
									router.push(routes.auth.mfaVerify);
								}}
								className="text-foreground hover:text-blue p-0 text-sm font-semibold underline"
							>
								Authenticator App
							</Button>{" "}
							instead.
						</div>

						<div>or</div>

						<div className="text-center">
							Lost access to your Recovery Code?{" "}
							<Button
								variant={"plain"}
								type="button"
								onClick={handleOpenResetEmailOtpDialog}
								className="text-foreground hover:text-blue p-0 text-sm font-semibold underline"
							>
								Reset MFA
							</Button>{" "}
							instead.
						</div>
					</div>
				</form>

				<MfaResetEmailOtpDialog open={isResetEmailOtpDialogOpen} onOpenChange={setIsResetEmailOtpDialogOpen} />

				<MfaRecoverySuccessDialog
					open={isRecoverySuccessDialogOpen}
					onSkip={handleSkip}
					onSetupAuthenticator={() => void handleReregisterMfa()}
				/>
			</div>
		</div>
	);
}
