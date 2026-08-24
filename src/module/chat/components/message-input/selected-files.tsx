import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ISelectedFile, ISelectedFilesProps } from "@/module/chat/types";
import { Loader2, Paperclip, X } from "lucide-react";
import { useState } from "react";
import { formatFileSize } from "@/module/chat/utils/helpers";

const Loader = () => {
	return (
		<div className="w-fit rounded-lg p-3">
			<div className="flex items-center gap-3">
				<div className="flex h-10 w-10 items-center justify-center rounded-lg">
					<Loader2 className="h-5 w-5 animate-spin" />
				</div>
				<div>
					<p className="text-sm font-medium">Uploading...</p>
					<p className="text-xs">Please wait</p>
				</div>
			</div>
		</div>
	);
};

const SelectedFiles = ({ selectedFiles, removeSelectedFile, uploadingFiles }: ISelectedFilesProps) => {
	return (
		<>
			{(selectedFiles.length > 0 || uploadingFiles.size > 0) && (
				<div className={cn("flex-1 p-2", "border-b border-gray-100")}>
					<div className="flex flex-wrap gap-2">
						{selectedFiles.map((file) => (
							<SelectedFile key={file.id} file={file} removeSelectedFile={removeSelectedFile} />
						))}

						{uploadingFiles.size > 0 && <Loader />}
					</div>
				</div>
			)}
		</>
	);
};

const SelectedFile = ({
	file,
	removeSelectedFile,
}: {
	file: ISelectedFile;
	removeSelectedFile: (fileId: string) => Promise<void>;
}) => {
	const [isRemoving, setIsRemoving] = useState(false);

	const handleRemoveFile = async () => {
		try {
			setIsRemoving(true);
			await removeSelectedFile(file.id);
		} catch (error) {
			console.error("Error removing file:", error);
		} finally {
			setIsRemoving(false);
		}
	};

	return (
		<div
			key={file.id}
			className={cn(
				"w-fit shrink-0 rounded-lg bg-gray-100 p-2",
				(file.uploadStatus === "failed" || file.uploadStatus === "oversized") && "border-error bg-error/10 border"
			)}
		>
			<div className="flex items-center gap-3">
				<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-300">
					<span className="text-lg">
						<Paperclip className="size-5" />
					</span>
				</div>
				<div className="flex-1">
					<p className="text-txt-primary line-clamp-1 max-w-28 truncate text-sm font-medium">{file.name}</p>
					<p className="text-txt-secondary-800 text-xs">
						<span>
							{formatFileSize(file.size)} • {file.type}
						</span>
						{file.uploadStatus === "oversized" && <span className="text-error ml-2">Over sized file</span>}
					</p>
				</div>
				<Button
					variant="ghost"
					size="icon"
					className="ml-auto rounded-full"
					onClick={() => void handleRemoveFile()}
					disabled={isRemoving}
				>
					{isRemoving ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
				</Button>
			</div>
		</div>
	);
};

export default SelectedFiles;
