import { FeatureUsageChart } from "@/components/dashboard/FeatureUsageChart";
import { ReturningUsersChart } from "@/components/dashboard/PieChart";
import { SessionFrequencyChart } from "@/components/dashboard/SessionFrequencyChart";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { UserGrowthChart } from "@/components/dashboard/UserGrowthChart";
import { useAdminDashboardAPI } from "@/module/admin-dashboard/hooks/useAdminDashboard";

export default function AdminDashboard() {
	const { useGetDashboardMetricsQuery } = useAdminDashboardAPI();
	const { data } = useGetDashboardMetricsQuery();

	const formatNumber = (num?: number): string => {
		return typeof num === "number" ? num.toLocaleString() : "-";
	};

	const isPositive = (growth?: string): boolean => {
		const parsed = parseFloat(growth || "0");
		return parsed > 0;
	};

	return (
		<div className="space-y-2">
			{/* Header */}
			<div className="mb-4 flex items-center justify-between">
				<h2 className="text-lg font-semibold text-foreground">User Growth and Activity</h2>
			</div>

			{/* Stats Cards */}
			<div className="mb-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
				<StatsCard
					title="Total Registered Users"
					value={formatNumber(data?.all?.totalUsers)}
					change={`${data?.all?.percentageGrowth || ""}`}
					isPositive={isPositive(data?.all?.percentageGrowth)}
				/>
				<StatsCard
					title="Active Users"
					value={formatNumber(data?.active?.totalUsers)}
					change={`${data?.active?.percentageGrowth || ""}`}
					isPositive={isPositive(data?.active?.percentageGrowth)}
				/>
				<StatsCard
					title="New Sign Ups"
					value={formatNumber(data?.new?.totalUsers)}
					change={`${data?.new?.percentageGrowth || ""}`}
					isPositive={isPositive(data?.new?.percentageGrowth)}
				/>
				<StatsCard
					title="Churned Users"
					value={formatNumber(data?.churned?.totalUsers)}
					change={`${data?.churned?.percentageGrowth || ""}`}
					isPositive={isPositive(data?.churned?.percentageGrowth)}
				/>
			</div>

			{/* Charts Section */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-5">
				<div className="md:col-span-3">
					<UserGrowthChart />
				</div>
				<div className="md:col-span-2">
					<FeatureUsageChart />
				</div>
			</div>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-11">
				<div className="md:col-span-4">
					<ReturningUsersChart />
				</div>
				<div className="md:col-span-7">
					<SessionFrequencyChart />
				</div>
			</div>
		</div>
	);
}
