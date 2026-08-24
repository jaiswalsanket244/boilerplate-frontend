"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { MFA_AUTH_CONTEXT_VALUES } from "@/lib/constants/paths";
import { clearCookies, setCookies } from "@/lib/utils/cookies";
import { getCookie } from "@/lib/utils/cookies";
import { useAuthAPI } from "@/module/auth/hooks/useAuth";
import { useMenuStore } from "@/stores/menu-store";
import { COOKIES } from "@/types";

export default function MfaSetupForm() {
	const router = useRouter();
	const { useMfaSetupQuery, useSkipMfaSetupMutation } = useAuthAPI();

	const mfaAuthContext = getCookie(COOKIES.MFA_AUTH_CONTEXT);
	const isResetFlow = mfaAuthContext === MFA_AUTH_CONTEXT_VALUES.RESET_SETUP;

	const { data: setupData, isPending, isError } = useMfaSetupQuery();
	const skipMfaSetupMutation = useSkipMfaSetupMutation();

	const pageTitle = isResetFlow ? "Reconfigure Multi-factor Authentication" : "Setup Multi-factor Authentication";

	const nextContext = isResetFlow ? MFA_AUTH_CONTEXT_VALUES.RESET_SETUP_VERIFY : MFA_AUTH_CONTEXT_VALUES.SETUP_VERIFY;

	if (isPending) {
		return <div className="flex h-screen items-center justify-center">Loading MFA Setup...</div>;
	}

	if (isError || !setupData?.qrCode || !setupData?.secret) {
		return <div className="flex h-screen items-center justify-center">Failed to load MFA Setup.</div>;
	}

	const handleSkip = () => {
		skipMfaSetupMutation.mutate(undefined, {
			onSuccess: () => {
				clearCookies([COOKIES.MFA_AUTH_CONTEXT]);
				router.push(useMenuStore.getState().defaultRedirectUrl);
			},
		});
	};

	return (
		<div className="flex h-full flex-1 items-center p-2">
			<div className="mx-auto my-auto max-w-lg rounded-lg border border-border/60 p-4">
				<div className="mb-6 space-y-2">
					<h1 className="text-2xl font-bold text-foreground">{pageTitle}</h1>
					<p className="text-sm font-normal text-foreground/80">
						Use your authenticator app like 1Password, Google Authenticator or Microsoft Authenticator to generate
						one-time passwords that are used as a second factor as you sign in.
					</p>
					{isResetFlow ? (
						<p className="text-sm text-foreground/70">
							Your old authenticator configuration and previous recovery codes will stop working after you verify this
							new device.
						</p>
					) : null}
				</div>

				<div className="flex flex-col items-center space-y-6 rounded-lg px-6">
					<div className="w-full text-center">
						<p className="mb-4 text-sm font-medium text-foreground">
							Scan the QR code below with your Authenticator app
						</p>
						<div className="inline-block rounded-md bg-white p-4">
							<div className="flex size-44 items-center justify-center overflow-hidden border sm:size-50">
								<Image
									src={setupData.qrCode}
									alt="QR Code"
									className="size-full"
									unoptimized
									width={200}
									height={200}
									style={{ objectFit: "contain" }}
								/>
							</div>
						</div>
					</div>

					<div className="w-full text-center">
						<p className="mb-2 text-sm font-medium text-foreground">Or Enter this code into your authenticator app</p>
						<div className="rounded bg-gray-50 px-4 py-2 text-sm tracking-widest break-all text-foreground/90 dark:bg-gray-800">
							{setupData.secret}
						</div>
					</div>
				</div>

				<div className="mt-8 flex items-center justify-center gap-4">
					{!isResetFlow && (
						<Button onClick={() => handleSkip()} className="w-full">
							Skip
						</Button>
					)}
					<Button
						onClick={() => {
							setCookies({ [COOKIES.MFA_AUTH_CONTEXT]: nextContext }, 1 / 24);
							router.push(routes.auth.mfaSetupVerify);
						}}
						className="w-full"
					>
						Next
					</Button>
				</div>
			</div>
		</div>
	);
}
