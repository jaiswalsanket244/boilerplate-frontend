// components/ReturningUsersChart.tsx
"use client";

import React, { type JSX } from "react";
import { PieChart, Pie, Cell, Sector, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DataItem {
	name: string;
	value: number;
	color: string;
	borderColor: string;
	labelColor: string;
}

const data: DataItem[] = [
	{
		name: "Returning Users",
		value: 66,
		color: "#EAF6ED",
		borderColor: "#0E8345",
		labelColor: "#0E8345",
	},
	{
		name: "New Users",
		value: 34,
		color: "#FDF2DC",
		borderColor: "#F6BC2F",
		labelColor: "#F6BC2F",
	},
];

// find the index of the largest slice (data.length >= 1)
const maxIndex = data.reduce<number>(
	(bestIdx, entry, idx, arr) => (arr[bestIdx] !== undefined && entry.value > arr[bestIdx].value ? idx : bestIdx),
	0
);

const RADIAN = Math.PI / 180;

/**
 * Renders percentage labels for all non-active slices,
 * skipping the active one (which uses renderActiveShape).
 */
function renderCustomizedLabel({
	cx,
	cy,
	midAngle,
	innerRadius,
	outerRadius,
	percent,
	index,
}: {
	cx: number;
	cy: number;
	midAngle: number;
	innerRadius: number;
	outerRadius: number;
	percent: number;
	index: number;
}): JSX.Element | null {
	if (index === maxIndex) return null;
	const r = innerRadius + (outerRadius - innerRadius) * 0.5;
	const x = cx + r * Math.cos(-midAngle * RADIAN);
	const y = cy + r * Math.sin(-midAngle * RADIAN);
	const fill = data[index]?.labelColor ?? "#000";

	return (
		<text x={x} y={y} fill={fill} fontSize={12} fontWeight={600} textAnchor="middle" dominantBaseline="central">
			{`${(percent * 100).toFixed(0)}%`}
		</text>
	);
}

/**
 * Props representing the active slice shape.
 */
interface ActiveShapeProps {
	cx: number;
	cy: number;
	innerRadius: number;
	outerRadius: number;
	startAngle: number;
	endAngle: number;
	fill: string;
	percent: number;
	payload: DataItem;
	stroke: string;
}

/**
 * Renders the “popped out” active slice with its label.
 */
function renderActiveShape(props: unknown): JSX.Element {
	const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, percent, payload, stroke } =
		props as ActiveShapeProps;

	const expandedOuter = outerRadius + 10;
	const mid = (startAngle + endAngle) / 2;
	const r = innerRadius + (expandedOuter - innerRadius) * 0.5;
	const x = cx + r * Math.cos(-mid * RADIAN);
	const y = cy + r * Math.sin(-mid * RADIAN);

	return (
		<g>
			<Sector
				cx={cx}
				cy={cy}
				innerRadius={innerRadius}
				outerRadius={expandedOuter}
				startAngle={startAngle}
				endAngle={endAngle}
				fill={fill}
				stroke={stroke}
				strokeWidth={1}
			/>
			<text
				x={x}
				y={y}
				fill={payload.labelColor}
				fontSize={12}
				fontWeight={600}
				textAnchor="middle"
				dominantBaseline="central"
			>
				{`${(percent * 100).toFixed(0)}%`}
			</text>
		</g>
	);
}

export function ReturningUsersChart() {
	const total = data.reduce((sum, item) => sum + item.value, 0);

	return (
		<Card className="rounded-lg border-border shadow-none">
			<CardHeader>
				<CardTitle className="text-lg font-semibold">Returning vs New Users</CardTitle>
			</CardHeader>
			<CardContent className="flex items-center justify-between">
				{/* Pie Chart Container */}
				<div className="relative h-[236px] w-full">
					<ResponsiveContainer width="100%" height="100%">
						<PieChart>
							<Pie
								data={data}
								cx="50%"
								cy="50%"
								innerRadius={40}
								outerRadius={80}
								paddingAngle={5}
								dataKey="value"
								labelLine={false}
								label={renderCustomizedLabel}
								activeIndex={maxIndex}
								activeShape={renderActiveShape}
							>
								{data.map((entry, idx) => (
									<Cell key={idx} fill={entry.color} stroke={entry.borderColor} strokeWidth={1} />
								))}
							</Pie>
						</PieChart>
					</ResponsiveContainer>

					{/* Center Total */}
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="text-2xl font-bold text-foreground">{total}</div>
					</div>
				</div>

				{/* Legend */}
				<div className="flex w-4/6 flex-col justify-center space-y-2">
					{data.map((item, idx) => (
						<div key={idx} className="flex items-center space-x-2">
							<div
								className="h-3 w-3 rounded-full border"
								style={{
									backgroundColor: item.color,
									borderColor: item.borderColor,
									borderWidth: 1,
								}}
							/>
							<span className="text-sm text-muted-foreground">{item.name}</span>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
