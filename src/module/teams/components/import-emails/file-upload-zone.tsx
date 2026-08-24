import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import { FILE_CONSTRAINTS } from "@/module/teams/utils/constants";
import type { IFileUploadZoneProps } from "@/module/teams/types";

export const FileUploadZone = ({ onFileSelect }: IFileUploadZoneProps) => {
	const [dragOver, setDragOver] = useState(false);

	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setDragOver(false);
		const file = e.dataTransfer.files[0];
		if (file) void onFileSelect(file);
	};

	return (
		<div
			data-testid="file-upload-zone"
			className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
				dragOver
					? "border-blue-500 bg-blue-50 dark:border-blue-900 dark:bg-black"
					: "border-input/90 hover:border-input"
			}`}
			onDrop={handleDrop}
			onDragOver={(e) => {
				e.preventDefault();
				setDragOver(true);
			}}
			onDragLeave={(e) => {
				e.preventDefault();
				setDragOver(false);
			}}
		>
			<div className="flex flex-col items-center gap-4">
				<Upload className="h-12 w-12 text-gray-400" />
				<div className="space-y-2">
					<p className="text-sm text-gray-600">Drag & drop your Excel file or</p>
					<Button
						variant="outline"
						data-testid="browse-files-button"
						type="button"
						onClick={() => fileInputRef.current?.click()}
					>
						Browse Files
					</Button>
				</div>
				<p className="text-xs text-gray-500">
					.xlsx/.xls, Max {FILE_CONSTRAINTS.MAX_SIZE_MB}MB, up to {FILE_CONSTRAINTS.MAX_RECORDS} rows
				</p>
			</div>
			<input
				data-testid="file-input"
				ref={fileInputRef}
				type="file"
				accept={FILE_CONSTRAINTS.ACCEPTED_EXTENSIONS.join(",")}
				onChange={(e) => e.target.files?.[0] && void onFileSelect(e.target.files[0])}
				className="hidden"
			/>
		</div>
	);
};
