"use client";

import { useCallback, useEffect, useState } from "react";
import { loadConnectAndInitialize, type StripeConnectInstance } from "@stripe/connect-js";
import { useStripeConnectAPI } from "@/module/stripe-connect/hooks/useStripeConnect";

export const useStripeConnectInstance = (accountId: string) => {
	const [stripeConnectInstance, setStripeConnectInstance] = useState<StripeConnectInstance>();
	const { usePostAccountSessionMutation } = useStripeConnectAPI();
	const { mutateAsync } = usePostAccountSessionMutation;

	const fetchClientSecret = useCallback(async () => {
		try {
			const data = await mutateAsync({ accountId });
			const clientSecret = data.data.clientSecret;
			return clientSecret;
		} catch (error) {
			throw error;
		}
	}, [mutateAsync, accountId]);

	useEffect(() => {
		if (accountId) {
			setStripeConnectInstance(
				loadConnectAndInitialize({
					publishableKey: process.env.NEXT_PUBLIC_STRIPE_KEY as string,
					fetchClientSecret,
					appearance: {
						overlays: "dialog",
						variables: {
							colorPrimary: "#000000",
						},
					},
				})
			);
		}
	}, [accountId, fetchClientSecret]);

	return stripeConnectInstance;
};
