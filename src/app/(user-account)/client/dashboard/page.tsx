"use client";

import { canAccess } from "@/lib/utils/access-check";
import AdminDashboard from "@/module/admin-dashboard/templates/adminDashboard";
import { useProfileAPI } from "@/module/profile/hooks/useProfile";
import { PERMISSIONS } from "@/types/permission";

const DashboardFooterNote = () => <p className="mt-auto pt-4 text-sm text-foreground">Single comment test</p>;

export default function DashboardPage() {
	const { useGetUserData } = useProfileAPI();
	const { data: user } = useGetUserData();
	const permissions = user?.permissions ?? [];

	// Dynamically check if the user has admin-level dashboard privileges
	const hasAdminAccess = canAccess(permissions, PERMISSIONS.DASHBOARD_MANAGE, true);

	if (hasAdminAccess) {
		return (
			<>
				<AdminDashboard />
				<DashboardFooterNote />
			</>
		);
	}

	const hasUserAccess = canAccess(permissions, PERMISSIONS.DASHBOARD_VIEW, true);

	if (hasUserAccess) {
		return (
			<>
				<h1>This is User dashboard</h1>
				<DashboardFooterNote />
			</>
		);
	}

	return (
		<>
			<h1>No Access</h1>
			<DashboardFooterNote />
		</>
	);
}
