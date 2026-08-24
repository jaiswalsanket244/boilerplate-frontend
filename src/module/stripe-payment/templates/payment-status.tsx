"use client";

import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { useStripePaymentApi } from "@/module/stripe-payment/hooks/useStripePaymentApi";
import { SESSION_STATUS } from "@/module/stripe-payment/types";
import { useRouter, useSearchParams } from "next/navigation";

export default function PaymentStatus() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { useSessionStatusQuery } = useStripePaymentApi();

	const sessionId = searchParams.get("session_id");

	const { data: sessionStatus, isPending } = useSessionStatusQuery(sessionId);

	if (isPending) {
		return <div className="flex h-screen items-center justify-center text-lg">Loading...</div>;
	}

	if (sessionStatus?.status === SESSION_STATUS.COMPLETE) {
		return (
			<section id="success" className="flex h-screen flex-col items-center">
				<h2 className="mb-5">Payment Successful !! 🎉</h2>
				<div className="flex gap-3">
					<Button className="w-1/2" onClick={() => router.push(routes.stripePayment.productList)}>
						Products List
					</Button>
					<Button className="w-1/2" onClick={() => router.push(routes.stripePayment.orders)}>
						Orders
					</Button>
				</div>
			</section>
		);
	}

	return null;
}
