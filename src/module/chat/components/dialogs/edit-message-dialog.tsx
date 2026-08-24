"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useStreamChat } from "@/module/chat/hooks/useStreamChat";
import type { IEditMessageDialogProps } from "@/module/chat/types";
import { Edit3, Save, X } from "lucide-react";
import { useState } from "react";

const EditMessageDialog = ({ editing, message, clearEditingState }: IEditMessageDialogProps) => {
	const { client } = useStreamChat();

	const [editedText, setEditedText] = useState(message.text);
	const [isFailed, setIsFailed] = useState(false);

	const handleEditMessage = async () => {
		if (!message) return;

		try {
			await client.updateMessage({ id: message.id, text: editedText, attachments: message.attachments });
			clearEditingState(undefined);
			setEditedText("");
		} catch (error) {
			setIsFailed(true);
		}
	};

	const handleClose = () => {
		clearEditingState(undefined);
		setEditedText(message.text); // Reset to original text on close
		setIsFailed(false);
	};

	return (
		<Dialog open={editing} onOpenChange={handleClose}>
			<DialogContent className="gap-0 border-slate-200 bg-linear-to-br from-slate-50 to-slate-100 p-0 sm:max-w-[500px] dark:border-slate-700 dark:from-slate-900 dark:to-slate-800">
				<DialogHeader className="border-b bg-linear-to-r p-6 pb-4">
					<div className="flex items-center gap-3">
						<div className="bg-blue/20 text-blue rounded-full p-2 dark:text-blue-600">
							<Edit3 className="h-4 w-4" />
						</div>

						<DialogTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">Edit Message</DialogTitle>
					</div>
				</DialogHeader>

				<div className="space-y-2 p-6">
					<div className="space-y-2">
						<Label htmlFor="message-text" className="text-sm font-medium text-slate-700 dark:text-slate-300">
							Message Content
						</Label>
						<Textarea
							id="message-text"
							value={editedText}
							onChange={(e) => setEditedText(e.target.value)}
							placeholder="Type your message here..."
							className="min-h-[100px] resize-none border-slate-200 bg-white transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
						/>
					</div>

					{Number(editedText?.length) > 0 && (
						<div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
							<span>{editedText?.length} characters</span>
							{editedText !== message.text && (
								<span className="font-medium text-amber-600 dark:text-amber-400">● Unsaved changes</span>
							)}
						</div>
					)}

					{isFailed && <p className="text-error text-right text-xs">Failed to update message</p>}
				</div>

				<DialogFooter className="border-t border-slate-200 bg-slate-50 p-6 pt-4 dark:border-slate-700 dark:bg-slate-800/50">
					<div className="flex w-full gap-3 sm:w-auto">
						<Button
							variant="outline"
							onClick={handleClose}
							className="flex-1 border-slate-300 text-slate-700 transition-colors duration-200 hover:bg-slate-100 sm:flex-none dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
						>
							<X className="mr-2 h-4 w-4" />
							Cancel
						</Button>
						<Button
							data-testid="save-message-changes"
							onClick={() => void handleEditMessage()}
							disabled={!editedText?.trim() || editedText === message.text}
							className="flex-1 bg-linear-to-r text-white shadow-lg transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
						>
							<Save className="mr-2 h-4 w-4" />
							Save Changes
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default EditMessageDialog;
