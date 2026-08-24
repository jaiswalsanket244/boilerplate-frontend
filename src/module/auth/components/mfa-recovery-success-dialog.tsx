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
import { ShieldAlertIcon } from "lucide-react";
import type { IMfaRecoverySuccessDialogProps } from "@/module/auth/types";

export default function MfaRecoverySuccessDialog({
	open,
	onSkip,
	onSetupAuthenticator,
}: IMfaRecoverySuccessDialogProps) {
	return (
		<Dialog open={open}>
			<DialogContent
				className="sm:max-w-md [&>button[data-testid='dialog-close-button']]:hidden"
				onEscapeKeyDown={(event) => event.preventDefault()}
				onInteractOutside={(event) => event.preventDefault()}
			>
				<DialogHeader className="space-y-3 text-left">
					<DialogTitle className="text-foreground text-xl">Set up your authenticator</DialogTitle>
					<DialogDescription className="text-foreground/80 flex text-sm leading-6">
						<p className="flex-1">
							You&apos;ve signed in using a recovery code. To restore full account security, set up your authenticator
							app again
						</p>

						<div className="shrink-0">
							<ShieldAlertIcon size={50} />
						</div>
					</DialogDescription>
				</DialogHeader>

				<DialogFooter className="mt-2 flex-col gap-3 sm:flex-row sm:justify-end">
					<Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onSkip}>
						Skip for now
					</Button>
					<Button type="button" className="w-full sm:w-auto" onClick={onSetupAuthenticator}>
						Setup Authenticator
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
