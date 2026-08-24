"use client";
import { LineChartCard } from "@/components/common/charts/line-chart-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TIME_FRAMES } from "@/types/filters";
import { useState } from "react";
import { useStripePaymentApi } from "@/module/stripe-payment/hooks/useStripePaymentApi";

const EarningsChart = () => {
	const { useEarningChartDataQuery } = useStripePaymentApi();

	const [timeFrame, setTimeFrame] = useState<TIME_FRAMES>(TIME_FRAMES.MONTHLY);

	const { data: earningChartData, isLoading } = useEarningChartDataQuery(timeFrame);

	const formatValue = (value: number) =>
		timeFrame === TIME_FRAMES.YEARLY ? `$${(value / 1000).toFixed(0)}k` : `$${value}`;

	const selectControl = (
		<Select value={timeFrame} onValueChange={(value: TIME_FRAMES) => setTimeFrame(value)}>
			<SelectTrigger className="h-8 w-[130px] capitalize">
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{Object.values(TIME_FRAMES).map(
					(frame) =>
						frame !== TIME_FRAMES.DAILY && (
							<SelectItem key={frame} value={frame} className="capitalize">
								{frame}
							</SelectItem>
						)
				)}
			</SelectContent>
		</Select>
	);

	return (
		<LineChartCard
			title="Total Earnings"
			data={earningChartData ?? []}
			label="Earnings"
			color="hsl(var(--primary))"
			isLoading={isLoading}
			valueFormatter={formatValue}
			selectControl={selectControl}
		/>
	);
};

export default EarningsChart;
