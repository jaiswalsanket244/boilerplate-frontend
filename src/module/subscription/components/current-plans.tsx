"use client";

import { useState } from "react";
import { useStripe } from "@stripe/react-stripe-js";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { PiCheckCircleFill, PiFire } from "react-icons/pi";

import { useSubscriptionAPI } from "@/module/subscription/hooks/useSubscription";
import { useProfileAPI } from "@/module/profile/hooks/useProfile";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function CurrentPlans() {
	const queryClient = useQueryClient();
	const { useGetUserData } = useProfileAPI();
	const { data: user } = useGetUserData();
	const router = useRouter();
	const userId = user?._id;
	const { useGetSubscriptionPlans, useNewSubscription } = useSubscriptionAPI();
	const { data: plansOptions, isError, isLoading } = useGetSubscriptionPlans(userId as string);

	const stripe = useStripe();
	const [currentPlan, setCurrentPlan] = useState("");
	const [isSubscribing, setIsSubscribing] = useState(false);

	const [status, setStatus] = useState<{ message: string; type: "error" | "success" | "info" } | null>(null);

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setStatus(null);
		setIsSubscribing(true);

		const selectedPlan = plansOptions?.find((plan) => plan?.plans[0]?.nickname === currentPlan);

		if (!selectedPlan) {
			setStatus({ message: "Please select a valid plan before continuing.", type: "error" });
			setIsSubscribing(false);
			return;
		}

		if (!stripe) {
			setStatus({ message: "Stripe is still loading. Please try again shortly.", type: "error" });
			setIsSubscribing(false);
			return;
		}

		useNewSubscription.mutate(String(selectedPlan.plans[0]?.id), {
			onSuccess: (data) => {
				queryClient.setQueryData(["stripeSubscriptionClientSecret"], data.data.clientSecret);
				setStatus({ message: "Redirecting to checkout...", type: "success" });
				setTimeout(() => router.push(`/checkout`), 1000);
				setIsSubscribing(false);
			},
			onError: () => {
				setStatus({ message: "You have already subscribed to this plan.", type: "error" });
				setIsSubscribing(false);
			},
		});
	};

	if (isLoading) {
		return <div className="text-primary-600 animate-pulse p-4 text-sm">Loading subscription plans...</div>;
	}

	if (isError) {
		return <div className="p-4 text-sm text-red-600">Error fetching subscription plans.</div>;
	}

	return (
		<div className="flex flex-col gap-5">
			<RadioGroup
				value={currentPlan}
				onValueChange={(v) => {
					setCurrentPlan(v);
					setStatus(null);
				}}
				className="flex flex-col gap-4"
			>
				{plansOptions?.map((plan, index) => {
					const nickname = plan?.plans[0]?.nickname ?? "";
					const isSelected = currentPlan === nickname;
					return (
						<div
							key={`plan-${index}`}
							className={`flex cursor-pointer flex-col rounded-xl border p-4 text-sm transition-all duration-200
								${isSelected ? "dark:bg-blue-950 border-blue-500 bg-blue-50" : "border-border hover:border-gray-400"}
							`}
						>
							<div className="flex items-center gap-3">
								<RadioGroupItem value={nickname} id={`plan-${index}`} className="h-5 w-5" />
								<Label htmlFor={`plan-${index}`} className="w-full">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
												<PiFire className="h-4 w-4 text-txt-primary" />
											</div>
											<div>
												<p className="text-sm font-semibold text-txt-primary">{plan.name}</p>
												<p className="text-xs text-txt-secondary-800">{plan.description}</p>
											</div>
										</div>
										{isSelected && <PiCheckCircleFill className="h-5 w-5 text-blue-600" />}
									</div>
								</Label>
							</div>
						</div>
					);
				})}
			</RadioGroup>

			<form onSubmit={handleSubmit} className="flex flex-col gap-2">
				<Button
					type="submit"
					className="relative mt-2 flex items-center justify-center dark:bg-gray-100 dark:text-black"
					disabled={!currentPlan || isSubscribing}
				>
					{isSubscribing ? "Subscribing..." : "Subscribe Now"}
				</Button>

				{status && (
					<p
						className={`text-center text-sm transition-all duration-200 ${
							status.type === "error" ? "text-red-600" : status.type === "success" ? "text-green-600" : "text-gray-500"
						}`}
					>
						{status.message}
					</p>
				)}
			</form>
		</div>
	);
}
