import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useFileUpload, useUserSearch } from "@/module/teams/hooks/useImportUsers";
import type { UserInviteDetails } from "@/module/teams/types";
import * as helpers from "@/module/teams/utils/helpers";

// Mock the helpers module
vi.mock("@/module/teams/utils/helpers", async () => {
	const actual = await vi.importActual("@/module/teams/utils/helpers");
	return {
		...actual,
		FileValidator: {
			validateFileType: vi.fn(),
			validateFileSize: vi.fn(),
			validateRecordCount: vi.fn(),
			validateHeaders: vi.fn(),
		},
		ExcelProcessor: {
			parseFile: vi.fn(),
			processInBatches: vi.fn(),
		},
	};
});

const createMockFile = (name: string, size: number = 1024): File => {
	const blob = new Blob(["test content"], {
		type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	});
	return new File([blob], name, { type: blob.type });
};

/**
 * Helper function to setup successful file validation and processing mocks
 */
const setupSuccessfulFileMocks = (
	parsedData: Array<{ Email: string; FirstName: string; LastName: string }>,
	processedUsers: UserInviteDetails[]
) => {
	vi.mocked(helpers.FileValidator.validateFileType).mockImplementation(() => {});
	vi.mocked(helpers.FileValidator.validateFileSize).mockImplementation(() => {});
	vi.mocked(helpers.FileValidator.validateRecordCount).mockImplementation(() => {});
	vi.mocked(helpers.FileValidator.validateHeaders).mockImplementation(() => {});
	vi.mocked(helpers.ExcelProcessor.parseFile).mockResolvedValue(parsedData);
	vi.mocked(helpers.ExcelProcessor.processInBatches).mockResolvedValue(processedUsers);
};

const mockUsers: UserInviteDetails[] = [
	{
		id: "user-1",
		email: "john@example.com",
		firstName: "John",
		lastName: "Doe",
	},
	{
		id: "user-2",
		email: "jane@example.com",
		firstName: "Jane",
		lastName: "Smith",
	},
];

const mockUsersWithErrors: UserInviteDetails[] = [
	{
		id: "user-1",
		email: "john@example.com",
		firstName: "John",
		lastName: "Doe",
	},
	{
		id: "user-2",
		email: "invalid-email",
		firstName: "Jane",
		lastName: "Smith",
		errors: ["Invalid email format"],
	},
];

