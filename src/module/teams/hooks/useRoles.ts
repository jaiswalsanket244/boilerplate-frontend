import { apiClient } from "@/lib/api";
import type {
	ICreateRoleResponse,
	IDeleteRoleResponse,
	IGetPermissionsResponse,
	IGetRolesResponse,
	IUpdateOrgRoleResponse,
} from "@/module/teams/types";
import { normalizePermission } from "@/module/teams/utils/roles";
import { ROLES } from "@/types";
import type { ApiError } from "@/types/api-response";
import { useMutation, useQuery } from "@tanstack/react-query";

const ROLES_API_URL = "/admin/roles";

export type RoleMutationPayload = {
	name: string;
	description: string;
	permissions: string[];
	slug: string;
};

export const useRolesApi = () => {
	const usePermissionList = () =>
		useQuery({
			queryKey: ["role-permissions"],
			queryFn: async () => {
				const response = await apiClient.get<IGetPermissionsResponse>(`${ROLES_API_URL}/permissions`);
				return (response.data.data ?? [])
					.filter((permission) => permission.system === false)
					.map((permission) => normalizePermission(permission));
			},
			staleTime: 10 * 60 * 1000,
			gcTime: 30 * 60 * 1000,
		});

	const useRoleList = (canManageTeams: boolean) =>
		useQuery({
			queryKey: ["roles"],
			queryFn: async () => {
				if (!canManageTeams) return [];
				const response = await apiClient.get<IGetRolesResponse>(ROLES_API_URL);
				return response.data.data.filter((role) => role.slug !== ROLES.SUPER_ADMIN);
			},
			staleTime: 5 * 60 * 1000,
			gcTime: 15 * 60 * 1000,
			enabled: canManageTeams,
		});

	const useCreateRoleMutation = () =>
		useMutation({
			mutationFn: async (roleData: RoleMutationPayload) => {
				const response = await apiClient.post<ICreateRoleResponse>(ROLES_API_URL, roleData);
				return response.data.data;
			},
		});

	const useUpdateRoleMutation = () =>
		useMutation({
			mutationFn: async ({ slug, roleData }: { slug: string; roleData: RoleMutationPayload }) => {
				const response = await apiClient.put<IUpdateOrgRoleResponse>(`${ROLES_API_URL}/${slug}`, roleData);
				return response.data.data;
			},
		});

	const useDeleteRoleMutation = () =>
		useMutation({
			mutationFn: async (slug: string) => {
				const response = await apiClient.delete<IDeleteRoleResponse>(`${ROLES_API_URL}/${slug}`);
				return response.data;
			},
			onError: (error: ApiError) => {
				return error;
			},
		});

	return {
		usePermissionList,
		useRoleList,
		useCreateRoleMutation,
		useUpdateRoleMutation,
		useDeleteRoleMutation,
	};
};
