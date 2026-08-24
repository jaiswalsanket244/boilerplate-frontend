import EarningsChart from "@/module/stripe-payment/components/dashboard/earning-chart";

const DashboardStripePayment = () => {
	return (
		<div className="w-full space-y-4">
			<div className="w-full">
				<EarningsChart />
			</div>
		</div>
	);
};

export default DashboardStripePayment;
