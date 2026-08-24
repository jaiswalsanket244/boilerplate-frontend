"use client";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

import { useStreamChat } from "@/module/chat/hooks/useStreamChat";
import { CHANNEL_ACTION_TYPES } from "@/module/chat/types";

import type { IChatConfirmationState } from "@/module/chat/types";
import { ArrowLeft, EllipsisVertical, InfoIcon, MessageCircle, Trash2 } from "lucide-react";

import ChatAvatar from "@/module/chat/components/chat-avatar";
import ChatActionConfirmationDialog from "@/module/chat/components/dialogs/chat-action-confirmation-dialog";
import DirectChatDialog from "@/module/chat/components/dialogs/direct-chat-dialog";
import ShowGroupMembersDialog from "@/module/chat/components/dialogs/show-group-members-dialog";
import { useAppChatContext } from "@/module/chat/contexts/chat-context";
import useChatAPI from "@/module/chat/hooks/useChatAPI";

const CustomChannelHeader = () => {
	const { channel, isGroup, members, otherUser } = useStreamChat();
	const { isMobile, setShowMessageList } = useAppChatContext();
	const { useAddMemberInGroup, useRemoveMemberFromGroup } = useChatAPI();

	const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
	const [isSelectMemberDialogOpen, setIsSelectMemberDialogOpen] = useState(false);
	const [isChatActionConfirmationModalOpen, setIsChatActionConfirmationModalOpen] = useState(false);

	const [chatConfirmation, setChatConfirmation] = useState<IChatConfirmationState>({
		text: "",
		actionType: CHANNEL_ACTION_TYPES.DELETE,
		channelId: "",
	});

	if (!channel) return <div className="text-muted-foreground p-4">No data found...</div>;

	const handleRemoveMember = (payload: { channelId: string; userId: string }) => {
		useRemoveMemberFromGroup.mutate(payload);
	};

	const handleAddMember = (payload: { channelId: string; userId: string; userName: string }) => {
		useAddMemberInGroup.mutate(payload);
	};

	const displayTitle = isGroup ? (channel.data?.name ?? "Unnamed Channel") : (otherUser?.name ?? "Unnamed Channel");
	const avatarUrl = isGroup ? channel.data?.avatar : otherUser?.image;

	return (
		<div className="bg-background/95 flex h-20 w-full items-center justify-between border-b px-4 py-2 shadow-xs">
			<div className="flex flex-1 items-center gap-2">
				{isMobile && (
					<Button variant="ghost" size="icon" className="size-8 p-0" onClick={() => setShowMessageList(false)}>
						<ArrowLeft className="size-4" />
					</Button>
				)}

				<div
					className="hover:bg-accent/50 flex w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-1 transition-colors"
					onClick={() => isGroup && setIsGroupModalOpen(true)}
				>
					<ChatAvatar avatarUrl={avatarUrl} className="size-10" />

					<div className="flex w-full flex-col gap-1 sm:gap-2">
						<h3 className="line-clamp-1 w-[80%] truncate text-base leading-none font-semibold sm:w-full">
							{displayTitle}
						</h3>

						{isGroup ? (
							<p className="text-txt-secondary/90 line-clamp-1 max-w-48 truncate text-sm sm:max-w-[80%]">
								{members.map((member) => member.user?.name).join(", ")}
							</p>
						) : (
							<div className="flex items-center gap-2">
								<div className={`h-2 w-2 rounded-full ${otherUser?.online ? "bg-green" : "bg-gray-600"}`}></div>
								<span className="text-txt-primary/90 text-sm">{otherUser?.online ? "Online" : "Offline"}</span>
							</div>
						)}
					</div>
				</div>
			</div>

			<DropdownMenu>
				<DropdownMenuTrigger asChild data-testid="more-options-button">
					<Button variant="ghost" size="icon" className="h-8 w-8">
						<EllipsisVertical className="size-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-48">
					<DropdownMenuItem
						onClick={() => {
							setChatConfirmation({
								text: "Are you sure you want to clear this chat?",
								actionType: CHANNEL_ACTION_TYPES.CLEAR,
								channelId: String(channel?.id),
							});
							setIsChatActionConfirmationModalOpen(true);
						}}
						data-testid="clear-chat-button"
					>
						<MessageCircle className="mr-2 h-4 w-4" />
						Clear Chat
					</DropdownMenuItem>

					<DropdownMenuItem
						data-testid="delete-chat-button"
						className="text-destructive focus:text-destructive"
						onClick={() => {
							setChatConfirmation({
								text: "Are you sure you want to delete this chat?",
								actionType: CHANNEL_ACTION_TYPES.DELETE,
								channelId: String(channel?.cid),
							});
							setIsChatActionConfirmationModalOpen(true);
						}}
					>
						<Trash2 className="mr-2 h-4 w-4" />
						Delete {isGroup ? "Group" : "Chat"}
					</DropdownMenuItem>
					{isGroup && (
						<DropdownMenuItem
							data-testid="show-details-button"
							onClick={() => {
								setIsGroupModalOpen(true);
							}}
						>
							<InfoIcon className="mr-2 h-4 w-4" />
							Show Details
						</DropdownMenuItem>
					)}
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Group Members Modal */}
			<ShowGroupMembersDialog
				isOpen={isGroupModalOpen}
				setIsOpen={setIsGroupModalOpen}
				setIsSelectMemberDialogOpen={setIsSelectMemberDialogOpen}
				handleRemoveMember={handleRemoveMember}
			/>

			<DirectChatDialog
				isOpen={isSelectMemberDialogOpen}
				setIsOpen={setIsSelectMemberDialogOpen}
				onChange={({ userId, userName }) => handleAddMember({ channelId: String(channel?.id), userId, userName })}
			/>
			<ChatActionConfirmationDialog
				actionType={chatConfirmation.actionType}
				text={chatConfirmation.text}
				isOpen={isChatActionConfirmationModalOpen}
				setIsOpen={setIsChatActionConfirmationModalOpen}
			/>
		</div>
	);
};

export default CustomChannelHeader;
