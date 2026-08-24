import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

import { useStreamChat } from "@/module/chat/hooks/useStreamChat";
import { CHANNEL_ACTION_TYPES, type IChatActionConfirmationDialogProps } from "@/module/chat/types";
import { MessageCircle, Trash2 } from "lucide-react";

const ChatActionConfirmationDialog = ({ text, actionType, isOpen, setIsOpen }: IChatActionConfirmationDialogProps) => {
	const { deleteChannel, channel, clearChat } = useStreamChat();

	const handleAction = async () => {
		try {
			if (actionType === CHANNEL_ACTION_TYPES.DELETE) {
				await deleteChannel(String(channel?.cid));
			} else {
				await clearChat(String(channel?.id));
			}
			setIsOpen(false);
		} catch (error) {
			console.error("Action failed:", error);
		}
	};

	const isDeleteAction = actionType === CHANNEL_ACTION_TYPES.DELETE;
	const ActionIcon = isDeleteAction ? Trash2 : MessageCircle;

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogContent className="w-[90%] rounded-md sm:w-full sm:max-w-md">
				<DialogHeader className="flex flex-row gap-2">
					<div className={`flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive`}>
						<ActionIcon className="h-5 w-5" />
					</div>

					<DialogTitle className="text-lg font-semibold">Confirmation Required</DialogTitle>
				</DialogHeader>

				<DialogDescription className="text-base leading-relaxed text-txt-primary">{text}</DialogDescription>

				<DialogFooter className="flex-col gap-3 sm:flex-row sm:justify-end">
					<Button variant="destructive" onClick={() => void handleAction()} className="w-full rounded sm:w-auto">
						<Trash2 className="mr-2 h-4 w-4" />
						{isDeleteAction ? "Delete" : "Clear"}
					</Button>
					<Button variant="outline" onClick={() => setIsOpen(false)} className="w-full rounded sm:w-auto">
						Cancel
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default ChatActionConfirmationDialog;
