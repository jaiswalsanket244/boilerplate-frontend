import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api";
import type {
	IGetSessionsResponse,
	IRevokeOtherSessionsResponse,
	IRevokeSessionResponse,
	ISession,
} from "@/module/profile/types";

export const SESSIONS_QUERY_KEY = ["sessions"] as const;

export const useSessionsAPI = () => {
	const queryClient = useQueryClient();

	const invalidateSessions = () => queryClient.invalidateQueries({ queryKey: SESSIONS_QUERY_KEY });

	const useGetSessions = () =>
		useQuery({
			queryKey: SESSIONS_QUERY_KEY,
			queryFn: async () => {
				const response = await apiClient.get<IGetSessionsResponse>("/auth/sessions");
				const sessions = response.data.data.sessions ?? [];
				// Legacy rows self-heal server-side and aren't individually revocable; hide the un-actionable ones.
				return sessions.filter((session): session is ISession => Boolean(session.id));
			},
			refetchOnWindowFocus: false,
		});

	const useRevokeSession = () =>
		useMutation({
			mutationFn: async (id: string) => {
				const response = await apiClient.delete<IRevokeSessionResponse>(`/auth/sessions/${id}`);
				return response.data.data;
			},
			onSuccess: invalidateSessions,
		});

	const useRevokeOtherSessions = () =>
		useMutation({
			mutationFn: async () => {
				const response = await apiClient.post<IRevokeOtherSessionsResponse>("/auth/sessions/revoke-others");
				return response.data.data;
			},
			onSuccess: invalidateSessions,
		});

	return { useGetSessions, useRevokeSession, useRevokeOtherSessions };
};
