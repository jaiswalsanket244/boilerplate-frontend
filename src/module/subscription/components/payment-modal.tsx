import React, { useState, type FormEvent } from "react";
import { CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import type { PaymentModalProps } from "@/module/subscription/types/index";
import { GenericAlert } from "@/components/common/alert/alert";

export default function PaymentModal({ isOpen, onClose, planName, onSuccess }: PaymentModalProps) {
	const queryClient = useQueryClient();
	const subscriptionClientSecret = queryClient.getQueryData<string>(["stripeSubscriptionClientSecret"]);
	const stripe = useStripe();
	const elements = useElements();
	const [paymentError, setPaymentError] = useState<string | null>(null);

	// Add success alert state
	const [successAlert, setSuccessAlert] = useState({
		isOpen: false,
		planName: "",
	});

	const [formData, setFormData] = useState({
		cardholderName: "",
		countryCode: "US",
		postalCode: "",
	});

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const clearCardholderName = () => {
		setFormData((prev) => ({ ...prev, cardholderName: "" }));
	};

	const handleSubmit = async (event: FormEvent<HTMLDivElement>) => {
		event.preventDefault();

		if (!stripe || !elements) {
			setPaymentError("Stripe has not loaded properly. Please try again.");
			return;
		}

		const cardElement = elements.getElement(CardNumberElement);
		if (!cardElement) {
			setPaymentError("Card element not found.");
			return;
		}

		try {
			const { error, paymentIntent } = await stripe.confirmCardPayment(subscriptionClientSecret as string, {
				payment_method: {
					card: cardElement,
					billing_details: {
						name: formData.cardholderName || "Customer",
						address: {
							country: formData.countryCode,
							postal_code: formData.postalCode,
						},
					},
				},
			});

			if (error) {
				setPaymentError(error.message ?? "Payment failed. Please try again.");
				return;
			}

			if (paymentIntent) {
				switch (paymentIntent.status) {
					case "succeeded":
						setSuccessAlert({
							isOpen: true,
							planName: planName,
						});
						break;

					case "requires_payment_method":
						setPaymentError("Payment method was declined. Please try another card.");
						break;

					case "requires_action":
						setPaymentError("Authentication required. Please try again.");
						break;

					default:
						setPaymentError(`Unhandled payment status: ${paymentIntent.status}`);
						break;
				}
			}
		} catch (err) {
			setPaymentError("An unexpected error occurred.");
		}
	};

	const handlePayNow = () => {
		const event = {
			preventDefault: () => {
				/* intentionally empty */
			},
		} as FormEvent<HTMLDivElement>;
		void handleSubmit(event);
	};

	const handleSuccessAlertClose = () => {
		setSuccessAlert({
			isOpen: false,
			planName: "",
		});
		// Call the parent success handler and close modal
		onSuccess?.();
		onClose();
	};

	const elementOptions = {
		style: {
			base: {
				fontSize: "16px",
				color: "#374151",
				fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
				"::placeholder": {
					color: "#9CA3AF",
				},
			},
			invalid: {
				color: "#EF4444",
			},
		},
	};

	if (!isOpen) return null;

	return (
		<>
			<div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
				<div className="w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-2xl">
					<div className="flex items-center justify-between border-b border-gray-100 p-6">
						<h2 className="text-txt-primary text-xl font-semibold">Upgrading to {planName} Plan</h2>
						<button onClick={onClose} className="rounded-full p-1 transition-colors hover:bg-gray-100">
							<X className="text-txt-tertiary h-5 w-5" />
						</button>
					</div>

					<div className="p-6">
						<div className="mb-4">
							<label className="text-txt-primary-800 mb-2 block text-sm font-medium">Card Number</label>
							<div className="border-border rounded-md border p-3 focus-within:border-transparent focus-within:ring-2 focus-within:ring-blue-500">
								<CardNumberElement options={elementOptions} />
							</div>
						</div>

						<div className="mb-4">
							<label className="text-txt-primary-800 mb-2 block text-sm font-medium">Cardholder&apos;s Name</label>
							<div className="relative">
								<input
									type="text"
									name="cardholderName"
									value={formData.cardholderName}
									onChange={handleInputChange}
									placeholder="John Doe"
									className="border-border w-full rounded-md border px-3 py-2 pr-8 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
								/>
								{formData.cardholderName && (
									<button
										type="button"
										onClick={clearCardholderName}
										className="text-txt-tertiary hover:text-txt-secondary-900 absolute top-1/2 right-3 -translate-y-1/2 transform"
									>
										<X size={16} />
									</button>
								)}
							</div>
						</div>

						<div className="mb-4 grid grid-cols-2 gap-4">
							<div>
								<label className="text-txt-primary-800 mb-2 block text-sm font-medium">Expiration Date on Card</label>
								<div className="border-border rounded-md border p-3 focus-within:border-transparent focus-within:ring-2 focus-within:ring-blue-500">
									<CardExpiryElement options={elementOptions} />
								</div>
							</div>
							<div>
								<label className="text-txt-primary-800 mb-2 block text-sm font-medium">CVV</label>
								<div className="border-border rounded-md border p-3 focus-within:border-transparent focus-within:ring-2 focus-within:ring-blue-500">
									<CardCvcElement options={elementOptions} />
								</div>
							</div>
						</div>

						<div className="mb-6 grid grid-cols-2 gap-4">
							<div>
								<label className="text-txt-primary-800 mb-2 block text-sm font-medium">Country Code</label>
								<div className="relative">
									<input
										type="text"
										name="countryCode"
										value={formData.countryCode}
										onChange={handleInputChange}
										placeholder="US"
										maxLength={2}
										className="border-border w-full rounded-md border px-3 py-2 pr-10 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
									/>
									<div className="absolute top-1/2 right-3 flex h-6 w-6 -translate-y-1/2 transform items-center justify-center rounded-full bg-purple-500">
										<span className="text-xs font-bold text-white">A</span>
									</div>
								</div>
							</div>
							<div>
								<label className="text-txt-primary-800 mb-2 block text-sm font-medium">Postal Code</label>
								<input
									type="text"
									name="postalCode"
									value={formData.postalCode}
									onChange={handleInputChange}
									placeholder="12345"
									className="border-border w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
								/>
							</div>
						</div>

						{paymentError && (
							<div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
								<p className="text-sm text-red-600">{paymentError}</p>
							</div>
						)}

						<div className="mb-4 flex justify-end gap-3">
							<button
								type="button"
								onClick={onClose}
								className="text-txt-primary-800 rounded-md bg-gray-100 px-6 py-2 text-sm font-medium transition-colors hover:bg-gray-200"
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={handlePayNow}
								disabled={!stripe}
								className="rounded-md bg-black px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
							>
								Pay Now
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Success Alert */}
			<GenericAlert
				title="Payment Successful!"
				description={`Congratulations! Your payment has been processed successfully and you have been upgraded to the ${successAlert.planName} plan. You can now enjoy all the premium features.`}
				buttonText="Continue"
				isOpen={successAlert.isOpen}
				onClose={handleSuccessAlertClose}
				onConfirm={handleSuccessAlertClose}
			/>
		</>
	);
}
