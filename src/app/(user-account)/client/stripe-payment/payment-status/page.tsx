import PaymentStatus from "@/module/stripe-payment/templates/payment-status";
import { Suspense } from "react";

export default function PaymentStatusPage() {
	return (
		<Suspense>
			<PaymentStatus />
		</Suspense>
	);
}
