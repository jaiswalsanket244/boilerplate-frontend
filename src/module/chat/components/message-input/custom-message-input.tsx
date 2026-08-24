"use client";
import { getUserCookies } from "@/lib/utils/cookies";
import ChatInput from "@/module/chat/components/message-input/chat-input";
import useChatAPI from "@/module/chat/hooks/useChatAPI";
import { useChatDraft } from "@/module/chat/hooks/useChatDraft";
import { useStreamChat } from "@/module/chat/hooks/useStreamChat";
import type { IMessageDraft } from "@/module/chat/types";
import { createAttachment } from "@/module/chat/utils/helpers";
import { Info } from "lucide-react";
import { useState } from "react";
import type { Message } from "stream-chat";

const CustomMessageInput = () => {
	const { userRef: userId } = getUserCookies();

	const { useSendNotification } = useChatAPI();
	const { channel, uploadFile, members, isGroup } = useStreamChat();
	const [isFailedToSendMessage, setIsFailedToSendMessage] = useState(false);

	const draftKey = channel?.id ? `message-draft:${channel.id}` : "draft:global";

	const { draft, setDraft, clearDraft, hasLoaded } = useChatDraft<IMessageDraft>({
		key: draftKey,
		initialValue: { text: "", files: [] },
	});

	const { text: messageText, files: selectedFiles } = draft;

	const handleSendMessage = async () => {
		if (!messageText.trim() && selectedFiles.length === 0) return;
		try {
			const attachments = selectedFiles
				.filter((file) => file.uploadStatus === "uploaded")
				.map((file) => createAttachment(file.type, file.url, file.name, file.mimetype));

			const message: Message = {
				text: messageText,
				attachments,
			};

			await channel.sendMessage(message);

			if (channel.id) {
				const memberIds = (members?.map((member) => member.user_id).filter(Boolean) as string[]) ?? [];
				const user = members.find((member) => member?.user?.id === userId);

				const channelName = isGroup ? channel.data?.name : user?.user?.name;

				useSendNotification.mutate({
					channelId: channel.id,
					message: messageText || "Sent a file",
					memberIds,
					channelName: channelName ?? "Unnamed Channel",
					isGroup,
				});
			} else {
				console.error("Channel ID is undefined. Notification not sent.");
			}

			clearDraft();
		} catch (error) {
			setIsFailedToSendMessage(true);
		}
	};

	if (!hasLoaded) return null;

	return (
		<>
			{isFailedToSendMessage && (
				<p className="flex items-center justify-end gap-2 px-5 text-red-500">
					<Info className="size-4" /> <span>Failed to send message</span>
				</p>
			)}
			<ChatInput draft={draft} setDraft={setDraft} handleSendMessage={handleSendMessage} uploadFile={uploadFile} />
		</>
	);
};

export default CustomMessageInput;
