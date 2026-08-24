import type { UserInviteDetails, ValidationResult, RowType } from "@/module/teams/types";
import readXlsxFile from "read-excel-file";

import { ERROR_MESSAGES, FILE_CONSTRAINTS, VALIDATION_PATTERNS } from "@/module/teams/utils/constants";

export const generateUserId = (): string => `user_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

export const validateEmail = (email: string): boolean => VALIDATION_PATTERNS.EMAIL.test(email.trim());

export const validateName = (name: string): boolean => VALIDATION_PATTERNS.NAME.test(name.trim());

export const formatFileSize = (bytes: number): string => {
	if (bytes === 0) return "0 Bytes";
	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]!}`;
};

export const normalizeRowData = (row: RowType) => ({
	email: String(row.Email || "").trim(),
	firstName: String(row.FirstName || "").trim(),
	lastName: String(row.LastName || "").trim(),
});

export const validateUserData = (email: string, firstName: string, lastName: string): string[] => {
	const errors: string[] = [];

	if (!email) {
		errors.push("Email is required");
	} else if (!validateEmail(email)) {
		errors.push("Invalid email format");
	}

	if (!firstName) {
		errors.push("First name is required");
	} else if (!validateName(firstName)) {
		errors.push("Invalid first name");
	}

	if (!lastName) {
		errors.push("Last name is required");
	} else if (!validateName(lastName)) {
		errors.push("Invalid last name");
	}

	return errors;
};

export const createUser = (
	email: string,
	firstName: string,
	lastName: string,
	errors: string[]
): UserInviteDetails => ({
	id: generateUserId(),
	email,
	firstName,
	lastName,
	errors: errors.length > 0 ? errors : undefined,
});

export const findDuplicateEmails = (users: UserInviteDetails[]): Set<string> => {
	const emailCounts = new Map<string, number>();

	users.forEach((user) => {
		const email = user.email.toLowerCase();
		emailCounts.set(email, (emailCounts.get(email) || 0) + 1);
	});

	return new Set(
		Array.from(emailCounts.entries())
			.filter(([, count]) => count > 1)
			.map(([email]) => email)
	);
};

export const addDuplicateErrors = (users: UserInviteDetails[], duplicates: Set<string>): UserInviteDetails[] => {
	return users.map((user) => {
		const email = user.email.toLowerCase();
		if (duplicates.has(email)) {
			const errors = user.errors?.filter((e) => !e.toLowerCase().includes("duplicate email")) || [];
			errors.push("Duplicate email found");
			return { ...user, errors };
		}
		return user;
	});
};

export const revalidateUsers = (users: UserInviteDetails[]): UserInviteDetails[] => {
	// Remove old duplicate errors
	const usersWithoutDuplicateErrors = users.map((user) => ({
		...user,
		errors: user.errors?.filter((e) => !e.toLowerCase().includes("duplicate email")),
	}));

	// Find current duplicates and add errors
	const duplicates = findDuplicateEmails(usersWithoutDuplicateErrors);
	return addDuplicateErrors(usersWithoutDuplicateErrors, duplicates);
};

export const calculateValidationResult = (users: UserInviteDetails[]): ValidationResult => {
	const validCount = users.filter((user) => !user.errors || user.errors.length === 0).length;
	const invalidCount = users.length - validCount;

	return {
		valid: invalidCount === 0,
		errors: [],
		totalRecords: users.length,
		validRecords: validCount,
		invalidRecords: invalidCount,
	};
};

// ============================================================================
// FILE VALIDATION
// ============================================================================

export class FileValidator {
	static validateFileType(filename: string): void {
		const hasValidExtension = FILE_CONSTRAINTS.ACCEPTED_EXTENSIONS.some((ext) => filename.toLowerCase().endsWith(ext));
		if (!hasValidExtension) {
			throw new Error(ERROR_MESSAGES.INVALID_FILE_TYPE);
		}
	}

	static validateFileSize(size: number): void {
		const maxBytes = FILE_CONSTRAINTS.MAX_SIZE_MB * 1024 * 1024;
		if (size > maxBytes) {
			throw new Error(ERROR_MESSAGES.FILE_TOO_LARGE);
		}
	}

	static validateRecordCount(count: number): void {
		if (count === 0) {
			throw new Error(ERROR_MESSAGES.NO_DATA);
		}
		if (count > FILE_CONSTRAINTS.MAX_RECORDS) {
			throw new Error(ERROR_MESSAGES.TOO_MANY_RECORDS);
		}
	}

	static validateHeaders(headers: string[]): void {
		const normalizedHeaders = headers.map((h) => h.toLowerCase());
		const hasEmail = normalizedHeaders.some((h) => h.includes("email"));
		const hasFirst = normalizedHeaders.some((h) => h.includes("first"));
		const hasLast = normalizedHeaders.some((h) => h.includes("last"));

		if (!hasEmail || !hasFirst || !hasLast) {
			throw new Error(ERROR_MESSAGES.MISSING_COLUMNS);
		}
	}
}

// ============================================================================
// EXCEL PROCESSOR
// ============================================================================

export class ExcelProcessor {
	static async parseFile(file: File): Promise<RowType[]> {
		const rows = await readXlsxFile(file);

		const data = [];
		for (let i = 1; i < rows.length; i++) {
			const row = rows[i] as string[];
			data.push({
				Email: row[0]!,
				FirstName: row[1]!,
				LastName: row[2]!,
			});
		}

		return data;
	}

	static async processInBatches(data: RowType[], onProgress: (progress: number) => void): Promise<UserInviteDetails[]> {
		const { BATCH_SIZE } = FILE_CONSTRAINTS;
		const users: UserInviteDetails[] = [];

		// Build email map for duplicate detection
		const emailIndices = new Map<string, number[]>();
		data.forEach((row, index) => {
			const { email } = normalizeRowData(row);
			if (email) {
				const normalizedEmail = email.toLowerCase();
				if (!emailIndices.has(normalizedEmail)) {
					emailIndices.set(normalizedEmail, []);
				}
				emailIndices.get(normalizedEmail)!.push(index);
			}
		});

		// Process in batches
		for (let i = 0; i < data.length; i += BATCH_SIZE) {
			const batch = data.slice(i, i + BATCH_SIZE);

			batch.forEach((row, batchIndex) => {
				const { email, firstName, lastName } = normalizeRowData(row);
				const errors = validateUserData(email, firstName, lastName);

				// Check for duplicates
				const normalizedEmail = email.toLowerCase();
				if (normalizedEmail && (emailIndices.get(normalizedEmail)?.length || 0) > 1) {
					errors.push("Duplicate email found");
				}

				users.push(createUser(email, firstName, lastName, errors));
			});

			onProgress(Math.min(((i + BATCH_SIZE) / data.length) * 100, 100));
			await new Promise((resolve) => setTimeout(resolve, 10));
		}

		return users;
	}
}
