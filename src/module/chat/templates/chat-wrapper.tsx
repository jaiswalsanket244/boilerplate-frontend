"use client";
import { env } from "@/env.mjs";
import { cn } from "@/lib/utils";
import { getChatTokenFromCookie, getUserCookies } from "@/lib/utils/cookies";
import CollapseChatListButton from "@/module/chat/components/collapse-chat-list-button";
import CustomChannelHeader from "@/module/chat/components/custom-channel-header";
import CustomChannelList from "@/module/chat/components/custom-channel-list";
import CustomMessage from "@/module/chat/components/custom-message";
import CustomChannelSearch from "@/module/chat/components/custom-search";
import CustomMessageInput from "@/module/chat/components/message-input/custom-message-input";
import { ChatContextProvider, useAppChatContext } from "@/module/chat/contexts/chat-context";
import { useSetActiveChannelOnPageLoad } from "@/module/chat/hooks/useActiveChannel";
import useChatAPI from "@/module/chat/hooks/useChatAPI";
import "@/module/chat/styles/chat.css";
import { CHAT_PAGE_ACTIVE_VIEW } from "@/module/chat/types";
import { Loader, MessageCircle } from "lucide-react";
import { useTheme } from "next-themes";
import type { ChannelFilters, ChannelSort } from "stream-chat";
import {
	Channel,
	ChannelList,
	MessageList,
	Chat as StreamChat,
	useChatContext,
	useCreateChatClient,
	Window,
} from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";

function ChannelContainer() {
	const { channel } = useChatContext();
	const { showMessageList, isMobile, isChannelListCollapsed, activeView } = useAppChatContext();

	useSetActiveChannelOnPageLoad();

	if (!channel) {
		return (
			<div className="text-medium text-txt-secondary-800 flex h-full w-full items-center justify-center md:w-[70%]">
				<p className="max-w-sm text-center text-lg">Select a channel from the channel list or create a new chat.</p>
			</div>
		);
	}

	const renderEmptyState = () => (
		<div className="flex h-full flex-col items-center justify-center p-4 text-center md:p-8">
			<div className="mb-4 rounded-full bg-gray-100 p-4">
				<MessageCircle className="text-txt-tertiary h-8 w-8" />
			</div>
			<h3 className="text-txt-primary mb-2 text-lg font-semibold">No Messages yet</h3>
			<p className="text-txt-secondary-800 max-w-xs text-sm">Send a message to start a conversation.</p>
		</div>
	);

	const renderLoadingState = () => (
		<div className="flex h-full w-full items-center justify-center">
			<Loader className="mr-2 size-6 animate-spin" /> <span>Loading Chats....</span>
		</div>
	);

	return (
		<div
			className={cn(
				"hidden h-full w-full md:flex md:w-[70%]",
				isMobile && showMessageList ? "flex" : "",
				isChannelListCollapsed && !isMobile && "md:w-full"
			)}
		>
			{activeView === CHAT_PAGE_ACTIVE_VIEW.MESSAGING && channel && (
				<Channel channel={channel} EmptyStateIndicator={renderEmptyState} LoadingIndicator={renderLoadingState}>
					<Window>
						<CustomChannelHeader />
						<MessageList Message={CustomMessage} />

						<CustomMessageInput />
					</Window>
				</Channel>
			)}
		</div>
	);
}

const ChatWrapper = () => {
	const { useGetAuthTokenQuery } = useChatAPI();

	const { theme } = useTheme();

	const { data: token } = useGetAuthTokenQuery();
	const { isMobile, showMessageList, setIsChannelListCollapsed, isChannelListCollapsed } = useAppChatContext();

	const { userRef: userId } = getUserCookies();

	const streamClient = useCreateChatClient({
		apiKey: env.NEXT_PUBLIC_STREAM_API_KEY,
		tokenOrProvider: token || getChatTokenFromCookie() || "dummy-token",
		userData: { id: userId as string },
	});

	const filters: ChannelFilters = {
		type: "messaging",
		members: { $in: [String(userId)] },
		frozen: false,
	};

	const sort: ChannelSort = { last_message_at: -1 };

	if (!streamClient)
		return (
			<div className="flex h-full items-center justify-center text-lg font-medium">
				<Loader className="mr-2 size-6 animate-spin" /> Loading chats...
			</div>
		);

	const ChatListLoader = () => (
		<div className="flex h-full w-full items-center justify-center text-lg font-medium">Loading chats ...</div>
	);
	const EmptyChatListIndicator = () => (
		<div className="flex h-full w-full items-center justify-center text-lg font-medium">
			<p>No chats found</p>
		</div>
	);
	return (
		<>
			<div
				style={
					{
						"--chat-wrapper-height": `calc(100vh - var(--header-height) - 0.3rem)`,
					} as React.CSSProperties
				}
				className={cn("bg-background flex h-(--chat-wrapper-height) overflow-hidden border-t")}
			>
				<StreamChat
					client={streamClient}
					theme={
						theme?.includes("dark")
							? "str-chat__theme-dark str-chat__theme-custom bg-background"
							: "str-chat__theme-custom bg-background"
					}
				>
					<div className="relative flex h-full w-full flex-col md:flex-row">
						<div
							className={cn(
								"relative flex h-full w-full min-w-[340px] flex-col border-r md:w-[30%]",
								isMobile && showMessageList ? "hidden" : "flex",
								isChannelListCollapsed && !isMobile && "hidden min-w-0 md:w-0"
							)}
						>
							{!isChannelListCollapsed && !isMobile && (
								<CollapseChatListButton handleClick={() => setIsChannelListCollapsed(true)} alignment="right" />
							)}
							<CustomChannelSearch />
							<ChannelList
								showChannelSearch={false}
								filters={filters}
								sort={sort}
								Preview={CustomChannelList}
								LoadingIndicator={ChatListLoader}
								EmptyStateIndicator={EmptyChatListIndicator}
							/>
						</div>
						<ChannelContainer />
					</div>
				</StreamChat>
			</div>

			{!isMobile && isChannelListCollapsed && (
				<CollapseChatListButton handleClick={() => setIsChannelListCollapsed(false)} alignment="left" />
			)}
		</>
	);
};

const ChatPageComp = () => {
	return (
		<ChatContextProvider>
			<ChatWrapper />
		</ChatContextProvider>
	);
};

export default ChatPageComp;
