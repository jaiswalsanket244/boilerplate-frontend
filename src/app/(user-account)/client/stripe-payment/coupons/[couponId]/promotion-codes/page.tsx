import PromotionCodeList from "@/module/stripe-payment/templates/promotion-code-list";

type PageProps = {
	params: Promise<{
		couponId: string;
	}>;
};

export default async function PromotionCodePage(props: PageProps) {
	const params = await props.params;
	return <PromotionCodeList couponId={params.couponId} />;
}
