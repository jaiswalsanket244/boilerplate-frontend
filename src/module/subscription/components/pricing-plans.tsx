"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProfileAPI } from "@/module/profile/hooks/useProfile";
import { useSubscriptionAPI } from "@/module/subscription/hooks/useSubscription";
import { useStripe } from "@stripe/react-stripe-js";
import { useQueryClient } from "@tanstack/react-query";
import PaymentModal from "@/module/subscription/components/payment-modal";
import { Loader2 } from "lucide-react";
import { GenericAlert } from "@/components/common/alert/alert";
import { useRouter } from "next/navigation";
import { PLAN_NAME, type PlanName } from "@/module/subscription/types/index";
import { MESSAGE_STATUS } from "@/types";

export default function PricingPlans() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const { useGetUserData } = useProfileAPI();
	const { data: user } = useGetUserData();
	const userId = user?._id;
	const stripe = useStripe();
	const [isYearly, setIsYearly] = useState(true);
	const selectedBillingPeriod = isYearly ? "year" : "month";
	const [isSubscribing, setIsSubscribing] = useState(false);
	const [paymentModal, setPaymentModal] = useState({
		isOpen: false,
		planName: "",
		planPrice: "",
	});
	const [successAlert, setSuccessAlert] = useState({
		isOpen: false,
		planName: "",
	});

	const [status, setStatus] = useState<{ message: string; type: MESSAGE_STATUS | null }>({
		message: "",
		type: null,
	});

	const { useGetSubscriptions, useGetSubscriptionPlans, useUpdateSubscription } = useSubscriptionAPI();

	const { data: currentPlan, isError, refetch: refetchSubscriptions } = useGetSubscriptions(userId as string);
	const { data: allSubscriptionPlans, isLoading } = useGetSubscriptionPlans(userId as string);

	const currentPlanName = currentPlan?.planName?.toLowerCase().replace(" plan", "") || PLAN_NAME.FREE;
	const currentBillingPeriod = currentPlan?.period || "month";

	const requiresPaymentModal = (planName: string) => {
		const normalizedPlanName = planName.toLowerCase();
		const normalizedCurrentPlan = currentPlanName;
		return (
			normalizedCurrentPlan === PLAN_NAME.FREE &&
			(normalizedPlanName === PLAN_NAME.PRO || normalizedPlanName === PLAN_NAME.PREMIUM.toLowerCase())
		);
	};

	const getPlanButtonConfig = (planName: string, planBillingPeriod: string) => {
		const normalizedPlanName = planName.toLowerCase();
		const normalizedCurrentPlan = currentPlanName;

		if (normalizedPlanName === normalizedCurrentPlan && planBillingPeriod === currentBillingPeriod) {
			return {
				buttonText: "Current Plan",
				buttonVariant: "outline-solid",
				isCurrentPlan: true,
				disabled: true,
			};
		}

		if (normalizedPlanName === normalizedCurrentPlan && planBillingPeriod !== currentBillingPeriod) {
			const periodText = planBillingPeriod === "year" ? "Yearly" : "Monthly";
			return {
				buttonText: `Switch to ${periodText}`,
				buttonVariant: "outline-solid",
				isCurrentPlan: false,
				disabled: false,
			};
		}

		const planHierarchy: Record<PlanName, number> = {
			[PLAN_NAME.FREE]: 0,
			[PLAN_NAME.PRO]: 1,
			[PLAN_NAME.PREMIUM]: 2,
		};

		const currentPlanLevel = planHierarchy[normalizedCurrentPlan as PlanName] ?? 0;
		const targetPlanLevel = planHierarchy[normalizedPlanName as PlanName] ?? 0;

		if (targetPlanLevel > currentPlanLevel) {
			const planDisplayName = planName.charAt(0).toUpperCase() + planName.slice(1);
			return {
				buttonText: `Upgrade to ${planDisplayName}`,
				buttonVariant: "default",
				isCurrentPlan: false,
				disabled: false,
			};
		} else if (targetPlanLevel < currentPlanLevel) {
			const planDisplayName = planName.charAt(0).toUpperCase() + planName.slice(1);
			return {
				buttonText: `Downgrade to ${planDisplayName}`,
				buttonVariant: "outline-solid",
				isCurrentPlan: false,
				disabled: false,
			};
		}

		return {
			buttonText: `Select ${planName}`,
			buttonVariant: "default",
			isCurrentPlan: false,
			disabled: false,
		};
	};

	// Filter and map plans based on selected billing period
	const getFilteredPlans = () => {
		if (!allSubscriptionPlans) return [];

		const filteredPlans = [];

		// Always include Free plan (assuming it doesn't have billing periods)
		const freePlan = allSubscriptionPlans.find((plan) => plan.name.toLowerCase() === PLAN_NAME.FREE);

		if (freePlan) {
			const buttonConfig = getPlanButtonConfig(PLAN_NAME.FREE, "month"); // Free plan treated as monthly
			filteredPlans.push({
				name: freePlan.name,
				price: "$0",
				period: "",
				description: freePlan.description,
				features: freePlan.marketing_features,
				isPopular: false,
				buttonText: buttonConfig.buttonText,
				isCurrentPlan: buttonConfig.isCurrentPlan,
				buttonVariant: buttonConfig.buttonVariant,
				disabled: buttonConfig.disabled,
				billingPeriod: "month",
				planId: freePlan.id,
			});
		}

		// Filter other plans by billing period
		allSubscriptionPlans.forEach((planOption) => {
			if (planOption.name.toLowerCase() === PLAN_NAME.FREE) return;

			// Find the plan with the selected billing period
			const matchingPlan = planOption.plans.find((p) => p.interval === selectedBillingPeriod);

			if (matchingPlan) {
				const buttonConfig = getPlanButtonConfig(planOption.name, selectedBillingPeriod);
				filteredPlans.push({
					name: planOption.name,
					price: `$${(matchingPlan.amount / 100).toFixed(2)}`,
					period: matchingPlan.interval,
					description: planOption.description,
					features: planOption.marketing_features,
					isPopular: planOption.name.toLowerCase() === PLAN_NAME.PRO,
					buttonText: buttonConfig.buttonText,
					isCurrentPlan: buttonConfig.isCurrentPlan,
					buttonVariant: buttonConfig.buttonVariant,
					disabled: buttonConfig.disabled,
					billingPeriod: selectedBillingPeriod,
					planId: matchingPlan.id,
				});
			}
		});

		return filteredPlans;
	};

	const plans = getFilteredPlans();

	const handleSubmit = (selectedPlanName: string) => {
		setStatus({ message: "", type: null });
		setIsSubscribing(true);

		const selectedPlan = plans.find((plan) => plan.name === selectedPlanName);

		if (!selectedPlan) {
			setStatus({ message: "Selected plan not found.", type: MESSAGE_STATUS.ERROR });
			setIsSubscribing(false);
			return;
		}

		// Check if this action requires payment modal
		const needsPaymentModal = requiresPaymentModal(selectedPlanName);

		if (needsPaymentModal && !stripe) {
			setStatus({ message: "Stripe is still loading. Please try again.", type: MESSAGE_STATUS.ERROR });
			setIsSubscribing(false);
			return;
		}

		const payload = { newPriceId: selectedPlan.planId };

		useUpdateSubscription.mutate(payload, {
			onSuccess: (data) => {
				if (needsPaymentModal) {
					queryClient.setQueryData(["stripeSubscriptionClientSecret"], data.data.clientSecret);
					setPaymentModal({
						isOpen: true,
						planName: selectedPlanName,
						planPrice: selectedPlan.price,
					});
				} else {
					setSuccessAlert({
						isOpen: true,
						planName: selectedPlanName,
					});
					handlePaymentSuccess();
				}
				setIsSubscribing(false);
			},
			onError: () => {
				setStatus({ message: "You have already subscribed to this plan.", type: MESSAGE_STATUS.ERROR });
				setIsSubscribing(false);
			},
		});
	};

	const handleModalClose = () => setPaymentModal({ isOpen: false, planName: "", planPrice: "" });
	const handlePaymentSuccess = () => {
		void refetchSubscriptions();
		router.refresh();
	};
	const handleSuccessAlertClose = () => {
		setSuccessAlert({ isOpen: false, planName: "" });
		void refetchSubscriptions();
		router.refresh();
	};

	if (isLoading) {
		return <Loader2 className="mr-2 h-4 w-4 animate-spin" />;
	}

	if (isError) {
		return <div className="text-red-600">Error occurred while fetching subscription plans</div>;
	}

	return (
		<>
			<div className="py-4">
				{/* Billing toggle */}
				<div className="mb-4">
					<p className="text-txt-secondary-900 mb-3 text-sm">Select Pricing</p>
					<div className="flex w-fit items-center justify-center gap-2 rounded-2xl bg-gray-100 p-1">
						<button
							className={`rounded-2xl px-4 py-2 text-sm font-medium transition-colors ${
								!isYearly ? "text-txt-primary bg-white shadow-xs" : "text-txt-secondary-900 hover:text-txt-primary"
							}`}
							onClick={() => setIsYearly(false)}
						>
							Monthly
						</button>
						<button
							className={`rounded-2xl px-4 py-2 text-sm font-medium transition-colors ${
								isYearly ? "text-txt-primary bg-white shadow-xs" : "text-txt-secondary-900 hover:text-txt-primary"
							}`}
							onClick={() => setIsYearly(true)}
						>
							Annual
						</button>
					</div>
				</div>

				{/* Plans list */}
				<div className="space-y-3">
					{plans.map((plan, index) => (
						<Card
							key={`${plan.name}-${plan.billingPeriod}-${index}`}
							className={`relative border ${
								plan.isPopular ? "border-gray-900" : "border-gray-200"
							} ${plan.isCurrentPlan ? "bg-gray-50" : "bg-white"}`}
						>
							{plan.isPopular && (
								<div className="absolute -top-2 right-4">
									<Badge className="bg-black px-2 py-1 text-xs text-white">Most Popular</Badge>
								</div>
							)}

							<CardContent className="p-4">
								<div className="mb-5 flex items-center justify-between">
									<div className="flex-1">
										<div className="mb-2 flex items-center gap-3">
											<h4 className="text-txt-primary font-medium">{plan.name}</h4>
											{plan.name.toLowerCase() === PLAN_NAME.PRO && plan.billingPeriod === "year" && (
												<Badge variant="outline" className="text-xs">
													Save 50%
												</Badge>
											)}
										</div>
										<p className="text-txt-secondary-900 mb-3 max-w-xs text-sm">{plan.description}</p>
										<div className="flex items-baseline gap-1">
											<span className="text-txt-primary text-2xl font-bold">{plan.price}</span>
											<span className="text-txt-secondary-800 text-sm">
												{plan.name.toLowerCase() === PLAN_NAME.FREE ? "Free" : `Billed ${plan.period}ly`}
											</span>
										</div>
									</div>

									{/* Features */}
									<div className="flex-1 px-6">
										<div className="space-y-2">
											{plan.features.slice(0, 4).map((feature, featureIndex) => (
												<div key={featureIndex} className="flex items-center gap-2">
													<div className="h-1.5 w-1.5 shrink-0 rounded-full bg-green-500"></div>
													<span className="text-txt-secondary-900 text-sm">{feature.name}</span>
												</div>
											))}
										</div>
									</div>
								</div>
								<div>
									<Button
										className={`w-full ${
											plan.isCurrentPlan
												? "text-txt-tertiary cursor-not-allowed bg-gray-100 hover:bg-gray-100"
												: plan.buttonText.includes("Upgrade")
													? "bg-black text-white hover:bg-gray-800"
													: "border-border text-txt-primary-800 border bg-gray-100 hover:bg-gray-200"
										}`}
										disabled={plan.disabled || isSubscribing}
										onClick={() => handleSubmit(plan.name)}
									>
										{isSubscribing ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
											</>
										) : (
											plan.buttonText
										)}
									</Button>
								</div>
							</CardContent>
						</Card>
					))}

					{status.message && (
						<p
							className={`mt-3 text-center text-sm transition-all ${
								status.type === MESSAGE_STATUS.ERROR ? "text-error" : "text-success"
							}`}
						>
							{status.message}
						</p>
					)}
				</div>
			</div>

			{/* Modals / Alerts */}
			{paymentModal.isOpen && (
				<PaymentModal
					isOpen={paymentModal.isOpen}
					onClose={handleModalClose}
					planName={paymentModal.planName}
					planPrice={paymentModal.planPrice}
					onSuccess={handlePaymentSuccess}
				/>
			)}

			<GenericAlert
				title="Subscription Updated Successfully!"
				description={`You have successfully updated your subscription to the ${successAlert.planName} plan. Your new plan features are now active.`}
				buttonText="Close"
				isOpen={successAlert.isOpen}
				onClose={handleSuccessAlertClose}
				onConfirm={handleSuccessAlertClose}
			/>
		</>
	);
}
