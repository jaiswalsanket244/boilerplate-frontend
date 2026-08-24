import { apiClient } from "@/lib/api";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import {
	type AuditExportFormat,
	type AuditLogExportData,
	type AuditLogExportResponse,
	type AuditLogSearchQuery,
	type AuditLogsResponse,
	type ChainVerifyResponse,
	type IChainVerifyReport,
} from "@/module/audit-logs/types";
import { ROLES } from "@/types";

const AUDIT_LOGS_ENDPOINTS = {
	[ROLES.SUPER_ADMIN]: "/super-admin/audit-logs",
	admin: "/admin/audit-logs",
} as const;

const resolveEndpoint = (role?: string) =>
	role === ROLES.SUPER_ADMIN ? AUDIT_LOGS_ENDPOINTS[ROLES.SUPER_ADMIN] : AUDIT_LOGS_ENDPOINTS.admin;

const sanitizeQuery = (query: AuditLogSearchQuery, role?: string): AuditLogSearchQuery => {
	const sanitized = { ...query };
	if (role !== ROLES.SUPER_ADMIN) {
		delete sanitized.search;
		delete sanitized.companyRef;
	}
	return sanitized;
};

export const useAuditLogsAPI = () => {
	const useGetAllAuditLogsQuery = (query: AuditLogSearchQuery, role?: string) => {
		const endpoint = resolveEndpoint(role);
		const sanitizedQuery = sanitizeQuery(query, role);

		return useQuery({
			enabled: role !== undefined,
			placeholderData: keepPreviousData,
			queryKey: [
				"audit-logs",
				role ?? "admin",
				sanitizedQuery?.page,
				sanitizedQuery?.pageSize,
				sanitizedQuery?.category,
				sanitizedQuery?.action,
				sanitizedQuery?.actorEmail,
				sanitizedQuery?.actorId,
				sanitizedQuery?.status,
				sanitizedQuery?.targetType,
				sanitizedQuery?.targetId,
				sanitizedQuery?.companyRef,
				sanitizedQuery?.from,
				sanitizedQuery?.to,
				sanitizedQuery?.search,
				sanitizedQuery?.sortBy,
				sanitizedQuery?.sortDir,
				sanitizedQuery?.hideInternalChanges,
			],
			queryFn: async () => {
				const res = await apiClient.get<AuditLogsResponse>(endpoint, { params: sanitizedQuery });
				return res.data.data;
			},
		});
	};

	const useExportAuditLogsMutation = () => {
		return useMutation<
			AuditLogExportData,
			unknown,
			{ query: AuditLogSearchQuery; format: AuditExportFormat; role?: string }
		>({
			mutationFn: async ({ query, format, role }) => {
				const endpoint = resolveEndpoint(role);
				const filters = sanitizeQuery(query, role);
				delete filters.page;
				delete filters.pageSize;
				delete filters.hideInternalChanges;
				const res = await apiClient.get<AuditLogExportResponse>(`${endpoint}/export`, {
					params: { ...filters, format },
				});
				return res.data.data;
			},
		});
	};

	const useVerifyChainMutation = () => {
		return useMutation<IChainVerifyReport, unknown, { companyRef: string }>({
			mutationFn: async ({ companyRef }) => {
				const res = await apiClient.get<ChainVerifyResponse>(
					`${AUDIT_LOGS_ENDPOINTS[ROLES.SUPER_ADMIN]}/chain/verify`,
					{ params: { companyRef } }
				);
				return res.data.data;
			},
		});
	};

	return {
		useGetAllAuditLogsQuery,
		useExportAuditLogsMutation,
		useVerifyChainMutation,
	};
};
