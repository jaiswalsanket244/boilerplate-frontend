import { apiClient } from "@/lib/api";
import { mockUserData, wrapper } from "@/module/profile/__tests__/utils";
import { useImageUpload, useProfileForm, useProfileSubmit } from "@/module/profile/hooks/useProfileForm";
import { mockGet, mockPut } from "@/tests/utils/mock-api-client";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("useProfileForm", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should initialize form with empty values", () => {
		vi.mocked(apiClient.get).mockResolvedValue({
			data: { data: null },
		});

		const { result } = renderHook(() => useProfileForm(), {
			wrapper,
		});

		expect(result.current.form.getValues()).toEqual({
			firstName: "",
			lastName: "",
			email: "",
		});
	});

	it("should populate form with user data when loaded", async () => {
		vi.mocked(apiClient.get).mockResolvedValue({
			data: { data: mockUserData },
		});

		const { result } = renderHook(() => useProfileForm(), {
			wrapper,
		});

		await waitFor(() => {
			expect(result.current.form.getValues()).toEqual({
				firstName: "John",
				lastName: "Doe",
				email: "john.doe@example.com",
			});
		});
	});

	it("should mark as loading while fetching", () => {
		vi.mocked(apiClient.get).mockImplementation(() => new Promise(() => {}));

		const { result } = renderHook(() => useProfileForm(), {
			wrapper,
		});

		expect(result.current.isLoading).toBe(true);
	});

	it("should handle missing name fields", async () => {
		vi.mocked(apiClient.get).mockResolvedValue({
			data: {
				data: {
					...mockUserData,
					name: { first: null, last: null },
				},
			},
		});

		const { result } = renderHook(() => useProfileForm(), {
			wrapper,
		});

		await waitFor(() => {
			expect(result.current.form.getValues().firstName).toBe("");
			expect(result.current.form.getValues().lastName).toBe("");
		});
	});
});

const mockRevokeObjectURL = vi.fn();

URL.revokeObjectURL = mockRevokeObjectURL;

