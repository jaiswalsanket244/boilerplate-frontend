"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card, CardContent } from "@/components/ui/card";
import PricingPlans from "@/module/subscription/components/pricing-plans";
import { CurrentPlanCard } from "@/module/subscription/components/current-plan";

interface SubscriptionSectionProps {
	title: string;
	description: string;
	children?: React.ReactNode;
	defaultOpen?: boolean;
}

const SubscriptionSection: React.FC<SubscriptionSectionProps> = ({
	title,
	description,
	children,
	defaultOpen = false,
}) => {
	const [isOpen, setIsOpen] = useState(defaultOpen);

	return (
		<Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
			<CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg px-2 py-4 text-left transition-colors hover:bg-gray-50">
				<div className="flex flex-col space-y-1">
					<h3 className="text-lg font-medium text-txt-primary">{title}</h3>
					{!isOpen && description && <p className="text-sm text-txt-secondary-800">{description}</p>}
				</div>
				<ChevronDown className="h-5 w-5 text-txt-tertiary transition-transform duration-200 data-[state=open]:rotate-180" />
			</CollapsibleTrigger>
			<CollapsibleContent className="pb-4">
				<div className="px-2">{children}</div>
			</CollapsibleContent>
		</Collapsible>
	);
};

const SubscriptionManagement: React.FC = () => {
	return (
		<div className="max-w-3xl p-6">
			<Card className="border-0 shadow-none">
				<CardContent className="p-0">
					<SubscriptionSection
						title="Current Plan"
						description="You're currently using the Pro Plan. Tap to view more."
						defaultOpen={false}
					>
						<CurrentPlanCard />
					</SubscriptionSection>

					<div className="border-t border-gray-100" />

					<SubscriptionSection
						title="Upgrade your Plan"
						description="Upgrade your current plan to get more benefits from Boilerplate. Tap to view more."
						defaultOpen={false}
					>
						<PricingPlans />
					</SubscriptionSection>

					<div className="border-t border-gray-100" />

					<SubscriptionSection title="Cancel Subscription" description="" defaultOpen={false}>
						{/* Content for cancellation options will go here */}
						<div className="rounded-lg border border-red-100 bg-red-50 p-4">
							<p className="text-sm text-red-600">
								Subscription cancellation options and information will be displayed here.
							</p>
						</div>
					</SubscriptionSection>
				</CardContent>
			</Card>
		</div>
	);
};

export default SubscriptionManagement;
