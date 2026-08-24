"use client";

import { AttachedFileDisplay } from "@/module/teams/components/import-emails/attached-file-display";
import { FileUploadZone } from "@/module/teams/components/import-emails/file-upload-zone";
import { UsersTable } from "@/module/teams/components/import-emails/imported-users-table";
import { ValidationStatus } from "@/module/teams/components/import-emails/validation-status";
import { useFileUpload, useUserSearch } from "@/module/teams/hooks/useImportUsers";
import type { IExcelUserImportProps } from "@/module/teams/types";
import { calculateValidationResult, revalidateUsers } from "@/module/teams/utils/helpers";

export default function ExcelUserImport({ users = [], setUsers }: IExcelUserImportProps) {
	const {
		uploadStatus,
		processingProgress,
		errorMessage,
		validationResult,
		attachedFile,
		handleFileUpload,
		resetState,
		setValidationResult,
	} = useFileUpload(setUsers);

	const removeUser = (userId?: string) => {
		const updatedUsers = users.filter((user) => user.id !== userId);
		const revalidatedUsers = revalidateUsers(updatedUsers);
		setUsers(revalidatedUsers);

		if (validationResult) {
			setValidationResult(calculateValidationResult(revalidatedUsers));
		}
	};

	const { searchQuery, setSearchQuery, filteredUsers } = useUserSearch(users);

	if (!users) return null;

	return (
		<div className="mx-auto max-w-6xl space-y-6 p-6">
			{!attachedFile ? (
				<FileUploadZone onFileSelect={handleFileUpload} />
			) : (
				<div className="space-y-4">
					<AttachedFileDisplay file={attachedFile} onRemove={resetState} />
					<ValidationStatus
						uploadStatus={uploadStatus}
						errorMessage={errorMessage}
						validationResult={validationResult}
						processingProgress={processingProgress}
					/>
				</div>
			)}

			{uploadStatus === "complete" && users?.length > 0 && (
				<UsersTable
					users={users}
					filteredUsers={filteredUsers}
					searchQuery={searchQuery}
					onSearchChange={setSearchQuery}
					onRemoveUser={removeUser}
				/>
			)}
		</div>
	);
}
