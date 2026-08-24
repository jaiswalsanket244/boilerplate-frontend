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
} from "@/components/ui/alert-dialog";

const DeleteCouponsAlert = ({
	onConfirm,
	open,
	setOpen,
}: {
	onConfirm: () => void;
	open: boolean;
	setOpen: (open: boolean) => void;
}) => {
	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you sure you want to delete this coupon?</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone. This will permanently delete the coupon and remove it from your active
						promotions.
					</AlertDialogDescription>
				</AlertDialogHeader>

				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={() => {
							onConfirm();
						}}
					>
						Yes, Delete
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default DeleteCouponsAlert;
