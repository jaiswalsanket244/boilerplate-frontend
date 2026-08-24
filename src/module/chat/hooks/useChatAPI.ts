import { apiClient } from "@/lib/api";
import { setCookies } from "@/lib/utils/cookies";
import type {
	GetChatTokenResponse,
	ICreateChatResponse,
	ICreateGroupData,
	IGetChatUserFilter,
	IGetChatUserResponse,
	IUploadFileResponse,
	UploadFilePayload,
} from "@/module/chat/types";
import { COOKIES } from "@/types";
import type { ApiError } from "@/types/api-response";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";

const API_USER_URL = "/chat";

const useChatAPI = () => {
	const useGetAuthTokenQuery = () => {
		return useQuery({
			queryKey: ["chat-auth-token"],
			queryFn: async () => {
				const res = await apiClient.post<GetChatTokenResponse>(`${API_USER_URL}/auth`);

				setCookies({ [COOKIES.CHAT_TOKEN]: res.data.data });
				return res.data.data;
			},
			staleTime: 10 * 60 * 1000, // 10 minutes
		});
	};

	const useGetChatUsers = (filter: IGetChatUserFilter) => {
		return useQuery({
			queryKey: ["chat-users", filter.searchQuery, filter.page, filter.limit],

			queryFn: async () => {
				const res = await apiClient.get<IGetChatUserResponse>(`${API_USER_URL}/users`, { params: filter });
				return res.data.data;
			},
		});
	};

	const useCreateDirectChat = useMutation({
		mutationFn: async (payload: { recipientUserId: string; recipientUserName: string }) => {
			const response = await apiClient.post<ICreateChatResponse>(`${API_USER_URL}/direct`, payload);
			return response.data;
		},
	});

	const useSendNotification = useMutation({
		mutationFn: async (payload: {
			channelId: string;
			message: string;
			memberIds: string[];
			channelName: string;
			isGroup: boolean;
		}) => {
			const response = await apiClient.post<IGetChatUserResponse>(`${API_USER_URL}/notify`, payload);
			return response.data;
		},
	});

	const useUploadChatFile = useMutation({
		mutationFn: async (payload: UploadFilePayload) => {
			const response = await apiClient.post<IUploadFileResponse>(
				`${API_USER_URL}/upload`,
				{},
				{
					params: payload.params,
				}
			);
			const presignedUrl = response.data.data;

			await axios.put(presignedUrl, payload.file, {
				headers: { "Content-Type": encodeURI(payload.params.mimetype) },
			});

			return presignedUrl.split("?")[0];
		},
	});

	const useCreateGroupChat = useMutation({
		mutationFn: async (payload: ICreateGroupData) => {
			const data = {
				groupName: payload.groupName,
				avatar: payload.avatar,
				members: payload.selectedMembers,
			};
			const response = await apiClient.post<ICreateChatResponse>(`${API_USER_URL}/group`, data);
			return response.data;
		},
		onError: (err: ApiError) => {
			return err;
		},
	});
	const useRemoveChatFile = useMutation({
		mutationFn: async (payload: { url: string }) => {
			await apiClient.delete(`${API_USER_URL}/file`, { params: { url: payload.url } });
		},
	});

	const useAddMemberInGroup = useMutation({
		mutationFn: async (payload: { channelId: string; userId: string; userName: string }) => {
			const response = await apiClient.post<GetChatTokenResponse>(`${API_USER_URL}/group/add-member`, payload);
			return response.data;
		},

		onError: (err: ApiError) => {
			return err;
		},
	});
	const useRemoveMemberFromGroup = useMutation({
		mutationFn: async (payload: { channelId: string; userId: string }) => {
			const response = await apiClient.post<GetChatTokenResponse>(`${API_USER_URL}/group/remove-member`, payload);
			return response.data;
		},

		onError: (err: ApiError) => {
			return err;
		},
	});
	const useChangeMemberRole = useMutation({
		mutationFn: async (payload: { channelId: string; userId: string; role: string }) => {
			const response = await apiClient.put<GetChatTokenResponse>(`${API_USER_URL}/group/change-role`, payload);
			return response.data;
		},

		onError: (err: ApiError) => {
			return err;
		},
	});

	return {
		useGetAuthTokenQuery,
		useGetChatUsers,
		useCreateDirectChat,
		useSendNotification,
		useCreateGroupChat,
		useUploadChatFile,
		useRemoveChatFile,
		useAddMemberInGroup,
		useRemoveMemberFromGroup,
		useChangeMemberRole,
	};
};

export default useChatAPI;
