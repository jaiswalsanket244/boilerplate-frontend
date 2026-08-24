import { type Channel } from "stream-chat";
import { CHAT_TYPE } from "@/module/chat/types";

export const formatChannelData = (channel: Channel, userId: string) => {
	const latestMessageAt = channel.state.last_message_at ? new Date(channel.state.last_message_at) : null;

	const latestMessagePreview = channel.state.messages[channel.state.messages.length - 1]?.text ?? "No messages yet";

	const members = Object.values(channel?.state.members);

	const otherMember = members.find((member) => member?.user?.id !== userId);

	const isGroup = channel.type === CHAT_TYPE.MESSAGING && Object.keys(channel.state.members).length > 2;

	const name = isGroup ? channel.data?.name : otherMember?.user?.name;

	const avatarUrl = isGroup ? channel.data?.avatar : otherMember?.user?.image;

	return {
		members,
		isLastMessageRead: channel.state.read,
		isGroup,
		unreadCount: channel.countUnread(),
		name: name ?? "Unnamed Channel",
		avatarUrl,
		latestMessagePreview,
		latestMessageAt,
		otherMember,
	};
};

export const getInitials = (name: string | undefined) => {
	if (!name) return "";
	return name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
};

export const getAttachmentType = (mimeType: string): "image" | "video" | "audio" | "file" => {
	const type = mimeType.toLowerCase();

	// Image types
	if (type.includes("image/")) {
		return "image";
	}

	// Video types
	if (type.includes("video/")) {
		return "video";
	}

	// Audio types
	if (type.includes("audio/")) {
		return "audio";
	}

	// Everything else is treated as a file
	return "file";
};

// Helper function to create attachment object based on type and file info
export const createAttachment = (type: string, fileUrl: string, fileName: string, mimeType: string) => {
	const baseAttachment = {
		fallback: fileName,
		type,
	};

	switch (type) {
		case "image":
			return {
				...baseAttachment,
				image_url: fileUrl,
				thumb_url: fileUrl,
			};
		case "video":
			return {
				...baseAttachment,
				asset_url: fileUrl,
				thumb_url: fileUrl,
			};
		case "audio":
			return {
				...baseAttachment,
				asset_url: fileUrl,
				title: fileName,
				mime_type: mimeType,
			};
		case "file":
		default:
			return {
				...baseAttachment,
				asset_url: fileUrl,
				title: fileName,
				mime_type: mimeType,
			};
	}
};

export const getFileIcon = (type: string) => {
	switch (type) {
		case "image":
			return "🖼️";
		case "video":
			return "🎥";
		case "audio":
			return "🎵";
		case "file":
		default:
			return "📄";
	}
};

export const getAvatarColor = (name: string) => {
	const colors = [
		"bg-purple-500",
		"bg-blue-500",
		"bg-green",
		"bg-yellow",
		"bg-red",
		"bg-indigo-500",
		"bg-pink-500",
		"bg-teal-500",
	];
	return colors[name.length % colors.length];
};

export function formatFileSize(sizeInBytes: number): string {
	if (sizeInBytes < 1024) {
		// less than 1 KB
		return `${sizeInBytes} bytes`;
	} else if (sizeInBytes < 1024 * 1024) {
		// less than 1 MB
		return `${(sizeInBytes / 1024).toFixed(1)} KB`;
	} else {
		// 1 MB or larger
		return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
	}
}