describe("useImageUpload", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		URL.createObjectURL = vi.fn(() => "blob:mock-url");
	});

	it("should initialize with null values when no user data", () => {
		vi.mocked(apiClient.get).mockResolvedValue({
			data: { data: null },
		});

		const { result } = renderHook(() => useImageUpload(), {
			wrapper,
		});

		expect(result.current.file).toBeNull();
		expect(result.current.previewUrl).toBeNull();
	});

	it("should set preview URL from user images", async () => {
		vi.mocked(apiClient.get).mockResolvedValue({
			data: { data: mockUserData },
		});

		const { result } = renderHook(() => useImageUpload(), {
			wrapper,
		});

		await waitFor(() => {
			expect(result.current.previewUrl).toBe("https://example.com/avatar.jpg");
		});
	});

	it("should handle file selection", async () => {
		vi.mocked(apiClient.get).mockResolvedValue({
			data: { data: mockUserData },
		});

		const { result } = renderHook(() => useImageUpload(), {
			wrapper,
		});

		await waitFor(() => {
			expect(result.current.previewUrl).toBe("https://example.com/avatar.jpg");
		});

		const mockFile = new File([""], "test.jpg", { type: "image/jpeg" });
		await waitFor(() => {
			result.current.selectFile(mockFile, "blob:new-preview");
		});

		await waitFor(() => {
			expect(result.current.file).toBe(mockFile);
			expect(result.current.previewUrl).toBe("blob:new-preview");
		});

		expect(mockRevokeObjectURL).not.toHaveBeenCalledWith("https://example.com/avatar.jpg");
	});

	it("should revoke blob URLs when selecting new file", async () => {
		vi.mocked(apiClient.get).mockResolvedValue({
			data: { data: { images: [] } },
		});

		// const revokeSpy = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

		const { result } = renderHook(() => useImageUpload(), { wrapper });

		// FIRST FILE
		act(() => {
			result.current.selectFile(new File([""], "test1.jpg", { type: "image/jpeg" }), "blob:preview-1");
		});

		expect(result.current.previewUrl).toBe("blob:preview-1");

		// SECOND FILE
		act(() => {
			result.current.selectFile(new File([""], "test2.jpg", { type: "image/jpeg" }), "blob:preview-2");
		});

		expect(result.current.previewUrl).toBe("blob:preview-2");

		// ASSERT
		expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:preview-1");
	});

	it("should remove file and preview", () => {
		vi.mocked(apiClient.get).mockResolvedValue({
			data: { data: null },
		});

		const { result } = renderHook(() => useImageUpload(), {
			wrapper,
		});

		const mockFile = new File([""], "test.jpg", { type: "image/jpeg" });
		act(() => {
			result.current.selectFile(mockFile, "blob:preview");
		});

		act(() => {
			result.current.removeFile();
		});

		expect(result.current.file).toBeNull();
		expect(result.current.previewUrl).toBeNull();
		expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview");
	});

	it("should upload file to S3 with presigned URL", async () => {
		const mockPresignedUrl = "https://s3.amazonaws.com/presigned";
		const mockKeyFile = "images/test-123.jpg";

		vi.mocked(apiClient.get).mockResolvedValue({
			data: { data: null },
		});

		vi.mocked(apiClient.post).mockResolvedValue({
			data: {
				data: {
					url: mockPresignedUrl,
					keyFile: mockKeyFile,
				},
			},
		});

		global.fetch = vi.fn().mockResolvedValue({ ok: true });

		const { result } = renderHook(() => useImageUpload(), {
			wrapper,
		});

		const mockFile = new File(["content"], "test.jpg", { type: "image/jpeg" });

		act(() => {
			result.current.selectFile(mockFile, "blob:preview");
		});

		const uploadedUrl = await result.current.uploadToS3();

		expect(apiClient.post).toHaveBeenCalledWith("/aws/presigned-url", {
			fileName: "test.jpg",
			fileType: "image/jpeg",
		});

		expect(global.fetch).toHaveBeenCalledWith(mockPresignedUrl, {
			method: "PUT",
			headers: { "Content-Type": "image/jpeg" },
			body: mockFile,
		});

		expect(uploadedUrl).toBe(`https://boilerplate-s3-bucket.s3.us-east-2.amazonaws.com/${mockKeyFile}`);
		await waitFor(() => {
			expect(result.current.file).toBeNull();
		});
	});

	it("should return null when uploading without file", async () => {
		vi.mocked(apiClient.get).mockResolvedValue({
			data: { data: null },
		});

		const { result } = renderHook(() => useImageUpload(), {
			wrapper,
		});

		const uploadedUrl = await result.current.uploadToS3();

		expect(uploadedUrl).toBeNull();
		expect(apiClient.post).not.toHaveBeenCalled();
	});

	it("should handle empty images array", async () => {
		vi.mocked(apiClient.get).mockResolvedValue({
			data: { data: { ...mockUserData, images: [] } },
		});

		const { result } = renderHook(() => useImageUpload(), {
			wrapper,
		});

		await waitFor(() => {
			expect(result.current.previewUrl).toBeNull();
		});
	});
});

const formData = {
	firstName: "Jane",
	lastName: "Smith",
	email: "jane@example.com",
};

