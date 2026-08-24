"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { routes } from "@/config/routes";
import { MFA_AUTH_CONTEXT_VALUES } from "@/lib/constants/paths";
import { clearCookies, setCookies } from "@/lib/utils/cookies";
import { setSessionStorage } from "@/lib/utils/session-storage";
import { useAuthAPI } from "@/module/auth/hooks/useAuth";
import { MFA_FLOW } from "@/module/auth/types";
import { mfaDeviceActivationSchema, type TMfaDeviceActivationFormData } from "@/module/auth/utils/mfa-schemas";
import { useMenuStore } from "@/stores/menu-store";
import { COOKIES, SESSION_STORAGE_KEYS } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { getCookie } from "cookies-next";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

interface IMfaVerificationFormProps {
	isSetupFlow?: boolean;
}

export default function MfaVerificationForm({ isSetupFlow = false }: IMfaVerificationFormProps) {
	const router = useRouter();
	const queryClient = useQueryClient();

	const { useVerifyMfaSetupMutation, useMfaVerifyMutation } = useAuthAPI();

	const mfaAuthContext = getCookie(COOKIES.MFA_AUTH_CONTEXT);

	const setupFlow: MFA_FLOW =
		mfaAuthContext === MFA_AUTH_CONTEXT_VALUES.RESET_SETUP_VERIFY ? MFA_FLOW.RESET : MFA_FLOW.SETUP;

	const isResetSetupFlow = isSetupFlow && setupFlow === MFA_FLOW.RESET;

	const verifyMutation = useMfaVerifyMutation();
	const verifySetupMutation = useVerifyMfaSetupMutation();

	const pageDetails = isSetupFlow
		? {
				title: isResetSetupFlow ? "Verify Your New Authenticator" : "Device Activation",
				description: isResetSetupFlow
					? "Enter the first code from your newly configured authenticator app."
					: "Enter the code displayed on your new authenticator app to complete setup.",
				submitLabel: "Continue",
				helperActionLabel: "Back to QR Code",
			}
		: {
				title: "Multi-Factor Verification",
				description: "Enter the code displayed on your device.",
				submitLabel: "Submit",
				helperActionLabel: "Don’t have an access to your app? Use Recovery Code instead.",
			};

	const form = useForm<TMfaDeviceActivationFormData>({
		resolver: zodResolver(mfaDeviceActivationSchema),
		defaultValues: {
			code: "",
		},
	});
	const code = form.watch("code");

	const handleCodeChange = (value: string) => {
		form.setValue("code", value);

		if (form.formState.errors.code) {
			form.clearErrors("code");
		}
	};

	const onSubmit = async (data: TMfaDeviceActivationFormData) => {
		try {
			if (isSetupFlow) {
				const response = await verifySetupMutation.mutateAsync({ code: data.code });

				queryClient.invalidateQueries({
					predicate: (query) => query.queryKey.includes("mfa-setup-data"),
				});

				const nextContext = isResetSetupFlow
					? MFA_AUTH_CONTEXT_VALUES.RESET_RECOVERY_CODES
					: MFA_AUTH_CONTEXT_VALUES.RECOVERY_CODES;

				setSessionStorage(SESSION_STORAGE_KEYS.RECOVERY_CODES, response.recoveryCodes);

				if (isResetSetupFlow) {
					await queryClient.invalidateQueries({ queryKey: ["mfa-status"] });
				}

				setCookies({ [COOKIES.MFA_AUTH_CONTEXT]: nextContext }, 1 / 24);
				router.push(routes.auth.mfaRecoveryCodes);
				return;
			}

			const response = await verifyMutation.mutateAsync({ code: data.code });

			clearCookies([COOKIES.MFA_AUTH_CONTEXT]);
			router.push(useMenuStore.getState().defaultRedirectUrl);
		} catch {
			form.setError("code", { message: "Invalid code" });
		}
	};

	const handleHelperAction = () => {
		if (isSetupFlow) {
			const previousContext = isResetSetupFlow ? MFA_AUTH_CONTEXT_VALUES.RESET_SETUP : MFA_AUTH_CONTEXT_VALUES.SETUP;
			setCookies({ [COOKIES.MFA_AUTH_CONTEXT]: previousContext }, 1 / 24);
			router.push(routes.auth.mfaSetup);
			return;
		}

		setCookies({ [COOKIES.MFA_AUTH_CONTEXT]: MFA_AUTH_CONTEXT_VALUES.RECOVERY }, 1 / 24);

		router.push(routes.auth.mfaRecovery);
	};

	return (
		<div className="flex justify-center p-2">
			<div className="border-border/60 mt-20 w-full max-w-md rounded-xl border p-4">
				<div className="mb-8 space-y-2">
					<h1 className="text-foreground text-2xl font-bold">{pageDetails.title}</h1>
					<p className="text-foreground/80 text-sm">{pageDetails.description}</p>
				</div>

				<form onSubmit={(event) => void form.handleSubmit(onSubmit)(event)} className="space-y-6">
					<div className="flex w-full justify-center space-y-4">
						<Field data-invalid={!!form.formState.errors.code} className="flex w-full items-center justify-center">
							<FieldLabel className="text-foreground flex justify-center text-sm font-medium">
								Enter the code displayed on your device
							</FieldLabel>
							<InputOTP
								id="mfa-code"
								maxLength={6}
								pattern={REGEXP_ONLY_DIGITS}
								value={code}
								onChange={handleCodeChange}
								data-testid="input-otp"
								className="flex w-full justify-center"
								containerClassName="flex w-full justify-center custom-class"
							>
								<InputOTPGroup className="justify-center gap-2">
									{Array.from({ length: 6 }).map((_, index) => (
										<InputOTPSlot
											key={`mfa-code-slot-${index}`}
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
						disabled={verifyMutation.isPending || verifySetupMutation.isPending || code.length !== 6}
					>
						{verifyMutation.isPending || verifySetupMutation.isPending ? (
							<Loader2Icon className="h-4 w-4 animate-spin text-white" />
						) : (
							pageDetails.submitLabel
						)}
					</Button>

					<div className="mt-4 text-center">
						{isSetupFlow ? (
							<>
								<Button
									variant={"plain"}
									type="button"
									onClick={handleHelperAction}
									className="text-foreground hover:text-blue text-sm underline"
								>
									Back to QR code
								</Button>
							</>
						) : (
							<>
								Don&apos;t have an access to your app?{" "}
								<Button
									variant={"plain"}
									type="button"
									onClick={handleHelperAction}
									className="text-foreground hover:text-blue cursor-pointer p-0 text-sm font-semibold underline"
								>
									Use recovery code
								</Button>{" "}
								instead.
							</>
						)}
					</div>
				</form>
			</div>
		</div>
	);
}
