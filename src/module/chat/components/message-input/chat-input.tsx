"use client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import SelectedFiles from "@/module/chat/components/message-input/selected-files";
import useChatAPI from "@/module/chat/hooks/useChatAPI";
import type { IChatInputProps, ISelectedFile } from "@/module/chat/types";
import { getAttachmentType } from "@/module/chat/utils/helpers";
import { ArrowUp, Loader2, Paperclip } from "lucide-react";
import { useState } from "react";

const MAX_FILE_SIZE = 20; // 20MB

const ChatInput = ({
	draft,
	setDraft,
	handleSendMessage,
	uploadFile,
	maxFileSize = MAX_FILE_SIZE,
	multiple = true,
	acceptedFileTypes = "image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx",
	disabled,
}: IChatInputProps) => {
	const { useRemoveChatFile } = useChatAPI();

	const { text: messageText, files: selectedFiles } = draft;

	const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());

	const handleTextChange = (value: string) => {
		setDraft({ ...draft, text: value });
	};

	const setSelectedFiles = (files: ISelectedFile[]) => {
		setDraft((prev) => {
			const updatedFiles = [...prev.files, ...files];
			return { ...prev, files: updatedFiles };
		});
	};

	const removeSelectedFile = async (fileId: string) => {
		const fileToRemove = selectedFiles.find((f) => f.id === fileId);
		if (!fileToRemove) return;

		try {
			if (fileToRemove.url) await useRemoveChatFile.mutateAsync({ url: fileToRemove.url });

			setDraft((prev) => {
				const updatedFiles = prev.files.filter((f) => f.id !== fileId);
				return { ...prev, files: updatedFiles };
			});
		} catch (error) {
			console.error("Error removing file:", error);
		}
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			void handleSendMessage();
		}
	};

	const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(event.target.files || []);
		if (files.length === 0) return;

		// Check if all files are under MAX_FILE_SIZE
		const oversizedFiles = files.filter((file) => file.size > maxFileSize * 1024 * 1024);
		const validFiles = files.filter((file) => file.size <= maxFileSize * 1024 * 1024);

		const fileIds = validFiles.map(() => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);

		setUploadingFiles((prev) => {
			const newSet = new Set(prev);
			fileIds.forEach((id) => newSet.add(id));
			return newSet;
		});

		try {
			const uploadPromises = validFiles.map(async (file, index) => {
				const fileId = fileIds[index] as string;
				const fileName = file.name;
				const attachmentType = getAttachmentType(file.type);

				try {
					const fileUrl = await uploadFile(file);

					if (fileUrl) {
						const newFile: ISelectedFile = {
							id: fileId,
							url: fileUrl,
							name: fileName,
							mimetype: file.type,
							type: attachmentType,
							size: file.size,
							uploadStatus: "uploaded",
						};
						setSelectedFiles([newFile]);
					}
				} catch (error) {
					const newFile: ISelectedFile = {
						id: fileId,
						url: "",
						name: fileName,
						mimetype: file.type,
						type: attachmentType,
						size: file.size,
						uploadStatus: "failed",
					};
					setSelectedFiles([newFile]);
				} finally {
					setUploadingFiles((prev) => {
						const newSet = new Set(prev);
						newSet.delete(fileId);
						return newSet;
					});
				}
			});

			await Promise.all(uploadPromises);
			setSelectedFiles(
				oversizedFiles.map((file) => ({
					id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
					url: "",
					name: file.name,
					mimetype: file.type,
					type: getAttachmentType(file.type),
					size: file.size,
					uploadStatus: "oversized",
				}))
			);
		} finally {
			event.target.value = "";
		}
	};

	const isUploading = uploadingFiles.size > 0;
	const isDisabled =
		(!messageText.trim() && selectedFiles.filter((f) => f.uploadStatus === "uploaded").length === 0) ||
		disabled ||
		isUploading;

	return (
		<div className="flex flex-col gap-2 px-4 py-4">
			<div className="border-input rounded-md border">
				<SelectedFiles
					selectedFiles={selectedFiles}
					removeSelectedFile={removeSelectedFile}
					uploadingFiles={uploadingFiles}
				/>

				<div className={cn("bg-muted relative flex h-16 w-full flex-1 items-center")}>
					<Textarea
						data-testid="chat-message-input"
						value={messageText}
						onChange={(e) => handleTextChange(e.target.value)}
						placeholder="Type a message..."
						className="hide-scrollbar h-full flex-1 resize-none border-none text-base! shadow-none focus-visible:ring-0"
						onKeyDown={handleKeyDown}
					/>

					<div className="flex shrink-0 gap-2 pr-2">
						<label
							htmlFor="file-input"
							className={cn(
								`bg-background relative flex size-12 cursor-pointer items-center justify-center rounded-[8px]`,
								isUploading || disabled ? "cursor-not-allowed opacity-50" : "hover:bg-background/80"
							)}
						>
							<input
								type="file"
								accept={acceptedFileTypes}
								multiple={multiple}
								hidden
								id="file-input"
								data-testid="attach-file"
								className="absolute inset-0 opacity-0 disabled:cursor-not-allowed disabled:opacity-50"
								onChange={(event) => void handleFileChange(event)}
								disabled={isUploading || disabled}
							/>
							{isUploading ? (
								<Loader2 className="text-muted-foreground animate-spin text-xl" />
							) : (
								<Paperclip className="size-5" />
							)}
						</label>

						<Button
							variant="ghost"
							size="sm"
							className="bg-primary text-primary-foreground hover:bg-primary/80 size-12 rounded-lg disabled:cursor-not-allowed disabled:opacity-50"
							onClick={() => void handleSendMessage()}
							disabled={isDisabled || isUploading || disabled}
							data-testid="send-message-button"
						>
							<ArrowUp className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ChatInput;
