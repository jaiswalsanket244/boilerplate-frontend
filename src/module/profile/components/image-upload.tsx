"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ImageUploadButtonProps } from "@/module/profile/types/index";
import { Plus, Trash2, Upload } from "lucide-react";
import React, { useRef, useState } from "react";

export function ImageUploadButton({
	currentImageUrl,
	fallbackText = "U",
	onImageSelect,
	onImageRemove,
	isUploading = false,
	className = "h-20 w-20",
}: ImageUploadButtonProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		// Validate file type
		if (!file.type.startsWith("image/")) {
			setError("Please select an image file");
			return;
		}

		// Validate file size (e.g., max 5MB)

		if (file.size > 5 * 1024 * 1024) {
			setError("Image size should be less than 5MB");
			return;
		}

		// Create preview URL
		const previewUrl = URL.createObjectURL(file);
		onImageSelect(file, previewUrl);
		setIsDropdownOpen(false);
		setError(null);
	};

	const handleUploadClick = () => {
		fileInputRef.current?.click();
		setIsDropdownOpen(false);
	};

	const handleDeleteClick = () => {
		onImageRemove();
		setIsDropdownOpen(false);
		// Reset file input
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	// Helper function to get the image URL
	const getImageUrl = (): string | undefined => {
		if (Array.isArray(currentImageUrl)) {
			return currentImageUrl.length > 0 ? currentImageUrl[0] : undefined;
		}
		return currentImageUrl;
	};

	const imageUrl = getImageUrl();
	const hasImage = Boolean(imageUrl);

	return (
		<div className="flex flex-col gap-2">
			<div className="relative w-fit">
				<Avatar
					className={`${className} flex items-center justify-center overflow-hidden border-2 border-gray-200 text-xl`}
				>
					{hasImage ? (
						<AvatarImage
							src={imageUrl}
							alt="Profile"
							className="h-full w-full object-cover"
							onError={(error) => {
								console.error("Image failed to load:", error);
							}}
							data-testid="avatar-image"
						/>
					) : (
						<AvatarFallback data-testid="avatar-fallback" className="bg-blue font-semibold text-white">
							{fallbackText}
						</AvatarFallback>
					)}
				</Avatar>

				<DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
					<DropdownMenuTrigger asChild>
						<Button
							size="icon"
							variant="outline"
							className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-white shadow-lg hover:bg-gray-50"
							disabled={isUploading}
							data-testid="image-upload-button"
						>
							{isUploading ? (
								<div
									data-testid="loader"
									className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
								/>
							) : (
								<Plus className="h-4 w-4" />
							)}
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-40">
						<DropdownMenuItem onClick={handleUploadClick} data-testid="upload-file-button" className="cursor-pointer">
							<Upload className="mr-2 h-4 w-4" />
							Upload a file
						</DropdownMenuItem>
						{hasImage && (
							<DropdownMenuItem
								onClick={handleDeleteClick}
								className="cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700"
								data-testid="delete-file-button"
							>
								<Trash2 className="mr-2 h-4 w-4" />
								Delete
							</DropdownMenuItem>
						)}
					</DropdownMenuContent>
				</DropdownMenu>

				{/* Hidden file input */}
				<input
					ref={fileInputRef}
					data-testid="file-input"
					type="file"
					accept="image/*"
					onChange={handleFileSelect}
					className="hidden"
				/>
			</div>

			{error && (
				<p className="text-error" data-testid="error-message">
					{error}
				</p>
			)}
		</div>
	);
}
