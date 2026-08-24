"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useStripePaymentApi } from "@/module/stripe-payment/hooks/useStripePaymentApi";
import type { IPromotionCode } from "@/module/stripe-payment/types";
import { useQueryClient } from "@tanstack/react-query";
import type { Row } from "@tanstack/react-table";

const UpdateCodeStatusButton = ({ row }: { row: Row<IPromotionCode> }) => {
	const queryClient = useQueryClient();

	const { useUpdatePromotionCodeMutation } = useStripePaymentApi();
	const updatePromotionCodeMutation = useUpdatePromotionCodeMutation();

	const onConfirm = () => {
		updatePromotionCodeMutation.mutate(
			{ id: row.original.id, payload: { active: !row.original.active } },
			{
				onSuccess: () => {
					void queryClient.invalidateQueries({
						predicate: (query) => query.queryKey.includes("stripe-payment-promotion-codes"),
					});
				},
			}
		);
	};

	return (
		<Button variant="ghost" className={cn(row.original.active ? "text-red-600" : "text-green-600")} onClick={onConfirm}>
			{row.original.active ? "Deactivate" : "Activate"}
		</Button>
	);
};

export default UpdateCodeStatusButton;
