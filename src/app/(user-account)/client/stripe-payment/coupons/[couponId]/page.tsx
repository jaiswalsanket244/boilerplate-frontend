import EditCoupon from "@/module/stripe-payment/components/coupons/edit-coupon";

type Props = {
	params: Promise<{
		couponId: string;
	}>;
};

const CouponPage = async (props: Props) => {
	const params = await props.params;
	const { couponId } = params;

	return <EditCoupon couponId={couponId} />;
};

export default CouponPage;
