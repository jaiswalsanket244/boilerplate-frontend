// components/UserGrowthChart.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminDashboardAPI } from "@/module/admin-dashboard/hooks/useAdminDashboard";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

const tabs = [
	{ id: "total", label: "Total Registered Users" },
	{ id: "active", label: "Active Users" },
	{ id: "new", label: "New Sign Ups" },
] as const;

interface UserGrowthChartProps {
	thisYearColor?: string;
	lastYearColor?: string;
}

export function UserGrowthChart({
	thisYearColor = "hsl(var(--chart-1))",
	lastYearColor = "hsl(var(--chart-2))",
}: UserGrowthChartProps) {
	const [activeTab, setActiveTab] = useState<string>(tabs[0].id);
	const [selectedTimeframe, setSelectedTimeframe] = useState<string>("monthly");

	const { useGetUserAnalyticsQuery } = useAdminDashboardAPI();
	const { data: analyticsData, isLoading, error } = useGetUserAnalyticsQuery(activeTab, selectedTimeframe);

	if (error) return <div className="flex h-full items-center justify-center text-red-500">Error: {error.message}</div>;

	return (
		<Card className="border-border rounded-lg shadow-none">
			<CardHeader className="pb-4">
				<div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
					<div className="flex flex-wrap gap-2">
						{tabs.map((tab) => (
							<Button
								key={tab.id}
								variant={tab.id === activeTab ? "outline" : "ghost"}
								size="sm"
								className={`rounded-4xl sm:text-sm ${tab.id === activeTab ? "font-bold" : "font-normal"}`}
								onClick={() => setActiveTab(tab.id)}
							>
								{tab.label}
							</Button>
						))}
					</div>
					<Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
						<SelectTrigger className="w-[120px]">
							<SelectValue placeholder="Timeframe" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="daily">Daily</SelectItem>
							<SelectItem value="weekly">Weekly</SelectItem>
							<SelectItem value="monthly">Monthly</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<div className="text-primary flex h-[170px] w-full items-center justify-center text-base font-semibold">
						<LoaderCircle className="animate-spin" size={24} />
					</div>
				) : (
					<>
						<div className="mb-4 flex space-x-6">
							<div className="flex items-center space-x-2">
								<div className="h-2 w-2 rounded-full" style={{ backgroundColor: thisYearColor }} />
								<span className="text-xs">This year</span>
							</div>
							<div className="flex items-center space-x-2">
								<div className="h-2 w-2 rounded-full" style={{ backgroundColor: lastYearColor }} />
								<span className="text-xs">Last Year</span>
							</div>
						</div>

						<div className="h-[160px] w-full">
							<ResponsiveContainer width="100%" height="100%">
								<LineChart data={analyticsData}>
									<CartesianGrid strokeDasharray="3 3" className="opacity-30" />
									<XAxis
										dataKey="key"
										axisLine={false}
										tickLine={false}
										className="text-sm"
										padding={{ left: 30, right: 30 }}
									/>
									<YAxis
										axisLine={false}
										tickLine={false}
										className="text-sm"
										tickFormatter={(value: number) => `${value / 1000}k`}
									/>
									<Line
										type="monotone"
										dataKey="thisYear"
										stroke={thisYearColor}
										strokeWidth={1}
										dot={false}
										activeDot={false}
									/>
									<Line
										type="monotone"
										dataKey="lastYear"
										stroke={lastYearColor}
										strokeWidth={1}
										strokeDasharray="3 3"
										dot={false}
										activeDot={false}
									/>
								</LineChart>
							</ResponsiveContainer>
						</div>
					</>
				)}
			</CardContent>
		</Card>
	);
}
