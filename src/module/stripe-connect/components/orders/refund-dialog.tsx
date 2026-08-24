import type { Row } from "@tanstack/react-table";
import React, { useState } from "react";
import type { OrderDetails } from "@/module/stripe-connect/types";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useStripeConnectAPI } from "@/module/stripe-connect/hooks/useStripeConnect";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { MESSAGE_STATUS } from "@/types";

const RefundDialog = ({ row }: { row: Row<OrderDetails> }) => {
	const { usePostRefundMutation } = useStripeConnectAPI();
	const queryClient = useQueryClient();

	const { mutateAsync: refund, isPending } = usePostRefundMutation;

	const [isOpen, setIsOpen] = useState(false);
	const [refundStatus, setRefundStatus] = useState<MESSAGE_STATUS | null>(null);

	const { refunded, isRefundEligible, productName, _id: orderId, amountPaid } = row.original;
	const handleRefund = async (id: string) => {
		try {
			await refund(id);

			setRefundStatus(MESSAGE_STATUS.SUCCESS);
			await queryClient.invalidateQueries({
				predicate: (query) => query.queryKey.includes("stripe-connect-orders"),
			});
			void queryClient.invalidateQueries({
				queryKey: ["past-order-counts"],
			});
		} catch (error) {
			setRefundStatus(MESSAGE_STATUS.FAILED);
		}
	};

	if (refunded) {
		return <div className="text-center text-gray-400">-</div>;
	}

	if (!isRefundEligible) {
		return <div className="text-center text-gray-400">-</div>;
	}

	function handleOpenChange(open: boolean) {
		setIsOpen(open);
		setRefundStatus(null);
	}

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<div className="flex justify-start">
					<Button className="bg-blue-lighter hover:bg-blue-lighter py-1 font-medium text-blue">Refund</Button>
				</div>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="text-primary-900 pt-2 text-2xl font-semibold">
						{refundStatus === MESSAGE_STATUS.SUCCESS
							? "Order Cancelled"
							: refundStatus === MESSAGE_STATUS.FAILED
								? "Refund Failed"
								: `Are you sure you want to cancel your order of ${productName}?`}
					</DialogTitle>

					<DialogDescription
						className={cn("text-primary-500 pt-1 text-base", refundStatus === "failed" && "text-red-600")}
					>
						{refundStatus === MESSAGE_STATUS.SUCCESS
							? `You will receive your refund of $${amountPaid} in your source account within 3-5 business day.`
							: refundStatus === MESSAGE_STATUS.FAILED
								? "Refund failed. Please try again."
								: "You are about to cancel this order. This action cannot be undone."}
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className="flex-col gap-2 pt-6 sm:flex-row">
					{refundStatus === "success" ? (
						<Button type="button" onClick={() => setIsOpen(false)}>
							Ok
						</Button>
					) : (
						<>
							<Button
								type="button"
								variant="outline"
								onClick={() => handleOpenChange(false)}
								className="order-2 w-full sm:order-1 sm:w-auto"
							>
								Exit
							</Button>
							<Button
								type="button"
								onClick={() => void handleRefund(orderId)}
								className="order-1 w-full sm:order-2 sm:w-auto"
								disabled={isPending}
							>
								{isPending ? "Refunding..." : refundStatus === MESSAGE_STATUS.FAILED ? "Try Again" : "Yes, Cancel"}
							</Button>
						</>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default RefundDialog;
