"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { CopyIcon, DownloadIcon, Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MFA_AUTH_CONTEXT_VALUES } from "@/lib/constants/paths";
import { clearCookies, getCookie, getUserCookies } from "@/lib/utils/cookies";
import { useAuthAPI } from "@/module/auth/hooks/useAuth";
import { MFA_FLOW } from "@/module/auth/types";
import { mfaRecoveryFormConfig } from "@/module/auth/utils/form-field-configs/mfa";
import { type TMfaRecoveryFormData, mfaRecoverySchema } from "@/module/auth/utils/mfa-schemas";
import { useMenuStore } from "@/stores/menu-store";
import { COOKIES } from "@/types";

export default function MfaRecoveryCodesList() {
	const router = useRouter();
	const queryClient = useQueryClient();

	const { useMfaRecoveryCodesQuery } = useAuthAPI();

	const mfaAuthContext = getCookie(COOKIES.MFA_AUTH_CONTEXT);
	const mode = mfaAuthContext === MFA_AUTH_CONTEXT_VALUES.RESET_RECOVERY_CODES ? MFA_FLOW.RESET : MFA_FLOW.SETUP;
	const isResetFlow = mode === MFA_FLOW.RESET;

	const { data: codes = [], isLoading } = useMfaRecoveryCodesQuery();

	const form = useForm<TMfaRecoveryFormData>({
		resolver: zodResolver(mfaRecoverySchema),
		defaultValues: {
			savedCodes: false,
		},
	});

	const onSubmit = async () => {
		clearCookies([COOKIES.MFA_AUTH_CONTEXT]);

		queryClient.invalidateQueries({ predicate: (query) => query.queryKey.includes("mfa-setup-data") });
		queryClient.invalidateQueries({ predicate: (query) => query.queryKey.includes("mfa-recovery-codes") });

		const { userType } = getUserCookies();
		if (!userType) return;
		router.push(useMenuStore.getState().defaultRedirectUrl);
	};

	const handleCopy = async () => {
		if (!codes.length) return;
		await navigator.clipboard.writeText(codes.join("\n"));
	};

	const handleDownload = () => {
		if (!codes.length) return;
		const blob = new Blob([codes.join("\n")], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = isResetFlow ? "new-recovery-codes.txt" : "recovery-codes.txt";
		a.click();
		URL.revokeObjectURL(url);
	};

	return (
		<div className="flex w-full flex-1 items-center justify-center p-2">
			<div className="max-w-xl rounded-md border border-border/60 p-4">
				<div className="mb-6 space-y-2">
					<h1 className="mb-5 text-2xl font-bold text-txt-primary sm:text-3xl">
						{isResetFlow ? "New recovery codes" : "Recovery codes"}
					</h1>
					<p className="text-base text-txt-primary-900">
						The codes below are used to access your account in case you lose access to the MFA authenticator.
					</p>
					<p className="text-base text-txt-primary-900">
						Save these recovery codes as securely as a password. We recommend using a password manager such as
						<span className="font-medium"> 1Password</span>, <span className="font-medium">KeePassXC</span>, or
						<span className="font-medium"> Bitwarden</span>.
					</p>
					<p className="pt-2 text-center text-base font-medium text-destructive">
						{isResetFlow
							? "Your previous recovery codes have been invalidated. Only the new codes below will work."
							: "On losing access to these codes, you will lose access to your account."}
					</p>
				</div>

				<div className="space-y-6 rounded-lg">
					{isLoading ? (
						<div className="grid grid-cols-2 gap-4">
							{Array.from({ length: 10 }).map((_, i) => (
								<div key={i} className="bg-black-100 h-6 animate-pulse rounded" />
							))}
						</div>
					) : (
						<div className="grid grid-cols-2 gap-x-8 gap-y-3 rounded-md bg-gray-50 p-4 font-mono text-base tracking-wider text-txt-primary dark:bg-gray-900">
							{codes.map((code, index) => (
								<div key={`${code}-${index}`} className="text-center">
									{code}
								</div>
							))}
						</div>
					)}

					<div className="mt-4 flex items-center gap-4">
						<Button
							variant="outline"
							className="flex flex-1 items-center justify-center gap-2 text-base"
							onClick={() => void handleCopy()}
							type="button"
							disabled={!codes.length}
						>
							<CopyIcon className="h-4 w-4" /> Copy to clipboard
						</Button>
						<Button
							variant="outline"
							className="flex flex-1 items-center justify-center gap-2 text-base"
							onClick={handleDownload}
							type="button"
							disabled={!codes.length}
						>
							<DownloadIcon className="h-4 w-4" /> Download
						</Button>
					</div>
				</div>

				<form onSubmit={(event) => void form.handleSubmit(onSubmit)(event)} className="mt-8 space-y-6">
					<Controller
						name="savedCodes"
						control={form.control}
						render={({ field }) => (
							<div className="flex items-center space-x-2">
								<Checkbox
									id="savedCodes"
									checked={field.value}
									onCheckedChange={field.onChange}
									className="size-4 rounded-none data-[state=checked]:border-primary data-[state=checked]:bg-primary"
								/>
								<label
									htmlFor="savedCodes"
									className="text-sm leading-none font-medium text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								>
									{mfaRecoveryFormConfig.savedCodes.label}
								</label>
							</div>
						)}
					/>

					{form.formState.errors.savedCodes && (
						<p className="mt-1 text-xs text-destructive">{form.formState.errors.savedCodes.message}</p>
					)}

					<div className="mt-6 flex justify-end">
						<Button
							type="submit"
							size="lg"
							disabled={form.formState.isSubmitting || !codes.length}
							className="text-base text-primary-foreground"
						>
							{form.formState.isSubmitting ? <Loader2Icon className="h-4 w-4 animate-spin" /> : "Finish"}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
