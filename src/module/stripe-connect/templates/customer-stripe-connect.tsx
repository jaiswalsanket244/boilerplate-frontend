"use client";

import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";
import { useStripeConnectAPI } from "@/module/stripe-connect/hooks/useStripeConnect";
import { MESSAGE_STATUS } from "@/types";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CustomerStripeConnect() {
	const router = useRouter();
	const { useGetCustomerQuery, usePostCustomerIdMutation } = useStripeConnectAPI();
	const { data: customerData, refetch: refetchCustomerData } = useGetCustomerQuery();
	const [isLoading, setIsLoading] = useState(false);
	const [status, setStatus] = useState<MESSAGE_STATUS>(MESSAGE_STATUS.IDLE);

	const handleSignup = () => {
		setIsLoading(true);
		setStatus(MESSAGE_STATUS.IDLE);

		usePostCustomerIdMutation.mutate(undefined, {
			onSuccess: () => {
				setStatus(MESSAGE_STATUS.SUCCESS);
				void refetchCustomerData();
				setIsLoading(false);
			},
			onError: () => {
				setStatus(MESSAGE_STATUS.ERROR);
				setIsLoading(false);
			},
		});
	};

	return (
		<div className="mx-auto w-full max-w-md space-y-5">
			<h1 className="mb-4 text-xl font-semibold">Customer Stripe Connect</h1>

			{/* Stripe Customer Card */}
			<div className="flex flex-col items-start space-y-3 rounded-xl border border-dashed bg-white/50 p-4 backdrop-blur-xs">
				{customerData?.stripeCustomerId ? (
					<div className="space-y-1">
						<p className="text-muted-foreground text-sm">Your Stripe Customer ID:</p>
						<p className="text-green font-mono text-sm font-semibold break-all">{customerData.stripeCustomerId}</p>
					</div>
				) : (
					<div className="flex w-full flex-col gap-2">
						<p className="text-muted-foreground text-sm">Sign up as a Stripe customer</p>
						<Button className="w-full" variant="default" disabled={isLoading} onClick={handleSignup}>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing up...
								</>
							) : (
								"Signup"
							)}
						</Button>

						{/* Inline status feedback */}
						{status !== MESSAGE_STATUS.IDLE && (
							<div
								className={cn(
									"mt-2 flex items-center gap-2 text-sm transition-all duration-200",
									status === MESSAGE_STATUS.SUCCESS && "text-green-600",
									status === MESSAGE_STATUS.ERROR && "text-red-600"
								)}
							>
								{status === MESSAGE_STATUS.SUCCESS && (
									<>
										<CheckCircle2 className="h-4 w-4" />
										<span>Signup successful!</span>
									</>
								)}
								{status === MESSAGE_STATUS.ERROR && (
									<>
										<XCircle className="h-4 w-4" />
										<span>Something went wrong. Please try again.</span>
									</>
								)}
							</div>
						)}
					</div>
				)}
			</div>

			{/* Action Cards */}
			<div className="flex flex-col gap-3 rounded-xl border border-dashed p-4">
				<Button variant="secondary" onClick={() => router.push(routes.stripeConnect.productList)}>
					Show Products
				</Button>
				<Button variant="secondary" onClick={() => router.push(routes.stripeConnect.myOrders)}>
					View Orders
				</Button>
			</div>
		</div>
	);
}
