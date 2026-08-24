"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SessionFrequencyChartProps {
	freePlan?: string;
	proPlan?: string;
	premium?: string;
}
const data = [
	{ day: "Mon", freePlan: 3.5, proPlan: 4.2, premium: 4.5 },
	{ day: "Tue", freePlan: 3.2, proPlan: 3.8, premium: 4.1 },
	{ day: "Wed", freePlan: 3.8, proPlan: 4.0, premium: 4.3 },
	{ day: "Thu", freePlan: 3.1, proPlan: 3.9, premium: 4.2 },
	{ day: "Fri", freePlan: 2.9, proPlan: 3.2, premium: 3.8 },
	{ day: "Sat", freePlan: 3.0, proPlan: 4.1, premium: 4.4 },
	{ day: "Sun", freePlan: 2.8, proPlan: 3.5, premium: 4.0 },
];

export function SessionFrequencyChart({
	freePlan = "hsl(var(--chart-1))",
	proPlan = "hsl(var(--chart-2))",
	premium = "hsl(var(--chart-3))",
}: SessionFrequencyChartProps) {
	return (
		<Card className="rounded-lg border-border shadow-none">
			<CardHeader>
				<CardTitle className="text-lg font-semibold">Average Session Frequency per User Type</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="h-[200px] w-full">
					<ResponsiveContainer width="100%" height="100%">
						<LineChart data={data}>
							<CartesianGrid strokeDasharray="3 3" className="opacity-30" />
							<XAxis
								dataKey="day"
								axisLine={false}
								tickLine={false}
								className="text-sm"
								padding={{ left: 40, right: 40 }}
							/>
							<YAxis axisLine={false} tickLine={false} className="text-sm" domain={[0, 5]} />
							<Line
								type="monotone"
								dataKey="freePlan"
								stroke={freePlan}
								strokeWidth={1}
								dot={{ fill: freePlan, strokeWidth: 2, r: 3 }}
							/>
							<Line
								type="monotone"
								dataKey="proPlan"
								stroke={proPlan}
								strokeWidth={1}
								dot={{ fill: proPlan, strokeWidth: 2, r: 3 }}
							/>
							<Line
								type="monotone"
								dataKey="premium"
								stroke={premium}
								strokeWidth={1}
								dot={{ fill: premium, strokeWidth: 2, r: 3 }}
							/>
						</LineChart>
					</ResponsiveContainer>
				</div>

				{/* Legend */}
				<div className="mt-4 flex justify-center space-x-6">
					<div className="flex items-center space-x-2">
						<div className="h-2 w-2 rounded-full bg-yellow-600" />
						<span className="text-sm text-muted-foreground">Free Plan</span>
					</div>
					<div className="flex items-center space-x-2">
						<div className="h-2 w-2 rounded-full bg-blue-600" />
						<span className="text-sm text-muted-foreground">Pro Plan</span>
					</div>
					<div className="flex items-center space-x-2">
						<div className="h-2 w-2 rounded-full bg-green-600" />
						<span className="text-sm text-muted-foreground">Premium</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