describe("useFileUpload hook", () => {
	const setUsersMock = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("Initial State", () => {
		it("should initialize with correct default values", () => {
			const { result } = renderHook(() => useFileUpload(setUsersMock));

			expect(result.current.uploadStatus).toBe("idle");
			expect(result.current.processingProgress).toBe(0);
			expect(result.current.errorMessage).toBe("");
			expect(result.current.validationResult).toBeNull();
			expect(result.current.attachedFile).toBeNull();
		});

		it("should provide all required functions", () => {
			const { result } = renderHook(() => useFileUpload(setUsersMock));

			expect(typeof result.current.handleFileUpload).toBe("function");
			expect(typeof result.current.resetState).toBe("function");
			expect(typeof result.current.setValidationResult).toBe("function");
		});
	});

	describe("handleFileUpload", () => {
		it("should successfully upload and process a valid file", async () => {
			const mockFile = createMockFile("test.xlsx");
			const mockParsedData = [
				{ Email: "john@example.com", FirstName: "John", LastName: "Doe" },
				{ Email: "jane@example.com", FirstName: "Jane", LastName: "Smith" },
			];

			setupSuccessfulFileMocks(mockParsedData, mockUsers);

			const { result } = renderHook(() => useFileUpload(setUsersMock));

			await act(async () => {
				await result.current.handleFileUpload(mockFile);
			});

			await waitFor(() => {
				expect(result.current.uploadStatus).toBe("complete");
			});

			expect(helpers.FileValidator.validateFileType).toHaveBeenCalledWith("test.xlsx");
			expect(helpers.FileValidator.validateFileSize).toHaveBeenCalledWith(mockFile.size);
			expect(helpers.ExcelProcessor.parseFile).toHaveBeenCalledWith(mockFile);
			expect(setUsersMock).toHaveBeenCalledWith(mockUsers);
			expect(result.current.attachedFile).toBe(mockFile);
			expect(result.current.validationResult).toBeDefined();
			expect(result.current.errorMessage).toBe("");
		});

		it("should set status to parsing initially", async () => {
			const mockFile = createMockFile("test.xlsx");

			vi.mocked(helpers.ExcelProcessor.parseFile).mockImplementation(
				() => new Promise((resolve) => setTimeout(() => resolve([]), 100))
			);

			const { result } = renderHook(() => useFileUpload(setUsersMock));

			act(() => {
				void result.current.handleFileUpload(mockFile);
			});

			await waitFor(() => {
				expect(result.current.uploadStatus).toBe("parsing");
			});
		});

		it("should set status to validating during validation", async () => {
			const mockFile = createMockFile("test.xlsx");
			const mockParsedData = [{ Email: "test@example.com", FirstName: "Test", LastName: "User" }];

			setupSuccessfulFileMocks(mockParsedData, mockUsers);
			vi.mocked(helpers.ExcelProcessor.processInBatches).mockImplementation(
				() => new Promise((resolve) => setTimeout(() => resolve(mockUsers), 100))
			);

			const { result } = renderHook(() => useFileUpload(setUsersMock));

			act(() => {
				void result.current.handleFileUpload(mockFile);
			});

			await waitFor(() => {
				expect(result.current.uploadStatus).toBe("validating");
			});
		});

		it("should handle invalid file type error", async () => {
			const mockFile = createMockFile("test.pdf");

			vi.mocked(helpers.FileValidator.validateFileType).mockImplementation(() => {
				throw new Error("Please upload a valid Excel file (.xlsx or .xls)");
			});

			const { result } = renderHook(() => useFileUpload(setUsersMock));

			await act(async () => {
				await result.current.handleFileUpload(mockFile);
			});

			await waitFor(() => {
				expect(result.current.uploadStatus).toBe("error");
			});

			expect(result.current.errorMessage).toBe("Please upload a valid Excel file (.xlsx or .xls)");
		});

		it("should handle file size error", async () => {
			const mockFile = createMockFile("large-file.xlsx", 20 * 1024 * 1024);

			vi.mocked(helpers.FileValidator.validateFileType).mockImplementation(() => {});
			vi.mocked(helpers.FileValidator.validateFileSize).mockImplementation(() => {
				throw new Error("File size should be less than 10MB");
			});

			const { result } = renderHook(() => useFileUpload(setUsersMock));

			await act(async () => {
				await result.current.handleFileUpload(mockFile);
			});

			await waitFor(() => {
				expect(result.current.uploadStatus).toBe("error");
			});

			expect(result.current.errorMessage).toBe("File size should be less than 10MB");
		});

		it("should handle missing columns error", async () => {
			const mockFile = createMockFile("test.xlsx");
			const mockParsedData = [{ FirstName: "John", LastName: "Doe", Email: "test@example.com" }];

			vi.mocked(helpers.FileValidator.validateFileSize).mockImplementation(() => {});
			vi.mocked(helpers.ExcelProcessor.parseFile).mockResolvedValue(mockParsedData);
			vi.mocked(helpers.FileValidator.validateHeaders).mockImplementation(() => {
				throw new Error("Excel file must contain: Email, First Name, Last Name columns");
			});

			const { result } = renderHook(() => useFileUpload(setUsersMock));

			await act(async () => {
				await result.current.handleFileUpload(mockFile);
			});

			await waitFor(() => {
				expect(result.current.uploadStatus).toBe("error");
			});

			expect(result.current.errorMessage).toBe("Excel file must contain: Email, First Name, Last Name columns");
		});

		it("should handle empty file error", async () => {
			const mockFile = createMockFile("empty.xlsx");

			vi.mocked(helpers.FileValidator.validateRecordCount).mockImplementation(() => {
				throw new Error("No data found in Excel file");
			});

			const { result } = renderHook(() => useFileUpload(setUsersMock));

			await act(async () => {
				await result.current.handleFileUpload(mockFile);
			});

			await waitFor(() => {
				expect(result.current.uploadStatus).toBe("error");
			});

			expect(result.current.errorMessage).toBe("No data found in Excel file");
		});

		it("should handle too many records error", async () => {
			const mockFile = createMockFile("large-data.xlsx");
			const mockParsedData = Array(1500).fill({ Email: "test@example.com", FirstName: "Test", LastName: "User" });

			vi.mocked(helpers.ExcelProcessor.parseFile).mockResolvedValue(mockParsedData);
			vi.mocked(helpers.FileValidator.validateRecordCount).mockImplementation(() => {
				throw new Error("Max 1000 records allowed");
			});

			const { result } = renderHook(() => useFileUpload(setUsersMock));

			await act(async () => {
				await result.current.handleFileUpload(mockFile);
			});

			await waitFor(() => {
				expect(result.current.uploadStatus).toBe("error");
			});

			expect(result.current.errorMessage).toBe("Max 1000 records allowed");
		});

		it("should update processing progress", async () => {
			const mockFile = createMockFile("test.xlsx");
			const mockParsedData = [{ Email: "test@example.com", FirstName: "Test", LastName: "User" }];
			let progressCallback: ((progress: number) => void) | null = null;

			setupSuccessfulFileMocks(mockParsedData, mockUsers);
			vi.mocked(helpers.ExcelProcessor.processInBatches).mockImplementation((data, onProgress) => {
				progressCallback = onProgress;
				return Promise.resolve(mockUsers);
			});

			const { result } = renderHook(() => useFileUpload(setUsersMock));

			await act(async () => {
				await result.current.handleFileUpload(mockFile);
			});

			expect(progressCallback).toBeDefined();

			if (progressCallback) {
				act(() => {
					progressCallback?.(50);
				});

				expect(result.current.processingProgress).toBe(50);
			}
		});

		it("should calculate validation result with valid users", async () => {
			const mockFile = createMockFile("test.xlsx");
			const mockParsedData = [{ Email: "test@example.com", FirstName: "Test", LastName: "User" }];

			setupSuccessfulFileMocks(mockParsedData, mockUsers);

			const { result } = renderHook(() => useFileUpload(setUsersMock));

			await act(async () => {
				await result.current.handleFileUpload(mockFile);
			});

			await waitFor(() => {
				expect(result.current.validationResult).toBeDefined();
			});

			expect(result.current.validationResult?.valid).toBe(true);
			expect(result.current.validationResult?.totalRecords).toBe(2);
			expect(result.current.validationResult?.validRecords).toBe(2);
			expect(result.current.validationResult?.invalidRecords).toBe(0);
		});

		it("should calculate validation result with invalid users", async () => {
			const mockFile = createMockFile("test.xlsx");
			const mockParsedData = [{ Email: "test@example.com", FirstName: "Test", LastName: "User" }];

			setupSuccessfulFileMocks(mockParsedData, mockUsersWithErrors);

			const { result } = renderHook(() => useFileUpload(setUsersMock));

			await act(async () => {
				await result.current.handleFileUpload(mockFile);
			});

			await waitFor(() => {
				expect(result.current.validationResult).toBeDefined();
			});

			expect(result.current.validationResult?.valid).toBe(false);
			expect(result.current.validationResult?.totalRecords).toBe(2);
			expect(result.current.validationResult?.validRecords).toBe(1);
			expect(result.current.validationResult?.invalidRecords).toBe(1);
		});

		it("should reset error state before new upload", async () => {
			const mockFile = createMockFile("test.xlsx");

			vi.mocked(helpers.FileValidator.validateFileType).mockImplementation(() => {
				throw new Error("Invalid file type");
			});

			const { result } = renderHook(() => useFileUpload(setUsersMock));

			// First upload with error
			await act(async () => {
				await result.current.handleFileUpload(mockFile);
			});

			expect(result.current.errorMessage).toBe("Invalid file type");

			// Second upload should reset error
			const validParsedData = [{ Email: "test@example.com", FirstName: "Test", LastName: "User" }];
			setupSuccessfulFileMocks(validParsedData, mockUsers);
			vi.mocked(helpers.ExcelProcessor.parseFile).mockResolvedValue([]);

			await act(async () => {
				await result.current.handleFileUpload(mockFile);
			});

			await waitFor(() => {
				expect(result.current.errorMessage).toBe("");
			});
		});

		it("should handle generic error", async () => {
			const mockFile = createMockFile("test.xlsx");

			vi.mocked(helpers.FileValidator.validateFileType).mockImplementation(() => {
				throw "Unknown error";
			});

			const { result } = renderHook(() => useFileUpload(setUsersMock));

			await act(async () => {
				await result.current.handleFileUpload(mockFile);
			});

			await waitFor(() => {
				expect(result.current.uploadStatus).toBe("error");
			});

			expect(result.current.errorMessage).toBe("Error processing file");
		});
	});

	describe("resetState", () => {
		it("should reset all state to initial values", async () => {
			const mockFile = createMockFile("test.xlsx");
			const mockParsedData = [{ Email: "test@example.com", FirstName: "Test", LastName: "User" }];

			setupSuccessfulFileMocks(mockParsedData, mockUsers);

			const { result } = renderHook(() => useFileUpload(setUsersMock));

			// Upload a file first
			await act(async () => {
				await result.current.handleFileUpload(mockFile);
			});

			await waitFor(() => {
				expect(result.current.uploadStatus).toBe("complete");
			});

			// Reset state
			act(() => {
				result.current.resetState();
			});

			expect(result.current.uploadStatus).toBe("idle");
			expect(result.current.processingProgress).toBe(0);
			expect(result.current.errorMessage).toBe("");
			expect(result.current.validationResult).toBeNull();
			expect(result.current.attachedFile).toBeNull();
			expect(setUsersMock).toHaveBeenCalledWith([]);
		});
	});

	describe("setValidationResult", () => {
		it("should allow manual update of validation result", () => {
			const { result } = renderHook(() => useFileUpload(setUsersMock));

			const customValidationResult = {
				valid: false,
				errors: ["Custom error"],
				totalRecords: 5,
				validRecords: 3,
				invalidRecords: 2,
			};

			act(() => {
				result.current.setValidationResult(customValidationResult);
			});

			expect(result.current.validationResult).toEqual(customValidationResult);
		});
	});
});

