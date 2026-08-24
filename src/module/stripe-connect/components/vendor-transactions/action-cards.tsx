import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStripeConnectAPI } from "@/module/stripe-connect/hooks/useStripeConnect";
import { ArrowRight } from "lucide-react";

export function ActionCards() {
	const { useExpressDashboardLinkMutation } = useStripeConnectAPI();
	const { mutateAsync: getExpressDashboardLink } = useExpressDashboardLinkMutation();

	const handleExpressDashboard = async () => {
		const urlData = await getExpressDashboardLink();
		window.open(urlData.url, "_blank");
	};

	return (
		<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
			<Card className="flex h-full flex-col shadow-none">
				<CardHeader>
					<CardTitle className="text-lg font-semibold">Access Express Dashboard</CardTitle>
				</CardHeader>
				<CardContent className="relative flex-1 space-y-4">
					<p className="m-h-[4.5rem] text-sm leading-relaxed text-gray-600">
						Access your Stripe Connect dashboard to view all your connected customers, invoices, products, and more.
					</p>
					<div className="absolute bottom-6 right-6 mt-auto flex w-full flex-1 justify-end">
						<Button
							variant="secondary"
							className="w-full bg-gray-200 sm:w-auto"
							onClick={() => void handleExpressDashboard()}
						>
							Express Dashboard <ArrowRight className="ml-2 h-4 w-4" />
						</Button>
					</div>
				</CardContent>
			</Card>
			<Card className="shadow-none">
				<CardHeader>
					<CardTitle className="text-lg font-semibold">Stripe Coupons Page</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col justify-between space-y-4">
					<p className="m-h-[4.5rem] text-sm leading-relaxed text-gray-600">
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Lorem ipsum dolor sit amet,
						consectetur adipiscing elit. Ut et massa mi. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et
						massa mi.
					</p>
					<div className="mt-auto flex w-full justify-end">
						<Button variant="secondary" className="w-full bg-gray-200 sm:w-auto">
							Open Coupons Page <ArrowRight className="ml-2 h-4 w-4" />
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
