"use client";
import CreatePromotionCodeDialog from "@/module/stripe-payment/components/promotion-codes/create-promotion-code-dialog";
import { PromotionCodeTable } from "@/module/stripe-payment/components/promotion-codes/promotion-codes-table";
import { Button } from "@/components/ui/button";
import { usePromotionCodes } from "@/module/stripe-payment/hooks/usePromotionCodes";

const PromotionCodeList = ({ couponId }: { couponId: string }) => {
	const { goNext, goPrev, disableNext, disablePrev, promotionCodes } = usePromotionCodes(couponId);

	return (
		<div className="w-full">
			<div className="my-3 flex items-center justify-between">
				<h1 className="text-lg">Stripe Promotion Codes</h1>
				<CreatePromotionCodeDialog couponId={couponId} />
			</div>

			<PromotionCodeTable data={promotionCodes ?? []} />

			<div className="mt-8 flex justify-end gap-4">
				<Button onClick={() => goPrev()} disabled={disablePrev}>
					Previous
				</Button>
				<Button onClick={() => goNext()} disabled={disableNext}>
					Next
				</Button>
			</div>
		</div>
	);
};

export default PromotionCodeList;
