"use client";

import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import EarningsChart from "@/module/stripe-connect/components/earnings-chart";
import { ActionCards } from "@/module/stripe-connect/components/vendor-transactions/action-cards";
import { MetricCards } from "@/module/stripe-connect/components/vendor-transactions/metrics-cards";
import { useStripeConnectAPI } from "@/module/stripe-connect/hooks/useStripeConnect";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function OverviewStripeConnect() {
	const router = useRouter();
	const [onboardingRedirect, setOnboardingRedirect] = useState(false);

	const { usePostAccountMutation, useGetVendorQuery, useGetEarningDetailsQuery } = useStripeConnectAPI();

	const { data: vendorData, isLoading: vendorLoading } = useGetVendorQuery();
	const { data: earningDetails, isLoading: earningDetailsLoading } = useGetEarningDetailsQuery();

	const handleCreate = () => {
		setOnboardingRedirect(true);
		usePostAccountMutation.mutate(undefined, {
			onSuccess: (data) => {
				const accountId = data.data.accountId;
				setOnboardingRedirect(false);
				router.push(routes.stripeConnect.accountSession(accountId));
			},
			onError: () => {
				setOnboardingRedirect(false);
			},
		});
	};

	const formatMetricsData = () => {
		if (!earningDetails) {
			return {
				totalEarnings: "$0",
				pendingTransfer: "$0",
				transferred: "$0",
			};
		}

		return {
			totalEarnings: `$${earningDetails.totalEarning || 0}`,
			pendingTransfer: `$${earningDetails.totalPending || 0}`,
			transferred: `$${earningDetails.totalTransferred || 0}`,
		};
	};

	useEffect(() => {
		if (vendorData?.stripeAccountId && !vendorData?.isDetailsSubmitted) {
			router.push(routes.stripeConnect.accountSession(vendorData.stripeAccountId));
		}
	}, [vendorData, router]);

	if (vendorLoading || earningDetailsLoading) {
		return (
			<div className="mx-auto flex size-full flex-col items-center justify-center gap-3">
				<Loader2 className="mr-2 size-7 animate-spin" />
				<span className="text-base">Loading...</span>
			</div>
		);
	}

	return (
		<div className="flex flex-1">
			{vendorData?.stripeAccountId === undefined || !vendorData?.isDetailsSubmitted ? (
				<div className="mx-auto flex flex-col items-center justify-center">
					<p className="mb-6 max-w-sm text-center text-sm text-gray-500">
						Connect your Stripe account to securely process payments and manage transactions directly from our platform.
					</p>
					<Button onClick={handleCreate} className="h-12 w-64 text-base" disabled={usePostAccountMutation.isPending}>
						{onboardingRedirect ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								<span>Vendor Onboarding</span>
							</>
						) : (
							"Connect Stripe"
						)}
					</Button>

					{usePostAccountMutation.isError && (
						<p className="text-error mt-2 text-xs font-medium">Unable to create account. Please try again.</p>
					)}
				</div>
			) : (
				<div className="space-y-6">
					<div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-6">
						<div className="md:col-span-4 lg:col-span-4">
							<MetricCards data={formatMetricsData()} />
						</div>
						<div className="overflow-hidden md:col-span-8 lg:col-span-8">
							<EarningsChart />
						</div>
					</div>
					<ActionCards />
				</div>
			)}
		</div>
	);
}
