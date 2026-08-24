import { type CancelSubscriptionAlertProps } from "@/module/subscription/types";
import { Button } from "@/components/ui/button";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function CancelSubscriptionAlert({ onCancelSubscription }: CancelSubscriptionAlertProps) {
	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant="default">Cancel Subscription</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>Cancel Subscription</AlertDialogHeader>

				<AlertDialogDescription>Are you sure you want to cancel your subscription?</AlertDialogDescription>

				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={onCancelSubscription}>Confirm</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
