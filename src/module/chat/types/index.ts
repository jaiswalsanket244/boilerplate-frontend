import { type LocalMessage } from "stream-chat";

export interface GetChatTokenResponse {
	data: string;
	message: string;
	success: boolean;
	errors: object;
}

/* ------------ Props ------------ */

export interface IDirectChatDialogProps {
	isOpen: boolean;
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
	onChange: (user: { userId: string; userName: string }) => void;
	isPending?: boolean;
	isError?: boolean;
	isSuccess?: boolean;
}

export interface ICreateGroupChatDialogProps {
	isOpen: boolean;
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface IChatActionConfirmationDialogProps {
	text: string;
	actionType: CHANNEL_ACTION_TYPES;
	isOpen: boolean;
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface IShowGroupMembersDialogProps {
	isOpen: boolean;
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
	setIsSelectMemberDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
	handleRemoveMember: (payload: { channelId: string; userId: string }) => void;
}

export interface IEditMessageDialogProps {
	editing: boolean;
	message: LocalMessage;
	clearEditingState: (event?: React.BaseSyntheticEvent) => void;
}

export interface IUserSearchDialogPaginationProps {
	page: number;
	totalPages: number;
	handlePageChange: (page: number) => void;
	pageSize: number;
}

export interface IChatInputProps {
	draft: IMessageDraft;
	setDraft: React.Dispatch<React.SetStateAction<IMessageDraft>>;
	handleSendMessage: () => Promise<void>;
	uploadFile: (file: File) => Promise<string>;
	maxFileSize?: number;
	multiple?: boolean;
	acceptedFileTypes?: string;
	disabled?: boolean;
}

export interface IUploadGroupChatAvatarProps {
	avatar?: string | null;
	onAvatarChange: (avatarUrl: string | null) => void;
	size?: "sm" | "md" | "lg";
	className?: string;
	disabled?: boolean;
}

export interface IChatUsersListProps {
	items: IChatUser[];
	handleUserSelect: (user: IChatUser) => void;
	selectedUsers: IGroupChatMember[];
	isLoading: boolean;
}

export interface ISelectedFilesProps {
	selectedFiles: ISelectedFile[];
	removeSelectedFile: (fileId: string) => Promise<void>;
	uploadingFiles: Set<string>;
}

export interface IGetChatUserFilter {
	searchQuery: string;
	page: number;
	limit: number;
}

export interface IChatUser {
	_id: string;
	name: {
		first: string;
		last: string;
	};
	status: string;
	userType: string;
}

export interface IGetChatUserResponse {
	message: string;
	data: {
		items: IChatUser[];
		total: number;
		page: number;
		pageSize: number;
	};
}

export interface ICreateChatResponse {
	message: string;
	data: {
		channelId: string;
		token?: string;
	};
}

export interface IUploadFileResponse {
	message: string;
	data: string;
	success: boolean;
	errors: object;
}

export interface UploadFilePayload {
	params: { name: string; mimetype: string };
	file: File;
}

export interface IGroupChatMember {
	userId: string;
	userName: string;
}

export interface ISelectedFile {
	id: string;
	url: string;
	name: string;
	mimetype: string;
	type: "image" | "video" | "audio" | "file";
	size: number;
	uploadStatus?: "failed" | "uploaded" | "oversized";
}

export interface IChatConfirmationState {
	text: string;
	actionType: CHANNEL_ACTION_TYPES;
	channelId: string;
}

export interface ICreateGroupData {
	groupName: string;
	selectedMembers: IGroupChatMember[];
	avatar?: string | null;
}

export interface UseDraftOptions<T> {
	key: string;
	initialValue: T;
	maxAge?: number; // in seconds
	onLoaded?: (draft: T) => void;
}

export interface IMessageDraft {
	text: string;
	files: ISelectedFile[];
}

export enum CHAT_TYPE {
	MESSAGING = "messaging",
}

export enum CHANNEL_ACTION_TYPES {
	DELETE = "delete",
	CLEAR = "clear",
}

export enum CHAT_MESSAGE_STATUS {
	DELETED = "deleted",
	EPHEMERAL = "ephemeral",
	ERROR = "error",
	REGULAR = "regular",
	REPLY = "reply",
	SYSTEM = "system",
}

export enum CHAT_PAGE_ACTIVE_VIEW {
	MESSAGING = "messaging",
}

export enum CHAT_MODULE_SEARCH_PARAMS {
	CHANNEL_ID = "channel_id",
}
