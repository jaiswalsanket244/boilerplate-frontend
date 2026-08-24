import { CURRENCY, DURATION, type ICoupon, type TCreateCouponInput } from "@/module/stripe-payment/types";

export function getCouponDefaultValues(coupon: ICoupon | undefined): TCreateCouponInput {
	return {
		currency: CURRENCY.USD,
		name: coupon?.name ?? "",
		duration: coupon?.duration ?? DURATION.FOREVER,
		duration_in_months: coupon?.duration_in_months ?? undefined,
		amount_off: coupon?.amount_off ?? undefined,
		percent_off: coupon?.percent_off ?? undefined,
		max_redemptions: coupon?.max_redemptions ?? undefined,
		redeem_by: coupon?.redeem_by ?? undefined,
	};
}
