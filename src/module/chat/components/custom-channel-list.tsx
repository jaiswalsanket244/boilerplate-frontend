"use client";
import { useMemo } from "react";
import { useChatContext, useTranslationContext, type ChannelPreviewProps } from "stream-chat-react";

import { cn } from "@/lib/utils";
import ChatAvatar from "@/module/chat/components/chat-avatar";
import { useAppChatContext } from "@/module/chat/contexts/chat-context";
import { formatChannelData } from "@/module/chat/utils/helpers";
import { CHAT_PAGE_ACTIVE_VIEW } from "@/module/chat/types";
import { useActiveChannel } from "@/module/chat/hooks/useActiveChannel";

const CustomChannelList = (props: ChannelPreviewProps) => {
	const { client } = useChatContext();
	const { setShowMessageList, setActiveView, activeView } = useAppChatContext();
	const { userLanguage } = useTranslationContext();

	const { setActiveChannelSearchParam } = useActiveChannel();

	const { channel, activeChannel, setActiveChannel } = props;
	const isSelected = channel.id === activeChannel?.id && activeView === CHAT_PAGE_ACTIVE_VIEW.MESSAGING;

	const { unreadCount, avatarUrl, name, latestMessagePreview, isGroup, otherMember, latestMessageAt } =
		formatChannelData(channel, client?.userID as string);

	const timestamp = useMemo(() => {
		if (!latestMessageAt || !(latestMessageAt instanceof Date)) return "";
		const formatter = new Intl.DateTimeFormat(userLanguage, { timeStyle: "short" });
		return formatter.format(latestMessageAt);
	}, [userLanguage]);

	const handleClick = () => {
		setActiveChannel?.(channel);
		setShowMessageList(true);
		setActiveView(CHAT_PAGE_ACTIVE_VIEW.MESSAGING);
		if (channel.id) {
			setActiveChannelSearchParam(channel.id);
		}
	};

	return (
		<div
			data-testid={`channel-${name.toLowerCase().split(" ").join("-")}`}
			onClick={handleClick}
			className={cn(
				"bg-background relative flex w-full cursor-pointer items-center p-4 transition-all duration-200 ease-in-out",
				isSelected ? "border-l-chat-purple bg-accent text-accent-foreground border-l-4" : ""
			)}
		>
			{/* Avatar Section */}
			<div className="relative mr-3 shrink-0">
				<ChatAvatar avatarUrl={avatarUrl} className="size-12" />

				{!isGroup && otherMember?.user?.online && (
					<div className="bg-green absolute right-0.5 bottom-0.5 size-3 rounded-full border-2 border-white"></div>
				)}
			</div>

			{/* Content Section */}
			<div
				className={cn(
					"grid w-full min-w-0 flex-1 grid-cols-4",
					isSelected ? "text-accent-foreground" : "text-txt-primary-800"
				)}
			>
				<div className="col-span-3 flex flex-col justify-between gap-2">
					<h3 className={cn("line-clamp-1 truncate text-sm font-medium", isSelected ? "text-accent-foreground" : "")}>
						{name}
					</h3>

					<p className={"mt-auto line-clamp-1 truncate text-sm"}>{latestMessagePreview}</p>
				</div>

				<div className="col-span-1 ml-2 flex shrink-0 flex-col items-center justify-between gap-2 space-x-2">
					{unreadCount > 0 && (
						<div className="bg-blue flex size-5 items-center justify-center rounded-full text-center text-[10px] font-medium text-white">
							{unreadCount > 99 ? "99+" : unreadCount}
						</div>
					)}
					{timestamp && <span className="mt-auto line-clamp-1 truncate text-xs">{timestamp}</span>}
				</div>
			</div>
		</div>
	);
};

export default CustomChannelList;
