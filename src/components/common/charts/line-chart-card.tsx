import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Loader } from "lucide-react";
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Line } from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";

export interface LineChartDataPoint {
	/** X-axis value (e.g., month, day, label) */
	label: string;
	/** Numeric value for Y-axis */
	value: number;
}

const dataKey = "value";
const xKey = "label";

export interface LineChartCardProps {
	title: string;
	data: LineChartDataPoint[];
	/** Label for tooltip and legend */
	label?: string;
	color?: string;
	isLoading?: boolean;
	valueFormatter?: (value: number) => string;
	selectControl?: React.ReactNode;
	className?: string;
}

export const LineChartCard = ({
	title,
	data,
	label = "Value",
	color = "hsl(var(--primary))",
	isLoading = false,
	valueFormatter = (v) => String(v),
	selectControl,
	className = "",
}: LineChartCardProps) => {
	const isMobile = useIsMobile();

	return (
		<Card className={`flex h-full w-full flex-col overflow-hidden ${className}`}>
			<CardHeader className="flex shrink-0 flex-row items-center justify-between space-y-0 pb-4">
				<CardTitle className="text-foreground text-base font-medium">{title}</CardTitle>
				{selectControl}
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
					<ChartContainer
						config={{
							[dataKey]: {
								label,
								color,
							},
						}}
						className="h-[270px] w-full"
					>
						<ResponsiveContainer width="100%" height="100%">
							<LineChart
								data={data}
								margin={{
									top: 10,
									right: 30,
									left: 10,
									bottom: 10,
								}}
							>
								<CartesianGrid strokeDasharray="3 3" stroke="#000000" opacity={0.4} />
								<XAxis
									dataKey={xKey}
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
									tickFormatter={valueFormatter}
									dx={-10}
									width={isMobile ? 50 : 60}
								/>
								<ChartTooltip
									cursor={{ stroke: color, strokeWidth: 1 }}
									content={<ChartTooltipContent hideLabel />}
									formatter={(v: number) => [valueFormatter(v), label]}
								/>
								<Line
									type="linear"
									dataKey={dataKey as string}
									stroke={color}
									strokeWidth={isMobile ? 1.5 : 2}
									dot={{
										fill: color,
										strokeWidth: 2,
										r: isMobile ? 3 : 4,
									}}
									activeDot={{
										r: isMobile ? 5 : 6,
										fill: color,
										strokeWidth: 0,
									}}
								/>
							</LineChart>
						</ResponsiveContainer>
					</ChartContainer>
				)}
			</CardContent>
		</Card>
	);
};
