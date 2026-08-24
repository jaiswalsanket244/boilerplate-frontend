"use client";

import React, { useState, type FormEvent } from "react";
import {
	useStripe,
	useElements,
	CardNumberElement,
	CardExpiryElement,
	CardCvcElement,
	Elements,
} from "@stripe/react-stripe-js";
import { X } from "lucide-react";
import { GenericAlert } from "@/components/common/alert/alert";
import { loadStripe } from "@stripe/stripe-js";
import { useCardsAPI } from "@/module/cards/hooks/useCards";
import { elementOptions } from "@/module/cards/utils/stripe-elements-styles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY || "");

function AddCardForm() {
	const stripe = useStripe();
	const elements = useElements();

	const { usePostCardMutation } = useCardsAPI();
	const postCardMutation = usePostCardMutation();

	const [cardholderName, setCardholderName] = useState("");
	const [paymentError, setPaymentError] = useState<string | null>(null);
	const [successAlert, setSuccessAlert] = useState({
		isOpen: false,
		message: "",
	});

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault();
		setPaymentError(null);

		if (!stripe || !elements) {
			setPaymentError("Stripe has not loaded properly.");
			return;
		}

		const cardElement = elements.getElement(CardNumberElement);
		const expiryElement = elements.getElement(CardExpiryElement);
		const cvcElement = elements.getElement(CardCvcElement);
		if (!cardElement) {
			setPaymentError("Card element not found.");
			return;
		}

		try {
			const data = await postCardMutation.mutateAsync();
			const { setupIntent, error } = await stripe.confirmCardSetup(data.data.data.client_secret, {
				payment_method: {
					card: cardElement,
					billing_details: { name: cardholderName || "Customer" },
				},
			});

			if (error) {
				setPaymentError(error.message ?? "Card setup failed. Please try again.");
				return;
			}

			if (setupIntent?.status === "succeeded") {
				setSuccessAlert({
					isOpen: true,
					message: "Card has been added successfully!",
				});
				cardElement.clear();
				expiryElement?.clear();
				cvcElement?.clear();
				clearCardholderName();
			} else {
				setPaymentError(`Unhandled setup status: ${setupIntent?.status}`);
			}
		} catch (err) {
			setPaymentError("An unexpected error occurred. Please try again.");
		}
	};

	const clearCardholderName = () => setCardholderName("");

	const handleSuccessAlertClose = () => {
		setSuccessAlert({ isOpen: false, message: "" });
	};

	return (
		<>
			<Card className="w-full max-w-lg">
				<CardHeader>
					<CardTitle>Add New Card</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={(e) => void handleSubmit(e)}>
						{/* Cardholder Name */}
						<div className="mb-4">
							<Label htmlFor="cardholderName">Cardholder&apos;s Name</Label>
							<div className="relative">
								<Input
									id="cardholderName"
									type="text"
									value={cardholderName}
									onChange={(e) => setCardholderName(e.target.value)}
									placeholder="John Doe"
									className="w-full rounded-md border border-gray-300 px-3 py-4 pr-8 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
									required
								/>
								{cardholderName && (
									<Button
										variant="ghost"
										size="sm"
										className="absolute top-0 right-0 h-full px-2"
										onClick={clearCardholderName}
									>
										<X size={16} />
									</Button>
								)}
							</div>
						</div>

						{/* Card Details */}
						<div className="mb-4">
							<Label>Card Number</Label>{" "}
							<div className="rounded-md border border-gray-300 p-3 focus-within:border-transparent focus-within:ring-2 focus-within:ring-blue-500">
								<CardNumberElement options={elementOptions} />
							</div>
						</div>

						<div className="mb-4 grid grid-cols-2 gap-4">
							<div>
								<Label>Expiration Date</Label>
								<div className="rounded-md border border-gray-300 p-3 focus-within:border-transparent focus-within:ring-2 focus-within:ring-blue-500">
									<CardExpiryElement options={elementOptions} />
								</div>
							</div>
							<div>
								<Label>CVV</Label>
								<div className="rounded-md border border-gray-300 p-3 focus-within:border-transparent focus-within:ring-2 focus-within:ring-blue-500">
									<CardCvcElement options={elementOptions} />
								</div>
							</div>
						</div>

						{/* Error Message */}
						{paymentError && (
							<div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
								<p className="text-sm text-red-600">{paymentError}</p>
							</div>
						)}

						{/* Buttons */}
						<div className="flex justify-end gap-3">
							<Button type="submit" disabled={!stripe || postCardMutation.isPending}>
								{postCardMutation.isPending ? "Adding..." : "Add Card"}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>

			{/* Success Alert */}
			<GenericAlert
				title="Card Added!"
				description={successAlert.message}
				buttonText="Continue"
				isOpen={successAlert.isOpen}
				onClose={handleSuccessAlertClose}
				onConfirm={handleSuccessAlertClose}
			/>
		</>
	);
}

export default function AddCard() {
	return (
		<Elements stripe={stripePromise}>
			<AddCardForm />
		</Elements>
	);
}
