import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useStatusMessage } from "@/hooks/use-status-message";
import { cn } from "@/lib/utils";
import { useStripePaymentApi } from "@/module/stripe-payment/hooks/useStripePaymentApi";
import type { IDeleteProductConfirmationProps } from "@/module/stripe-payment/types";
import { MESSAGE_STATUS } from "@/types";
import { useQueryClient } from "@tanstack/react-query";

const DeleteProductDialog = ({ product, open, setOpen }: IDeleteProductConfirmationProps) => {
	const queryClient = useQueryClient();
	const { useDeleteProductMutation } = useStripePaymentApi();

	const { mutateAsync: deleteProduct, isPending } = useDeleteProductMutation();

	const { statusMessage, setStatusMessage } = useStatusMessage();

	const handleDelete = async () => {
		try {
			await deleteProduct({ productId: product._id });
			setTimeout(() => {
				void queryClient.invalidateQueries({
					predicate: (query) => query.queryKey.includes("stripe-payment-products"),
				});
			}, 3500);
			setStatusMessage({
				type: MESSAGE_STATUS.SUCCESS,
				message:
					"The product has been deleted successfully and will no longer be available for users to view or purchase.",
			});
		} catch (error) {
			setStatusMessage({
				type: MESSAGE_STATUS.ERROR,
				message: "There was an error deleting the product. Please try again.",
			});
		}
	};

	const getDialogTitle = () => {
		switch (statusMessage.type) {
			case MESSAGE_STATUS.SUCCESS:
				return "Product Deleted Successfully";
			case MESSAGE_STATUS.ERROR:
				return "Error Deleting Product";
			default:
				return "Are you sure?";
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle
						className={cn(
							"pt-2 text-2xl font-semibold text-primary",
							statusMessage.type === MESSAGE_STATUS.ERROR && "text-error",
							statusMessage.type === MESSAGE_STATUS.SUCCESS && "text-success"
						)}
					>
						{getDialogTitle()}
					</DialogTitle>

					<DialogDescription className={cn("text-primary-600 pt-1 text-base")}>
						{statusMessage.type !== null ? (
							statusMessage.message
						) : (
							<>
								You’re about to delete <span className="font-semibold">{product.title}</span>. Once deleted, you cannot
								retrieve it later
							</>
						)}
						.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className="flex-col gap-2 pt-6 sm:flex-row">
					{statusMessage.type === null && (
						<>
							<Button
								type="button"
								variant="outline"
								onClick={() => setOpen(false)}
								className="order-2 w-full sm:order-1 sm:w-auto"
							>
								Cancel
							</Button>
							<Button
								type="button"
								onClick={() => void handleDelete()}
								className="order-1 w-full sm:order-2 sm:w-auto"
								disabled={isPending}
							>
								{isPending ? "Deleting..." : "Delete"}
							</Button>
						</>
					)}

					{statusMessage.type === MESSAGE_STATUS.SUCCESS && (
						<Button
							type="button"
							onClick={() => {
								setOpen(false);
								setStatusMessage({ type: null, message: "" });
							}}
							className="w-full sm:w-auto"
						>
							Close
						</Button>
					)}

					{statusMessage.type === MESSAGE_STATUS.ERROR && (
						<>
							<Button
								type="button"
								variant="outline"
								onClick={() => setStatusMessage({ type: null, message: "" })}
								className="order-2 w-full sm:order-1 sm:w-auto"
							>
								Try Again
							</Button>
							<Button type="button" onClick={() => setOpen(false)} className="order-1 w-full sm:order-2 sm:w-auto">
								Close
							</Button>
						</>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default DeleteProductDialog;
