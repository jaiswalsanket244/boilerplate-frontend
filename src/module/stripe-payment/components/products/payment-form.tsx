"use client";

import { routes } from "@/config/routes";
import { useStripePaymentApi } from "@/module/stripe-payment/hooks/useStripePaymentApi";
import type { ICheckoutFormProps } from "@/module/stripe-payment/types";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY as string);

export default function PaymentForm({ productId }: ICheckoutFormProps) {
	const router = useRouter();
	const { useCheckoutSessionMutation } = useStripePaymentApi();

	const [clientSecret, setClientSecret] = useState<string | null>(null);

	const checkoutMutation = useCheckoutSessionMutation();
	const sessionIdRef = useRef<string>("");

	useEffect(() => {
		checkoutMutation.mutate(productId, {
			onSuccess: (data) => {
				setClientSecret(data.clientSecret);
				sessionIdRef.current = data.sessionId;
			},
		});
	}, []);

	const options = {
		fetchClientSecret: () =>
			clientSecret ? Promise.resolve(clientSecret) : Promise.reject("No client secret available"),
	};

	if (checkoutMutation.isError) {
		return (
			<div>Error: {checkoutMutation.error instanceof Error ? checkoutMutation.error.message : "An error occurred"}</div>
		);
	}

	if (!clientSecret || checkoutMutation.isPending) {
		return (
			<div className="flex h-[80vh] items-center justify-center gap-2">
				<Loader className="text-primary animate-spin" /> <span>Loading...</span>
			</div>
		);
	}

	const handleComplete = () => {
		router.push(routes.stripePayment.paymentStatus(sessionIdRef.current));
	};

	return (
		<div id="checkout">
			<EmbeddedCheckoutProvider stripe={stripePromise} options={{ ...options, onComplete: handleComplete }}>
				<EmbeddedCheckout />
			</EmbeddedCheckoutProvider>
		</div>
	);
}
