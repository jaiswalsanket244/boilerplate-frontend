export type GetDashboardMetricsType = {
	success: boolean;
	message: string;
	data: DashboardMetricsType;
	errors: object;
};

export type Metrics = {
	totalUsers: number;
	percentageGrowth: string;
	newSignUpsThisMonth?: number; // optional, since only "all" has this
};

export type DashboardMetricsType = {
	all: Metrics;
	active: Metrics;
	churned: Metrics;
	new: Metrics;
};

export interface IUserAnalyticsResponse {
	success: boolean;
	message: string;
	data: { key: string; thisYear: number; lastYear: number }[];
	errors: object;
}
