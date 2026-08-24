import CheckoutForm from "@/module/stripe-payment/components/products/payment-form";

type CheckoutFormPageProps = {
	params: Promise<{
		id: string;
	}>;
};

export default async function CheckoutFormPage(props: CheckoutFormPageProps) {
	const params = await props.params;
	return <CheckoutForm productId={params.id} />;
}
