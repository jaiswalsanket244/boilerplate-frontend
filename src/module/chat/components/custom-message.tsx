"use client";
import { Attachment, MessageText, useMessageContext } from "stream-chat-react";

import EditMessageDialog from "@/module/chat/components/dialogs/edit-message-dialog";
import { useStreamChat } from "@/module/chat/hooks/useStreamChat";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ChatAvatar from "@/module/chat/components/chat-avatar";
import { CHAT_MESSAGE_STATUS } from "@/module/chat/types";
import { Trash } from "lucide-react";
import Image from "next/image";
import { BsFillPinAngleFill } from "react-icons/bs";

const CustomMessage = () => {
	const { message, client, channel, isGroup } = useStreamChat();

	const { message: editedMessage, editing, setEditingState, clearEditingState, handleDelete } = useMessageContext();

	const isOwnMessage = message.user?.id === client.user?.id;

	const copyMessageText = async () => {
		if (message.text) {
			await navigator.clipboard.writeText(message.text);
		}
	};

	return (
		<div className={cn("flex items-center", isOwnMessage ? "justify-end" : "justify-start")}>
			<div
				className={cn(
					"mb-4 flex w-[85%] max-w-[85%] items-start gap-4 overflow-hidden sm:w-[70%] sm:max-w-[70%]",
					isOwnMessage ? "flex-row-reverse justify-start" : "justify-start"
				)}
			>
				{!isOwnMessage && isGroup && (
					<ChatAvatar className="size-11" avatarUrl={message?.user?.image ?? ""} size={20} />
				)}

				<div
					className={cn(
						"flex flex-col",
						isOwnMessage ? "max-w-full justify-end" : "max-w-[calc(100%-3.8rem)] justify-start"
					)}
				>
					<div
						className={cn(
							"relative flex min-w-full flex-col items-end gap-2 rounded-md",
							isOwnMessage && "bg-muted p-3"
						)}
					>
						{message.pinned && (
							<span className="text-chat-pin flex items-center gap-2 text-xs">
								<BsFillPinAngleFill /> Pinned
							</span>
						)}

						{message?.type === CHAT_MESSAGE_STATUS.DELETED ? (
							<div className="w-full">
								{!isOwnMessage && isGroup && (
									<h6 className="text-txt-primary-800 w-full text-left text-base font-medium">{message.user?.name}</h6>
								)}
								<p className="text-txt-secondary-900 flex h-full items-center text-sm italic">
									This message was deleted
								</p>
							</div>
						) : (
							<div className="w-full">
								{!isOwnMessage && isGroup && (
									<h6 className="text-txt-primary-800 w-full text-left text-base font-medium">{message.user?.name}</h6>
								)}
								<div className="bg-muted w-full max-w-md rounded-md">
									{message.attachments && <Attachment attachments={message.attachments} />}
								</div>
								<MessageText customInnerClass="text-base text-txt-primary-900 whitespace-pre-line break-all" />
							</div>
						)}
					</div>

					{isOwnMessage && message?.type !== CHAT_MESSAGE_STATUS.DELETED && (
						<div className="mt-2 flex items-center justify-end gap-1">
							<Button
								variant={"ghost"}
								className="size-8 rounded-full p-0"
								onClick={(e) => void setEditingState(e)}
								data-testid="edit-message-button"
							>
								<Image src={"/assets/svg/edit_message.svg"} width={15} height={15} alt={"edit"} />
							</Button>

							<Button
								variant={"ghost"}
								data-testid="copy-message-button"
								className="size-8 rounded-full p-0"
								onClick={() => void copyMessageText()}
							>
								<Image src={"/assets/svg/copy_message.svg"} width={17} height={17} alt={"copy"} />
							</Button>
							<Button
								variant={"ghost"}
								className="text-txt-secondary-800 hover:bg-destructive size-8 rounded-full p-0 transition-colors duration-200 hover:text-white"
								onClick={(e) => void handleDelete(e)}
								data-testid="delete-message-button"
							>
								<Trash className="size-4" />
							</Button>
						</div>
					)}
				</div>

				<EditMessageDialog editing={editing} message={editedMessage} clearEditingState={clearEditingState} />
			</div>
		</div>
	);
};

export default CustomMessage;
