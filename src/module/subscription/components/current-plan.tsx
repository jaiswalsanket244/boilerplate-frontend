import { useProfileAPI } from "@/module/profile/hooks/useProfile";
import { useSubscriptionAPI } from "@/module/subscription/hooks/useSubscription";
import { Card, CardContent } from "@/components/ui/card";

export const CurrentPlanCard = () => {
	const { useGetUserData } = useProfileAPI();
	const { data: user } = useGetUserData();
	const userId = user?._id;
	const { useGetSubscriptions } = useSubscriptionAPI();

	const { data: subscription, isLoading: currentPlanLoading } = useGetSubscriptions(userId as string);

	if (currentPlanLoading) {
		return <div className="p-4">Loading current plan...</div>;
	}

	const isSubscriptionEmpty = !subscription || Object.keys(subscription).length === 0;

	const currentPlan = isSubscriptionEmpty
		? {
				planName: "Free Plan",
				price: 0,
				period: "free",
				description: "Lorem ipsum dolor sit amet, consectetur elit.",
				features: [
					{ name: "Lorem ipsum dolor sit amet.", included: true },
					{ name: "Lorem ipsum dolor sit amet.", included: true },
					{ name: "Lorem ipsum dolor sit amet.", included: true },
					{ name: "Lorem ipsum dolor sit amet.", included: true },
				],
			}
		: subscription;

	const formatPrice = (priceInCents: number) => {
		if (priceInCents === 0) return "0";
		return `${(priceInCents / 100).toFixed(2)}`;
	};

	const formattedPrice = formatPrice(currentPlan?.price);

	return (
		<Card className="border border-gray-200 bg-white">
			<CardContent className="p-6">
				<div className="flex items-start justify-between">
					{/* Left side - Plan details */}
					<div className="flex space-x-5">
						<div>
							<h4 className="mb-2 text-lg font-semibold text-txt-primary">{currentPlan.planName}</h4>
							<span>{currentPlan.description}</span>
							<div className="mb-1 flex items-baseline gap-1">
								<span className="text-lg text-txt-primary">$</span>
								<span className="text-4xl font-bold text-txt-primary">{formattedPrice}</span>
							</div>
							{currentPlan.planName === "Free Plan" ? (
								<span className="text-sm text-txt-secondary-800">Free</span>
							) : (
								<span className="text-sm text-txt-secondary-800">billed {currentPlan.period}ly</span>
							)}
						</div>

						{/* Dummy data for now can fix once we have the features requirement */}
						{currentPlan.features && currentPlan.features.length > 0 && (
							<div className="mt-4 space-y-2">
								{/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access  */}
								{currentPlan.features.map((feature: any, index: number) => {
									return (
										<div key={index} className="flex items-start gap-3">
											<span className="text-sm leading-relaxed text-txt-primary-800">{feature.name}</span>
										</div>
									);
								})}
							</div>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
};