describe("useUserSearch hook", () => {
	describe("Initial State", () => {
		it("should initialize with empty search query", () => {
			const { result } = renderHook(() => useUserSearch(mockUsers));

			expect(result.current.searchQuery).toBe("");
			expect(result.current.filteredUsers).toEqual(mockUsers);
		});

		it("should return all users when search query is empty", () => {
			const { result } = renderHook(() => useUserSearch(mockUsers));

			expect(result.current.filteredUsers).toHaveLength(2);
			expect(result.current.filteredUsers).toEqual(mockUsers);
		});
	});

	describe("Search Functionality", () => {
		it("should filter users by email", () => {
			const { result } = renderHook(() => useUserSearch(mockUsers));

			act(() => {
				result.current.setSearchQuery("john@example.com");
			});

			expect(result.current.filteredUsers).toHaveLength(1);
			expect(result.current.filteredUsers[0]?.email).toBe("john@example.com");
		});

		it("should filter users by first name", () => {
			const { result } = renderHook(() => useUserSearch(mockUsers));

			act(() => {
				result.current.setSearchQuery("Jane");
			});

			expect(result.current.filteredUsers).toHaveLength(1);
			expect(result.current.filteredUsers[0]?.firstName).toBe("Jane");
		});

		it("should filter users by last name", () => {
			const { result } = renderHook(() => useUserSearch(mockUsers));

			act(() => {
				result.current.setSearchQuery("Doe");
			});

			expect(result.current.filteredUsers).toHaveLength(1);
			expect(result.current.filteredUsers[0]?.lastName).toBe("Doe");
		});

		it("should be case insensitive", () => {
			const { result } = renderHook(() => useUserSearch(mockUsers));

			act(() => {
				result.current.setSearchQuery("JOHN");
			});

			expect(result.current.filteredUsers).toHaveLength(1);
			expect(result.current.filteredUsers[0]?.firstName).toBe("John");
		});

		it("should handle partial matches", () => {
			const { result } = renderHook(() => useUserSearch(mockUsers));

			act(() => {
				result.current.setSearchQuery("ja");
			});

			expect(result.current.filteredUsers).toHaveLength(1);
			expect(result.current.filteredUsers[0]?.firstName).toBe("Jane");
		});

		it("should trim whitespace from search query", () => {
			const { result } = renderHook(() => useUserSearch(mockUsers));

			act(() => {
				result.current.setSearchQuery("  john  ");
			});

			expect(result.current.filteredUsers).toHaveLength(1);
			expect(result.current.filteredUsers[0]?.firstName).toBe("John");
		});

		it("should return empty array when no matches found", () => {
			const { result } = renderHook(() => useUserSearch(mockUsers));

			act(() => {
				result.current.setSearchQuery("nonexistent");
			});

			expect(result.current.filteredUsers).toHaveLength(0);
		});

		it("should return all users when search query is only whitespace", () => {
			const { result } = renderHook(() => useUserSearch(mockUsers));

			act(() => {
				result.current.setSearchQuery("   ");
			});

			expect(result.current.filteredUsers).toEqual(mockUsers);
		});

		it("should update filtered users when users list changes", () => {
			const { result, rerender } = renderHook(({ users }) => useUserSearch(users), {
				initialProps: { users: mockUsers },
			});

			expect(result.current.filteredUsers).toHaveLength(2);

			const newUsers: UserInviteDetails[] = [
				{
					id: "user-3",
					email: "alice@example.com",
					firstName: "Alice",
					lastName: "Johnson",
				},
			];

			rerender({ users: newUsers });

			expect(result.current.filteredUsers).toHaveLength(1);
			expect(result.current.filteredUsers[0]?.firstName).toBe("Alice");
		});

		it("should maintain search query when users list changes", () => {
			const { result, rerender } = renderHook(({ users }) => useUserSearch(users), {
				initialProps: { users: mockUsers },
			});

			act(() => {
				result.current.setSearchQuery("john");
			});

			expect(result.current.searchQuery).toBe("john");

			const newUsers: UserInviteDetails[] = [
				{
					id: "user-3",
					email: "johnny@example.com",
					firstName: "Johnny",
					lastName: "Bravo",
				},
			];

			rerender({ users: newUsers });

			expect(result.current.searchQuery).toBe("john");
			expect(result.current.filteredUsers).toHaveLength(1);
			expect(result.current.filteredUsers[0]?.firstName).toBe("Johnny");
		});

		it("should handle empty users array", () => {
			const { result } = renderHook(() => useUserSearch([]));

			act(() => {
				result.current.setSearchQuery("test");
			});

			expect(result.current.filteredUsers).toHaveLength(0);
		});

		it("should search across multiple fields simultaneously", () => {
			const users: UserInviteDetails[] = [
				{
					id: "user-1",
					email: "test@example.com",
					firstName: "Test",
					lastName: "User",
				},
				{
					id: "user-2",
					email: "another@test.com",
					firstName: "Another",
					lastName: "Person",
				},
			];

			const { result } = renderHook(() => useUserSearch(users));

			act(() => {
				result.current.setSearchQuery("test");
			});

			// Should match both users (one by email, one by email domain)
			expect(result.current.filteredUsers).toHaveLength(2);
		});
	});

	describe("Performance", () => {
		it("should handle large user lists efficiently", () => {
			const largeUserList: UserInviteDetails[] = Array.from({ length: 1000 }, (_, i) => ({
				id: `user-${i}`,
				email: `user${i}@example.com`,
				firstName: `First${i}`,
				lastName: `Last${i}`,
			}));

			const { result } = renderHook(() => useUserSearch(largeUserList));

			act(() => {
				result.current.setSearchQuery("user500");
			});

			expect(result.current.filteredUsers).toHaveLength(1);
			expect(result.current.filteredUsers[0]?.email).toBe("user500@example.com");
		});
	});
});
