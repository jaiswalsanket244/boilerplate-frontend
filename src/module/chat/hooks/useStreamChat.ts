import useChatAPI from "@/module/chat/hooks/useChatAPI";
import { CHAT_TYPE } from "@/module/chat/types";
import { type MessageComposerState } from "stream-chat";
import {
	useChannelStateContext,
	useChatContext,
	useMessageComposer,
	useMessageContext,
	useMessageInputContext,
	useStateStore,
} from "stream-chat-react";

export const useStreamChat = () => {
	const { useUploadChatFile } = useChatAPI();

	const messageComposer = useMessageComposer();
	const { quotedMessage } = useStateStore(messageComposer.state, (state: MessageComposerState) => ({
		quotedMessage: state.quotedMessage,
	}));

	const setQuotedMessage = messageComposer.setQuotedMessage;

	const { client } = useChatContext();
	const { channel, pinnedMessages } = useChannelStateContext();

	const { clearEditingState, parent } = useMessageInputContext();
	const { message, handleOpenThread } = useMessageContext();

	const renameGroup = async (channelId: string, newName: string) => {
		const channelToRename = client?.channel("messaging", channelId);
		await channelToRename?.update({
			name: newName,
		});
	};
	const updateGroupInfo = async (
		channelId: string,
		data: {
			name?: string;
			avatar?: string;
		}
	) => {
		const channelToRename = client?.channel("messaging", channelId);
		await channelToRename?.update(data);
	};

	const deleteChannel = async (channelId: string) => {
		await client?.deleteChannels([channelId], {
			hard_delete: false,
		});
	};

	const clearChat = async (channelId: string) => {
		const channelToClear = client?.channel("messaging", channelId);
		await channelToClear?.hide(client.userID, true);
	};
	const uploadFile = async (file: File): Promise<string> => {
		const result = await useUploadChatFile.mutateAsync({
			file,
			params: {
				name: file.name,
				mimetype: file.type,
			},
		});

		return result as string;
	};
	const isGroup =
		channel.type === CHAT_TYPE.MESSAGING && channel?.state?.members && Object.keys(channel.state.members).length > 2;

	const members = Object.values(channel?.state?.members || {});

	const totalMembers = members.length;
	const onlineMembers = members.filter((m) => m.user?.online).length;

	const otherUser = members.find((m) => m.user?.id !== client.userID)?.user;

	return {
		client,
		channel,
		quotedMessage,
		renameGroup,
		setQuotedMessage,
		clearEditingState,
		parent,
		deleteChannel,
		clearChat,
		isGroup,
		members,
		totalMembers,
		onlineMembers,
		otherUser,
		message,
		handleOpenThread,
		pinnedMessages,
		messageComposer,
		uploadFile,
		updateGroupInfo,
	};
};
