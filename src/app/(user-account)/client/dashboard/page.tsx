"use client";

import AdminDashboard from "@/module/admin-dashboard/templates/adminDashboard";
import { canAccess } from "@/lib/utils/access-check";
import { PERMISSIONS } from "@/types/permission";
import { useProfileAPI } from "@/module/profile/hooks/useProfile";

export default function DashboardPage() {
	const { useGetUserData } = useProfileAPI();
	const { data: user } = useGetUserData();
	const permissions = user?.permissions ?? [];

	// Dynamically check if the user has admin-level dashboard privileges
	const hasAdminAccess = canAccess(permissions, PERMISSIONS.DASHBOARD_MANAGE, true);

	if (hasAdminAccess) {
		return <AdminDashboard />;
	}

	const hasUserAccess = canAccess(permissions, PERMISSIONS.DASHBOARD_VIEW, true);

	if (hasUserAccess) {
		return <h1>This is User dashboard</h1>;
	}

	return <h1>No Access</h1>;
}
