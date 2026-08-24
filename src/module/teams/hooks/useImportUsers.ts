"use client";

import type { UploadStatus, UserInviteDetails, ValidationResult } from "@/module/teams/types";
import { calculateValidationResult, ExcelProcessor, FileValidator } from "@/module/teams/utils/helpers";
import { useMemo, useState } from "react";

export const useFileUpload = (setUsers: (users: UserInviteDetails[]) => void) => {
	const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
	const [processingProgress, setProcessingProgress] = useState(0);
	const [errorMessage, setErrorMessage] = useState("");
	const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
	const [attachedFile, setAttachedFile] = useState<File | null>(null);

	const resetState = () => {
		setAttachedFile(null);
		setUsers([]);
		setValidationResult(null);
		setUploadStatus("idle");
		setErrorMessage("");
		setProcessingProgress(0);
	};

	const handleFileUpload = async (file: File) => {
		try {
			setUploadStatus("parsing");
			setErrorMessage("");
			setValidationResult(null);
			setProcessingProgress(0);

			// Validate file
			FileValidator.validateFileType(file.name);
			FileValidator.validateFileSize(file.size);

			setAttachedFile(file);

			// Parse Excel
			const data = await ExcelProcessor.parseFile(file);
			FileValidator.validateRecordCount(data.length);

			const headers = Object.keys(data[0] || {});
			FileValidator.validateHeaders(headers);

			// Process data
			setUploadStatus("validating");
			const users = await ExcelProcessor.processInBatches(data, setProcessingProgress);

			setUsers(users);
			const result = calculateValidationResult(users);
			setValidationResult(result);
			setUploadStatus("complete");
		} catch (error) {
			setUploadStatus("error");
			setErrorMessage(error instanceof Error ? error.message : "Error processing file");
		}
	};

	return {
		uploadStatus,
		processingProgress,
		errorMessage,
		validationResult,
		attachedFile,
		handleFileUpload,
		resetState,
		setValidationResult,
	};
};

export const useUserSearch = (users: UserInviteDetails[]) => {
	const [searchQuery, setSearchQuery] = useState("");

	const filteredUsers = useMemo(() => {
		if (!searchQuery.trim()) return users;
		const query = searchQuery.toLowerCase().trim();
		return users.filter(
			(user) =>
				user.email.toLowerCase().includes(query) ||
				user.firstName.toLowerCase().includes(query) ||
				user.lastName.toLowerCase().includes(query)
		);
	}, [users, searchQuery]);

	return { searchQuery, setSearchQuery, filteredUsers };
};
