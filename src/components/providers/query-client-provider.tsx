"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_KEY;
const stripePromise = loadStripe(publishableKey as string);

export default function Provider({ children }: { children: React.ReactNode }) {
	const [client] = useState(new QueryClient());

	return (
		<Elements stripe={stripePromise}>
			<QueryClientProvider client={client}>
				{children}
				<ReactQueryDevtools initialIsOpen={false} />
			</QueryClientProvider>
		</Elements>
	);
}
