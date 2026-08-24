import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { MFA_AUTH_CONTEXT_VALUES } from "@/lib/constants/paths";
import { setCookies } from "@/lib/utils/cookies";
import { COOKIES } from "@/types";
import { useRouter } from "next/navigation";
import { useProfileAPI } from "@/module/profile/hooks/useProfile";
import { Switch } from "@/components/ui/switch";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useAuthAPI } from "@/module/auth/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";

const MfaToggleSwitch = () => {
	const { useGetUserData } = useProfileAPI();

	const { data: user, isPending } = useGetUserData();

	const mfaStatus = user?.mfa;

	const [open, setOpen] = useState(false);
	const [isDisableOpen, setIsDisableOpen] = useState(false);

	return (
		<div className="border-border/60 flex items-center justify-between rounded-xl border p-4">
			<div className="space-y-1">
				<h3 className="text-base font-semibold">Multi-factor authentication</h3>
				<p className="text-muted-foreground text-sm">
					{isPending
						? "Checking your MFA status..."
						: mfaStatus?.enabled
							? "MFA is enabled on this account."
							: "MFA is not enrolled on this account yet."}
				</p>
			</div>

			<Switch
				checked={mfaStatus?.enabled}
				onCheckedChange={(checked) => {
					if (checked) {
						setOpen(true);
					} else {
						setIsDisableOpen(true);
					}
				}}
			/>

			<ConfigureMfaAlert open={open} setOpen={setOpen} />
			<DisableMfaAlert open={isDisableOpen} setOpen={setIsDisableOpen} />
		</div>
	);
};

export default MfaToggleSwitch;

const DisableMfaAlert = ({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) => {
	const queryClient = useQueryClient();

	const { useDisableMfaMutation } = useAuthAPI();
	const disableMfaMutation = useDisableMfaMutation();

	const handleDisableMfa = async () => {
		try {
			await disableMfaMutation.mutateAsync();
			queryClient.invalidateQueries({
				queryKey: ["userData"],
			});
			setOpen(false);
		} catch (error) {
			console.error("Error disabling MFA:", error);
		}
	};

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogContent>
				<AlertDialogHeader className="text-xl">Disable MFA</AlertDialogHeader>
				<AlertDialogDescription>Are you sure you want to disable MFA?</AlertDialogDescription>

				<div className="flex justify-end gap-5">
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={handleDisableMfa}>Disable</AlertDialogAction>
				</div>
			</AlertDialogContent>
		</AlertDialog>
	);
};

const ConfigureMfaAlert = ({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) => {
	const router = useRouter();

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogContent>
				<AlertDialogHeader className="text-xl">Setup MFA</AlertDialogHeader>
				<AlertDialogDescription>You have to register your authenticator app to enable MFA</AlertDialogDescription>

				<div className="flex justify-end gap-5">
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={() => {
							setCookies({ [COOKIES.MFA_AUTH_CONTEXT]: MFA_AUTH_CONTEXT_VALUES.RESET_IDENTITY_VERIFY }, 1 / 24);
							router.push(routes.auth.mfaIdentityVerify);
						}}
					>
						Setup Now
					</AlertDialogAction>
				</div>
			</AlertDialogContent>
		</AlertDialog>
	);
};
