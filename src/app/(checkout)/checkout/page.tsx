"use client";

import { routes } from "@/config/routes";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

export default function PaymentPage() {
	const queryClient = useQueryClient();
	const subscriptionClientSecret = queryClient.getQueryData<string>(["stripeSubscriptionClientSecret"]);
	const router = useRouter();
	const stripe = useStripe();
	const elements = useElements();
	const [paymentError, setPaymentError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false); // State to track loading

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!stripe || !elements || loading) {
			return;
		}

		setLoading(true);

		const cardElement = elements.getElement(CardElement);
		if (!cardElement) {
			setPaymentError("Card Element not found!");
			setLoading(false);
			return;
		}

		try {
			const { error, paymentIntent } = await stripe.confirmCardPayment(subscriptionClientSecret as string, {
				payment_method: {
					card: cardElement,
					billing_details: {
						name: "khalid", // Update with actual billing details
						address: {
							city: "test",
							country: "US",
							line1: "test",
							line2: "test",
							postal_code: "24242",
							state: "test",
						},
					},
				},
			});

			if (error) {
				setPaymentError("Payment failed. Please try again.");
			} else if (paymentIntent) {
				router.push(routes.subscriptions);
			}
		} catch {
			setPaymentError("An error occurred during payment. Please try again later.");
		} finally {
			setLoading(false); // Stop loading
		}
	};

	return (
		<div className="mx-auto flex max-w-7xl justify-center">
			<div className="my-20 w-full max-w-xl text-black">
				{/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
				<form onSubmit={handleSubmit}>
					<h1 className="mb-5">Boilerplate Payment</h1>
					<div className="card-element-container">
						<CardElement className="card-element" />
					</div>
					{paymentError && <p className="error-message">{paymentError}</p>}
					<button type="submit" disabled={!stripe || loading} className="pay-button">
						{loading ? "Loading..." : "Pay Now"}
					</button>
					<style jsx>{`
						.card-element-container {
							padding: 10px;
							border: 1px solid #ccc;
							border-radius: 5px;
						}
						.card-element {
							width: 50%;
							padding: 10px;
							font-size: 16px;
							color: #333;
							border: none;
							outline: none;
							border-radius: 5px;
							box-shadow: none;
						}
						.pay-button {
							margin-top: 20px;
							padding: 10px 20px;
							background-color: #000;
							color: #fff;
							border: none;
							border-radius: 5px;
							cursor: pointer;
						}
						.pay-button:disabled {
							opacity: 0.5;
							cursor: not-allowed;
						}
						.error-message {
							color: red;
							font-size: 14px;
							margin-top: 5px;
						}
					`}</style>
				</form>
			</div>
		</div>
	);
}
