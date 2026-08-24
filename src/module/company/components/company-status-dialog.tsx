import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CompanyStatusBadge } from "@/module/company/components/company-status-badge";
import { STATUS } from "@/types";
import type { ICompanyStatusDialogProps } from "@/module/company/types";

export function CompanyStatusDialog({ isOpen, currentStatus, onClose, onConfirm }: ICompanyStatusDialogProps) {
	const newStatus = currentStatus === STATUS.ACTIVE ? STATUS.INACTIVE : STATUS.ACTIVE;

	return (
		<AlertDialog open={isOpen} onOpenChange={onClose}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Change Company Status</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure you want to change the company status to
						<CompanyStatusBadge status={newStatus} />?
					</AlertDialogDescription>
				</AlertDialogHeader>

				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={onConfirm}>Confirm</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
