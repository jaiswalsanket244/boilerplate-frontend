import { getUserCookies } from "@/lib/utils/cookies";
import { useTeamAPI } from "@/module/teams/hooks/useTeam";
import { type TeamMember, TEAMS_TAB_TYPES, type IInvitedUser } from "@/module/teams/types";
import type { IUser } from "@/types";
import { ROLES } from "@/types";
import type { TabConfig } from "@/types/tabs";
import { usePathname } from "next/navigation";

export const useHandlers = () => {
	const pathname = usePathname();

	const {
		useDeleteUser,
		useResendInvitationMutation,
		useUpdateRoleMutation,
		useUpdateStatusMutation,
		useCancelInviteMutation,
	} = useTeamAPI();

	const { userType, companyRef: companyRefCookie } = getUserCookies();

	const companyRef =
		userType === ROLES.SUPER_ADMIN && pathname.split("/").includes("super-admin") ? "" : companyRefCookie;

	const handleDelete = (userId: string, status: string) =>
		useDeleteUser.mutateAsync({ userId, Status: status, companyRef });

	const handleResendInvitation = (email: string) => useResendInvitationMutation.mutateAsync({ email, companyRef });

	const handleDeleteInvitation = (userId: string) => useCancelInviteMutation.mutateAsync({ userId });

	const handleChangeRole = (userId: string, role: string) =>
		useUpdateRoleMutation.mutateAsync({ userId, role, companyId: String(companyRef) });

	const handleUpdateStatus = (userId: string, status: string) =>
		useUpdateStatusMutation.mutateAsync({ userId, status, companyRef });

	return {
		handleDelete,
		handleResendInvitation,
		handleDeleteInvitation,
		handleChangeRole,
		handleUpdateStatus,
	};
};

export const transformToTeamMember = (data: (IInvitedUser | IUser)[]): TeamMember[] => {
	return data.map((item, index) => ({
		_id: item._id,
		serialNumber: index + 1,
		email: "email" in item ? item.email : item.invitedEmail,
		invitedEmail: "invitedEmail" in item ? item.invitedEmail : "",
		name: item.name,
		images: "images" in item && Array.isArray(item.images) ? item.images[0] : undefined,
		role: "role" in item && item.role ? item.role : "roles" in item ? item.roles : "",
		createdAt:
			"createdAt" in item && item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString(),
		status: item.status,
	}));
};

export const getTeamsTabs = () => {
	const tabs: TabConfig<TEAMS_TAB_TYPES>[] = [
		{
			key: TEAMS_TAB_TYPES.USERS,
			label: "All users",
		},
		{
			key: TEAMS_TAB_TYPES.ACTIVE_USERS,
			label: "Active",
		},
		{
			key: TEAMS_TAB_TYPES.INACTIVE_USERS,
			label: "In-active ",
		},
		{
			key: TEAMS_TAB_TYPES.INVITED_USERS,
			label: "Invited",
		},
	];
	return tabs;
};
