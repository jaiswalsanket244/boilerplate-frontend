import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { IDeleteProductAlertProps } from "@/module/product/types";
import { Trash2 } from "lucide-react";
import { useState } from "react";

export function DeleteProductAlert({ onDeleteProduct, productId }: IDeleteProductAlertProps) {
	const [open, setOpen] = useState(false);
	const [isPending, setIsPending] = useState(false);

	const handleDeleteProduct = async () => {
		try {
			setIsPending(true);
			await onDeleteProduct();
		} catch (error) {
		} finally {
			setOpen(false);
			setIsPending(false);
		}
	};

	return (
		<TooltipProvider>
			<AlertDialog open={open} onOpenChange={setOpen}>
				<Tooltip>
					<TooltipTrigger asChild>
						<AlertDialogTrigger asChild>
							<Button variant="ghost" className="border-none p-2" data-testid={`delete-button-${productId}`}>
								<Trash2 className="size-5" />
							</Button>
						</AlertDialogTrigger>
					</TooltipTrigger>
					<TooltipContent data-testid="tooltip-content">
						<p>Delete product</p>
					</TooltipContent>
				</Tooltip>
				<AlertDialogContent>
					<AlertDialogHeader className="relative">
						<AlertDialogTitle>Delete Product</AlertDialogTitle>

						<AlertDialogDescription>Are you sure you want to delete this product?</AlertDialogDescription>
					</AlertDialogHeader>

					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<Button
							data-testid={`delete-confirm-${productId}`}
							disabled={isPending}
							onClick={() => void handleDeleteProduct()}
						>
							Confirm
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</TooltipProvider>
	);
}
