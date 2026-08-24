"use client";
import { useStripePaymentApi } from "@/module/stripe-payment/hooks/useStripePaymentApi";
import CreateCoupon from "@/module/stripe-payment/components/coupons/create-coupon";

const EditCoupon = ({ couponId }: { couponId: string }) => {
	const { useCouponQuery } = useStripePaymentApi();

	const { data, isPending } = useCouponQuery(couponId);

	if (isPending || !data) {
		return <div className="flex h-[80vh] items-center justify-center text-lg">Loading...</div>;
	}

	return <CreateCoupon isEditMode coupon={data} />;
};

export default EditCoupon;
