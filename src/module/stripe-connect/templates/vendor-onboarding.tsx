"use client";

import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { useStripeConnectAPI } from "@/module/stripe-connect/hooks/useStripeConnect";
import { useStripeConnectInstance } from "@/module/stripe-connect/hooks/useStripeConnectInstance";
import type { VendorOnboardingType } from "@/module/stripe-connect/types";
import { ConnectAccountOnboarding, ConnectComponentsProvider } from "@stripe/react-connect-js";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { IoMdArrowRoundBack } from "react-icons/io";

export default function VendorOnboarding({ accountId }: VendorOnboardingType) {
	const router = useRouter();
	const queryClient = useQueryClient();

	const { useGetVendorQuery } = useStripeConnectAPI();

	const [onboardingExited, setOnboardingExited] = useState(false);
	const [connectedAccountId] = useState(accountId);
	const stripeConnectInstance = useStripeConnectInstance(connectedAccountId);

	const { data: vendorData, isLoading } = useGetVendorQuery();

	return (
		<div>
			<Button
				variant="outline"
				onClick={() => router.push(routes.stripeConnect.main)}
				className="flex items-center gap-2"
			>
				<IoMdArrowRoundBack className="h-4 w-4" />
				<span>Back</span>
			</Button>

			{vendorData?.isDetailsSubmitted ? (
				<div className="flex flex-col items-center justify-center gap-5">
					<h1>Vendor Onboarding</h1>
					<p className="text-xl font-medium">Vendor details already submitted</p>
				</div>
			) : (
				<div className="flex flex-col items-center justify-center gap-5">
					<h1>Vendor Onboarding</h1>

					{stripeConnectInstance && (
						<ConnectComponentsProvider connectInstance={stripeConnectInstance}>
							<ConnectAccountOnboarding
								onExit={() => {
									setOnboardingExited(true);
									void queryClient.invalidateQueries({ queryKey: ["vendor"] });
									void queryClient.invalidateQueries({ queryKey: ["earning-details"] });

									router.push(routes.stripeConnect.main);
								}}
							/>
						</ConnectComponentsProvider>
					)}

					{!stripeConnectInstance && !isLoading && (
						<div className="text-error">
							<p>Stripe Connect Instance not initialized</p>
						</div>
					)}

					{(connectedAccountId || onboardingExited) && (
						<div className="dev-callout">
							{connectedAccountId && (
								<p>
									Your connected account ID is: <code className="bold">{connectedAccountId}</code>
								</p>
							)}
						</div>
					)}
				</div>
			)}
		</div>
	);
}
