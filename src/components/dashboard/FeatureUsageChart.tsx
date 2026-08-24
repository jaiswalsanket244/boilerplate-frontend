// components/FeatureUsageChart.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LabelList, Cell } from "recharts";

import type { LabelProps } from "recharts";

// explicit (number|string) → string
function percentFormatter(value: number | string) {
	return `${value}%`;
}

// include custom fill & stroke on each entry
const data = [
	{
		name: "Feature 1",
		usage: 89.72,
		fill: "#EAF6ED",
		stroke: "#0E8345",
	},
	{
		name: "Feature 2",
		usage: 64.48,
		fill: "#FDF2DC",
		stroke: "#F6BC2F",
	},
	{
		name: "Feature 3",
		usage: 37.81,
		fill: "#FFF0EE",
		stroke: "#DE1135",
	},
	{
		name: "Feature 4",
		usage: 67.45,
		fill: "#EFF4FE",
		stroke: "#276EF1",
	},
];

export function FeatureUsageChart() {
	// Custom label renderer for LabelList

	const renderCustomLabel = (props: LabelProps) => {
		const { x = 0, y = 0, width = 0, height = 0, value = "", index = 0 } = props;
		const entry = data[index] ?? { stroke: "#374151" };
		return (
			<text
				x={Number(x) + Number(width) - 5}
				y={Number(y) + Number(height) / 2}
				fill={entry.stroke}
				fontSize={12}
				fontWeight="bold"
				textAnchor="end"
				dominantBaseline="middle"
			>
				{percentFormatter(value)}
			</text>
		);
	};

	return (
		<Card className="border-border rounded-lg shadow-none">
			<CardHeader>
				<CardTitle className="text-lg font-semibold">Feature usage breakdown</CardTitle>
			</CardHeader>
			<CardContent className="h-53">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart layout="vertical" data={data} margin={{ top: 10, right: 20, left: 5, bottom: 10 }}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis type="number" domain={[0, 100]} tickFormatter={percentFormatter} />
						<YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 14 }} />
						<Tooltip formatter={percentFormatter} labelClassName="text-black/80" />
						<Bar dataKey="usage" barSize={20} animationDuration={500}>
							{data.map((entry, index) => (
								<Cell key={`cell-${index}`} fill={entry.fill} stroke={entry.stroke} strokeWidth={1} />
							))}
							<LabelList dataKey="usage" content={renderCustomLabel} />
						</Bar>
					</BarChart>
				</ResponsiveContainer>
			</CardContent>
		</Card>
	);
}
