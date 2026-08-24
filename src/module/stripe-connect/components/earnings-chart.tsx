import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { useStripeConnectAPI } from "@/module/stripe-connect/hooks/useStripeConnect";
import { TIME_FRAMES } from "@/types/filters";
import { Loader } from "lucide-react";
import { useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

const chartConfig = {
	earnings: {
		label: "Earnings",
		color: "hsl(var(--chart-1))",
	},
} satisfies ChartConfig;

const EarningsChart = () => {
	const { useGetEarningsQuery } = useStripeConnectAPI();
	const [timeFrame, setTimeFrame] = useState<TIME_FRAMES>(TIME_FRAMES.MONTHLY);

	const isMobile = useIsMobile();

	const { data: earningsData, isLoading } = useGetEarningsQuery(timeFrame);

	const formatValue = (value: number) => {
		if (timeFrame === TIME_FRAMES.YEARLY) {
			return `$${(value / 1000).toFixed(0)}k`;
		}
		return `$${value}`;
	};

	return (
		<Card className="flex h-full w-full flex-col">
			<CardHeader className="flex shrink-0 flex-row items-center justify-between space-y-0 pb-4">
				<CardTitle className="text-foreground text-base font-medium">Total Earnings</CardTitle>
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
			</CardHeader>
			<CardContent className="min-h-0 flex-1 pt-0">
				{isLoading ? (
					<div className="relative h-[250px] w-full space-y-3">
						<Skeleton className="h-4 w-[120px]" />
						<div className="bg-grid-pattern border-border/50 relative size-full flex-1 overflow-hidden rounded-lg border">
							<div className="from-muted/20 to-muted/5 absolute inset-0 bg-linear-to-br" />
							<div className="flex h-full items-center justify-center">
								<div className="flex items-center space-x-2">
									<Loader className="size animate-spin" />
									<span className="text-muted-foreground text-sm">Loading chart data...</span>
								</div>
							</div>
						</div>
					</div>
				) : (
					<ChartContainer config={chartConfig} className="h-[270px] w-full">
						<ResponsiveContainer width="100%" height="100%">
							<LineChart
								data={earningsData}
								margin={{
									top: 10,
									right: 30,
									left: 10,
									bottom: 10,
								}}
							>
								<CartesianGrid strokeDasharray="3 3" stroke="#000000" opacity={0.4} />
								<XAxis
									dataKey="month"
									axisLine={false}
									tickLine={false}
									tick={{
										fill: "hsl(var(--chart-text))",
										fontSize: isMobile ? 10 : 12,
									}}
									dy={10}
									interval={isMobile ? 1 : 0}
								/>
								<YAxis
									axisLine={false}
									tickLine={false}
									tick={{
										fill: "hsl(var(--chart-text))",
										fontSize: isMobile ? 10 : 12,
									}}
									tickFormatter={formatValue}
									dx={-10}
									width={isMobile ? 50 : 60}
								/>
								<ChartTooltip
									cursor={{ stroke: "hsl(var(--chart-1))", strokeWidth: 1 }}
									content={<ChartTooltipContent hideLabel />}
									formatter={(value: number) => [formatValue(value), " Earnings"]}
								/>
								<Line
									type="linear"
									dataKey="earnings"
									stroke="hsl(var(--primary))"
									strokeWidth={isMobile ? 1.5 : 2}
									dot={{
										fill: "hsl(var(--primary))",
										strokeWidth: 2,
										r: isMobile ? 3 : 4,
									}}
									activeDot={{
										r: isMobile ? 5 : 6,
										fill: "hsl(var(--primary))",
										strokeWidth: 0,
									}}
								/>
							</LineChart>
						</ResponsiveContainer>
					</ChartContainer>
				)}
				<p className="text-center text-sm font-semibold text-gray-500">Months</p>
			</CardContent>
		</Card>
	);
};

export default EarningsChart;
