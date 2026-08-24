"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import useChatAPI from "@/module/chat/hooks/useChatAPI";
import { type IUploadGroupChatAvatarProps } from "@/module/chat/types";
import { Camera, Loader2, User, X } from "lucide-react";
import Image from "next/image";
import React, { useRef, useState } from "react";

// Size configurations
const sizeConfig = {
	sm: { container: "w-12 h-12", icon: "w-4 h-4" },
	md: { container: "w-16 h-16", icon: "w-5 h-5" },
	lg: { container: "w-20 h-20", icon: "w-6 h-6" },
};

const UploadGroupChatAvatar: React.FC<IUploadGroupChatAvatarProps> = ({
	avatar,
	onAvatarChange,
	size = "md",
	className = "",
	disabled = false,
}) => {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { useRemoveChatFile, useUploadChatFile } = useChatAPI();

	const config = sizeConfig[size];

	const [errors, setErrors] = useState({
		file: "",
	});

	const uploadFile = async (file: File): Promise<string> => {
		try {
			const result = await useUploadChatFile.mutateAsync({
				file,
				params: {
					name: file.name,
					mimetype: file.type,
				},
			});
			if (!result) return "";

			if (avatar) await useRemoveChatFile.mutateAsync({ url: avatar });
			onAvatarChange(result);
			return result;
		} catch (error) {
			setErrors({
				file: "Failed to upload file",
			});
			return "";
		}
	};
	const handleFileSelect = async (file: File) => {
		if (disabled) return;

		// Validate file type
		if (!file.type.startsWith("image/")) {
			setErrors({
				file: "Select an image file",
			});
			return;
		}

		// Validate file size (max 5MB)
		const maxSize = 5 * 1024 * 1024;
		if (file.size > maxSize) {
			setErrors({
				file: "Max file size: 5MB",
			});
			return;
		}

		await uploadFile(file);
	};

	const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			void handleFileSelect(file);
		}
	};

	const handleClick = () => {
		if (!disabled) {
			fileInputRef.current?.click();
		}
	};

	const handleRemoveAvatar = async (e: React.MouseEvent) => {
		e.stopPropagation();
		if (disabled) return;

		if (avatar) {
			await useRemoveChatFile.mutateAsync({ url: avatar });
		}

		onAvatarChange("");

		// Reset file input
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};
	const isLoading = useUploadChatFile.isPending || useRemoveChatFile.isPending;
	return (
		<div className={`relative overflow-x-visible ${className}`}>
			<div
				className={cn(
					"relative cursor-pointer overflow-hidden rounded-full border-2 transition-all",
					config.container,
					"border-border/90 hover:border-border",
					avatar ? "" : "border-dashed",
					disabled ? "cursor-not-allowed" : ""
				)}
				onClick={handleClick}
			>
				{/* Hidden file input */}
				<input
					ref={fileInputRef}
					type="file"
					accept="image/*"
					onChange={handleFileInputChange}
					className="hidden"
					disabled={disabled || isLoading}
				/>
				{isLoading && (
					<div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-100 transition-opacity hover:opacity-100">
						<Loader2 className={`${config.icon} z-10 animate-spin text-white`} />
					</div>
				)}

				{avatar ? (
					<>
						<Image fill src={avatar} alt="Avatar" className="h-full w-full object-cover" />

						{!disabled && (
							<div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 transition-opacity hover:opacity-100">
								<Camera className={`${config.icon} text-white`} />
							</div>
						)}
					</>
				) : (
					<div className="flex h-full w-full items-center justify-center bg-muted">
						<User className={`${config.icon} text-txt-secondary`} />
					</div>
				)}
			</div>

			{!disabled && avatar && (
				<Button
					onClick={(e) => void handleRemoveAvatar(e)}
					className="absolute -bottom-1 -right-1 z-10 size-5 rounded-full p-1 text-primary-foreground shadow-md transition-colors"
					type="button"
				>
					<X className="h-2 w-2" />
				</Button>
			)}

			{errors.file && <p className="absolute -bottom-8 text-center text-xs text-red">{errors.file}</p>}
		</div>
	);
};

export default UploadGroupChatAvatar;
