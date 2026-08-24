"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { useProfileAPI } from "@/module/profile/hooks/useProfile";
import { useStatusMessage } from "@/hooks/use-status-message";
import { MESSAGE_STATUS } from "@/types";
import { getUserCookies } from "@/lib/utils/cookies";

export default function CompanyDangerZone() {
	const { useForcePasswordChangeForCompany } = useProfileAPI();
	const { statusMessage, setStatusMessage } = useStatusMessage();
	const { companyRef } = getUserCookies();
	const mutation = useForcePasswordChangeForCompany();

	const forcePasswordChangeAll = () => {
		mutation.mutate(companyRef, {
			onSuccess: () => {
				setStatusMessage({
					message: "Password change forced for all users.",
					type: MESSAGE_STATUS.SUCCESS,
				});
			},
			onError: (error) => {
				setStatusMessage({
					message: error.message,
					type: MESSAGE_STATUS.ERROR,
				});
			},
		});
	};

	return (
		<Card className="border-destructive/20 bg-destructive/5 border shadow-none">
			<CardHeader>
				<CardTitle className="text-destructive text-xl font-semibold">Danger Zone</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex items-center justify-between">
					<div className="space-y-0.5">
						<h4 className="text-sm font-medium">Force Password Change</h4>
						<p className="text-muted-foreground max-w-sm text-sm">
							Require all users in the company to change their password upon their next login.
						</p>
					</div>
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button variant="destructive" disabled={mutation.isPending}>
								{mutation.isPending ? "Processing..." : "Force Change"}
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
								<AlertDialogDescription>
									This action will force every user in your company to reset their password. This cannot be undone and
									may cause disruption to your team.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction
									onClick={forcePasswordChangeAll}
									disabled={mutation.isPending}
									className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
								>
									{mutation.isPending ? "Updating..." : "Force Password Change"}
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
				{statusMessage.type === MESSAGE_STATUS.ERROR && <p className="text-error text-sm">{statusMessage.message}</p>}
				{statusMessage.type === MESSAGE_STATUS.SUCCESS && (
					<p className="text-success flex items-center gap-2 text-sm">
						<CheckCircle className="h-4 w-4" /> Password change forced for all users.
					</p>
				)}
			</CardContent>
		</Card>
	);
}
