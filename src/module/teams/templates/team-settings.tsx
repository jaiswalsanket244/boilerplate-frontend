"use client";

import { DataTabs } from "@/components/common/tabs/data-tabs";
import { routes } from "@/config/routes";
import { getUserCookies } from "@/lib/utils/cookies";
import { getQueryString } from "@/lib/utils/url-query-string";
import InviteUserDialog from "@/module/teams/components/invite-users/invite-user-dialog";
import UsersTable from "@/module/teams/components/users-table";
import { useTeamAPI } from "@/module/teams/hooks/useTeam";
import { useProfileAPI } from "@/module/profile/hooks/useProfile";
import { TEAMS_TAB_TYPES } from "@/module/teams/types";
import type { TeamMember } from "@/module/teams/types/index";
import { teamFilterableColumns, teamSortableColumns } from "@/module/teams/utils/constants";
import { getTeamsTabs, transformToTeamMember } from "@/module/teams/utils/handlers";
import { ROLES, STATUS } from "@/types";
import { FILTER_TYPE } from "@/types/filters";
import type { DataResponse, FilterState } from "@/types/tabs";
import type { ColumnFiltersState } from "@tanstack/react-table";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { PiPlusBold, PiShieldCheckBold } from "react-icons/pi";
import { canAccess } from "@/lib/utils/access-check";
import { useMenuStore } from "@/stores/menu-store";
import { PERMISSIONS } from "@/types/permission";

export default function TeamSettingsView() {
	const pathname = usePathname();
	const router = useRouter();
	const { userType, companyRef: companyRefCookie } = getUserCookies();
	const { useGetUserData } = useProfileAPI();
	const { data: currentUser } = useGetUserData();
	const permissions = useMenuStore((state) => state.permissions);

	const canManageTeams = canAccess(permissions, PERMISSIONS.TEAMS_MANAGE);

	const { useGetTeamMembers, useUsersCountQuery } = useTeamAPI();

	const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

	const [queryFilters, setQueryFilters] = useState<ColumnFiltersState>([]);
	const [queryParams, setQueryParams] = useState<FilterState & { tab: TEAMS_TAB_TYPES }>({
		tab: TEAMS_TAB_TYPES.USERS,
		search: "",
		sorting: [],
		filters: [],
		page: 1,
		pageSize: 10,
	});

	const companyRef = (
		userType === ROLES.SUPER_ADMIN && pathname.includes("super-admin") ? "" : companyRefCookie
	) as string;

	const { data: tabCounts } = useUsersCountQuery(companyRef);

	const filters = [
		...queryFilters,
		...(queryParams.tab === TEAMS_TAB_TYPES.ACTIVE_USERS ? [{ id: "status", value: STATUS.ACTIVE }] : []),
		...(queryParams.tab === TEAMS_TAB_TYPES.INACTIVE_USERS ? [{ id: "status", value: STATUS.INACTIVE }] : []),
	];

	const {
		data: teamMembers,
		isLoading,
		error,
	} = useGetTeamMembers(
		companyRef,
		queryParams.tab,
		getQueryString({
			filters,
			sorting: queryParams.sorting,
			searchTerm: queryParams.search,
			page: queryParams.page,
			pageSize: queryParams.pageSize,
			filterableColumns: [
				...teamFilterableColumns,
				...(queryParams.tab === TEAMS_TAB_TYPES.ACTIVE_USERS
					? [{ key: "status", type: FILTER_TYPE.RADIO, label: "Status" }]
					: []),
				...(queryParams.tab === TEAMS_TAB_TYPES.INACTIVE_USERS
					? [{ key: "status", type: FILTER_TYPE.RADIO, label: "Status" }]
					: []),
			],
		})
	);

	const pagination = teamMembers?.pagination;

	const transformedData: DataResponse<TeamMember> = {
		data: transformToTeamMember(teamMembers?.data || []),
		totalCount: pagination?.totalCount || 0,
		currentPage: pagination?.currentPage || 1,
		totalPages: pagination?.totalPages || 0,
	};

	const tabs = getTeamsTabs();

	const handleTabChange = (tab: TEAMS_TAB_TYPES, params: FilterState) => {
		setQueryParams({
			tab,
			...params,
		});
	};

	const applyFilters = (filters: ColumnFiltersState) => {
		setQueryFilters(filters);
	};

	const transformedTabCounts: Record<TEAMS_TAB_TYPES, number> = {
		[TEAMS_TAB_TYPES.USERS]: tabCounts?.total || 0,
		[TEAMS_TAB_TYPES.ACTIVE_USERS]: tabCounts?.active || 0,
		[TEAMS_TAB_TYPES.INVITED_USERS]: tabCounts?.invited || 0,
		[TEAMS_TAB_TYPES.INACTIVE_USERS]: tabCounts?.inActive || 0,
	};

	if (error) {
		return (
			<div className="flex items-center justify-center">
				An error occurred while loading the data. Please try again later.
			</div>
		);
	}

	return (
		<>
			<DataTabs
				tabs={tabs}
				defaultTab={TEAMS_TAB_TYPES.USERS}
				data={transformedData}
				isLoading={isLoading}
				onTabChange={handleTabChange}
				searchPlaceholder="Search here"
				sortableColumns={teamSortableColumns}
				filterableColumns={teamFilterableColumns}
				TableComponent={(props) => (
					<UsersTable {...props} canManageTeams={canManageTeams} currentUser={currentUser || null} />
				)}
				defaultPageSize={10}
				className="mt-10"
				tabCounts={transformedTabCounts}
				onApplyFilters={applyFilters}
				actionButtons={
					canManageTeams
						? [
								{
									label: "Manage roles",
									icon: <PiShieldCheckBold className="me-1.5 h-4 w-4" />,
									variant: "outline",
									className: "rounded-lg cursor-pointer",
									onClick: () => router.push(routes.roles.list),
								},
								{
									label: "Invite User(s)",
									icon: <PiPlusBold className="me-1.5 h-4 w-4" />,
									variant: "default",
									className: "rounded-lg",
									onClick: () => setIsInviteModalOpen(true),
								},
							]
						: []
				}
			/>
			<InviteUserDialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen} />
		</>
	);
}
