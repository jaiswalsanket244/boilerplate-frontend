import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useStripeConnectAPI } from "@/module/stripe-connect/hooks/useStripeConnect";
import type { ProductInfo } from "@/module/stripe-connect/types";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

const DeleteProductDialog = ({
	product,
	open,
	setOpen,
}: {
	product: ProductInfo;
	open: boolean;
	setOpen: (open: boolean) => void;
}) => {
	const { useDeleteProductMutation } = useStripeConnectAPI();
	const queryClient = useQueryClient();

	const { mutateAsync: deleteProduct, isPending } = useDeleteProductMutation();

	const [statusMessage, setStatusMessage] = useState<{
		type: "success" | "error" | null;
		message: string;
	}>({ type: null, message: "" });

	const handleDelete = async () => {
		try {
			await deleteProduct({ productId: product._id });
			setTimeout(() => {
				void queryClient.invalidateQueries({
					predicate: (query) => query.queryKey.includes("stripe-connect-products"),
				});
			}, 3500);
			setStatusMessage({
				type: "success",
				message:
					"The product has been deleted successfully and will no longer be available for users to view or purchase.",
			});
		} catch (error) {
			setStatusMessage({ type: "error", message: "There was an error deleting the product. Please try again." });
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle
						className={cn(
							"pt-2 text-2xl font-semibold text-primary",
							statusMessage.type === "error" && "text-error",
							statusMessage.type === "success" && "text-success"
						)}
					>
						{statusMessage.type === "success"
							? "Product Deleted Successfully"
							: statusMessage.type === "error"
								? "Error Deleting Product"
								: "Are you sure?"}
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

					{statusMessage.type === "success" && (
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

					{statusMessage.type === "error" && (
						<>
							<Button
								type="button"
								variant="outline"
								onClick={() => {
									setStatusMessage({ type: null, message: "" });
								}}
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