describe("useProfileSubmit hook", () => {
	const mockUploadToS3 = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		mockUploadToS3.mockResolvedValue(null);

		mockGet.mockResolvedValue({
			data: { data: mockUserData },
		});
	});

	it("should submit profile update successfully", async () => {
		mockPut.mockResolvedValue({
			data: { success: true },
		});

		const { result } = renderHook(() => useProfileSubmit({ uploadToS3: mockUploadToS3 }), { wrapper });

		await waitFor(() => {
			expect(result.current.isPending).toBe(false);
		});

		await waitFor(() => result.current.submit(formData));

		expect(mockPut).toHaveBeenCalledWith("/user/profile", {
			name: {
				first: "Jane",
				last: "Smith",
			},
		});

		await waitFor(() => {
			expect(result.current.status.isSuccess).toBe(true);
			expect(result.current.status.error).toBe("");
		});
	});

	it("should upload image before profile update", async () => {
		const mockImageUrl = "https://boilerplate-s3-bucket.s3.us-east-2.amazonaws.com/images/test.jpg";
		mockUploadToS3.mockResolvedValue(mockImageUrl);

		vi.mocked(apiClient.put).mockResolvedValue({
			data: { success: true },
		});

		const { result } = renderHook(() => useProfileSubmit({ uploadToS3: mockUploadToS3 }), { wrapper });

		await waitFor(() => {
			expect(result.current.isPending).toBe(false);
		});

		await waitFor(() => result.current.submit(formData));

		await waitFor(() => {
			expect(mockUploadToS3).toHaveBeenCalled();
		});

		expect(apiClient.put).toHaveBeenCalledWith("/user/profile", {
			name: {
				first: "Jane",
				last: "Smith",
			},
			images: mockImageUrl,
		});
	});

	it("should handle submission error with API error message", async () => {
		const errorMessage = "Email already exists";
		vi.mocked(apiClient.put).mockRejectedValue({
			response: {
				data: { message: errorMessage },
			},
		});

		const { result } = renderHook(() => useProfileSubmit({ uploadToS3: mockUploadToS3 }), { wrapper });

		await waitFor(() => {
			expect(result.current.isPending).toBe(false);
		});

		await waitFor(() => result.current.submit(formData));

		await waitFor(() => {
			expect(result.current.status.isSuccess).toBe(false);
			expect(result.current.status.error).toBe(errorMessage);
		});
	});

	it("should handle submission error with generic Error", async () => {
		vi.mocked(apiClient.put).mockRejectedValue(new Error("Network error"));

		const { result } = renderHook(() => useProfileSubmit({ uploadToS3: mockUploadToS3 }), { wrapper });

		await waitFor(() => {
			expect(result.current.isPending).toBe(false);
		});

		await waitFor(() => result.current.submit(formData));

		await waitFor(() => {
			expect(result.current.status.error).toBe("Network error");
		});
	});

	it("should handle unknown error type", async () => {
		vi.mocked(apiClient.put).mockRejectedValue("Unknown error");

		const { result } = renderHook(() => useProfileSubmit({ uploadToS3: mockUploadToS3 }), { wrapper });

		await waitFor(() => {
			expect(result.current.isPending).toBe(false);
		});

		await waitFor(() => result.current.submit(formData));
		await waitFor(() => {
			expect(result.current.status.error).toBe("Something went wrong");
		});
	});

	it("should return early when user or companyRef is missing", async () => {
		vi.mocked(apiClient.get).mockResolvedValue({
			data: { data: { ...mockUserData, companyRef: null } },
		});

		const { result } = renderHook(() => useProfileSubmit({ uploadToS3: mockUploadToS3 }), { wrapper });

		await waitFor(() => {
			expect(result.current.isPending).toBe(false);
		});

		await waitFor(() => result.current.submit(formData));
		expect(apiClient.put).not.toHaveBeenCalled();
	});

	it("should clear success status after 3 seconds", async () => {
		vi.useFakeTimers({ shouldAdvanceTime: true });
		vi.mocked(apiClient.put).mockResolvedValue({
			data: { success: true },
		});

		const { result } = renderHook(() => useProfileSubmit({ uploadToS3: mockUploadToS3 }), { wrapper });

		await waitFor(() => {
			expect(result.current.isPending).toBe(false);
		});

		await waitFor(() => result.current.submit(formData));

		await waitFor(() => {
			expect(result.current.status.isSuccess).toBe(true);
		});

		act(() => {
			vi.advanceTimersByTime(3000);
		});

		await waitFor(() => {
			expect(result.current.status.isSuccess).toBe(false);
			expect(result.current.status.error).toBe("");
		});

		vi.useRealTimers();
	});
});
