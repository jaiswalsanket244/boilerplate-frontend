import { apiClient } from "@/lib/api";
import { useProfileAPI } from "@/module/profile/hooks/useProfile";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockUserData, wrapper } from "@/module/profile/__tests__/utils";

describe("useProfileAPI hook", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("useGetUserData", () => {
		it("should fetch user data successfully", async () => {
			vi.mocked(apiClient.get).mockResolvedValue({
				data: { data: mockUserData },
			});

			const { result } = renderHook(
				() => {
					const { useGetUserData } = useProfileAPI();
					return useGetUserData();
				},
				{ wrapper }
			);

			await waitFor(() => {
				expect(result.current.data).toEqual(mockUserData);
			});

			expect(apiClient.get).toHaveBeenCalledWith("/user/me");
		});

		it("should handle error when fetching user data", async () => {
			vi.mocked(apiClient.get).mockRejectedValue(new Error("Network error"));

			const { result } = renderHook(
				() => {
					const { useGetUserData } = useProfileAPI();
					return useGetUserData();
				},
				{ wrapper }
			);

			await waitFor(() => {
				expect(result.current.isPending).toBe(false);
			});

			await waitFor(() => {
				expect(result.current.isError).toBe(true);
			});
		});
	});

	describe("useNotifications", () => {
		it("should fetch notifications for user", async () => {
			const mockNotifications = [
				{ id: "1", message: "Notification 1" },
				{ id: "2", message: "Notification 2" },
			];

			vi.mocked(apiClient.get).mockResolvedValue({
				data: { data: mockNotifications },
			});

			const { result } = renderHook(
				() => {
					const { useNotifications } = useProfileAPI();
					return useNotifications("user-123");
				},
				{ wrapper }
			);

			await waitFor(() => {
				expect(result.current.isPending).toBe(false);
			});

			await waitFor(() => {
				expect(result.current.data).toEqual(mockNotifications);
			});

			expect(apiClient.get).toHaveBeenCalledWith("/notification/user-123");
		});

		it("should not fetch when userId is empty", () => {
			const { result } = renderHook(
				() => {
					const { useNotifications } = useProfileAPI();
					return useNotifications("");
				},
				{ wrapper }
			);

			expect(result.current.fetchStatus).toBe("idle");
			expect(apiClient.get).not.toHaveBeenCalled();
		});
	});

	describe("useChangePassword", () => {
		const passwordData = {
			currentPassword: "oldpass",
			newPassword: "newpass",
			confirmedPassword: "newpass",
			email: "john.doe@example.com",
		};
		it("should change password successfully", async () => {
			const mockResponse = { success: true, message: "Password changed" };
			vi.mocked(apiClient.post).mockResolvedValue({
				data: mockResponse,
			});

			const { result } = renderHook(
				() => {
					const { useChangePassword } = useProfileAPI();
					return useChangePassword;
				},
				{ wrapper }
			);

			const mutationResult = await result.current.mutateAsync(passwordData);

			expect(mutationResult).toEqual(mockResponse);
			expect(apiClient.post).toHaveBeenCalledWith("/user/change-password", passwordData);
		});

		it("should handle password change error", async () => {
			vi.mocked(apiClient.post).mockRejectedValue({
				response: { data: { message: "Incorrect password" } },
			});

			const { result } = renderHook(
				() => {
					const { useChangePassword } = useProfileAPI();
					return useChangePassword;
				},
				{ wrapper }
			);

			await expect(
				result.current.mutateAsync({
					...passwordData,
					currentPassword: "wrong",
				})
			).rejects.toThrow();
		});
	});

	describe("useUpdateProfile", () => {
		it("should update profile successfully", async () => {
			const mockResponse = { success: true, data: { updated: true } };
			vi.mocked(apiClient.put).mockResolvedValue({
				data: mockResponse,
			});

			const { result } = renderHook(
				() => {
					const { useUpdateProfile } = useProfileAPI();
					return useUpdateProfile;
				},
				{ wrapper }
			);

			const updateData = {
				name: { first: "Jane", last: "Doe" },
			};

			const mutationResult = await result.current.mutateAsync(updateData);

			expect(mutationResult).toEqual(mockResponse);
			expect(apiClient.put).toHaveBeenCalledWith("/user/profile", updateData);
		});

		it("should handle profile update with images", async () => {
			const mockResponse = { success: true };
			vi.mocked(apiClient.put).mockResolvedValue({
				data: mockResponse,
			});

			const { result } = renderHook(
				() => {
					const { useUpdateProfile } = useProfileAPI();
					return useUpdateProfile;
				},
				{ wrapper }
			);

			const updateData = {
				name: { first: "Jane", last: "Doe" },
				images: "https://s3.amazonaws.com/image.jpg",
			};

			await result.current.mutateAsync(updateData);

			expect(apiClient.put).toHaveBeenCalledWith("/user/profile", updateData);
		});
	});

	describe("useUpdateProfileById", () => {
		it("should update profile by id as admin", async () => {
			const mockResponse = { data: { success: true } };
			vi.mocked(apiClient.put).mockResolvedValue(mockResponse);

			const { result } = renderHook(
				() => {
					const { useUpdateProfileById } = useProfileAPI();
					return useUpdateProfileById;
				},
				{ wrapper }
			);

			const args = {
				id: "user-456",
				update: { name: { first: "Updated", last: "Name" } },
				companyRef: "company-789",
			};

			const mutationResult = await result.current.mutateAsync(args);

			expect(mutationResult).toEqual(mockResponse);
			expect(apiClient.put).toHaveBeenCalledWith("/super-admin/user/user-profile/user-456", {
				update: args.update,
				companyRef: args.companyRef,
			});
		});
	});

	describe("useChangePasswordById", () => {
		it("should change password by id as admin", async () => {
			const mockResponse = { data: { success: true } };
			vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

			const { result } = renderHook(
				() => {
					const { useChangePasswordById } = useProfileAPI();
					return useChangePasswordById;
				},
				{ wrapper }
			);
			const args = {
				id: "user-456",
				data: { newPassword: "newpass123", confirmedPassword: "newpass123", currentPassword: "oldpass123" },
			};

			const mutationResult = await result.current.mutateAsync(args);

			expect(mutationResult).toEqual(mockResponse);
			expect(apiClient.post).toHaveBeenCalledWith("/super-admin/user/change-password/user-456", args.data);
		});
	});

	describe("useGetSignedUrl", () => {
		it("should get presigned URL for S3 upload", async () => {
			const mockResponse = {
				data: {
					data: {
						url: "https://s3.amazonaws.com/presigned",
						keyFile: "images/file-123.jpg",
					},
				},
			};

			vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

			const { result } = renderHook(
				() => {
					const { useGetSignedUrl } = useProfileAPI();
					return useGetSignedUrl;
				},
				{ wrapper }
			);
			const requestData = {
				fileName: "test.jpg",
				fileType: "image/jpeg",
			};

			const mutationResult = await result.current.mutateAsync(requestData);

			expect(mutationResult).toEqual(mockResponse.data);
			expect(apiClient.post).toHaveBeenCalledWith("/aws/presigned-url", requestData);
		});

		it("should handle different file types", async () => {
			const mockResponse = {
				data: {
					data: {
						url: "https://s3.amazonaws.com/presigned",
						keyFile: "images/file-123.png",
					},
				},
			};

			vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

			const { result } = renderHook(
				() => {
					const { useGetSignedUrl } = useProfileAPI();
					return useGetSignedUrl;
				},
				{ wrapper }
			);

			await result.current.mutateAsync({
				fileName: "test.png",
				fileType: "image/png",
			});

			expect(apiClient.post).toHaveBeenCalledWith("/aws/presigned-url", {
				fileName: "test.png",
				fileType: "image/png",
			});
		});
	});

	describe("useUpdateCompany", () => {
		it("should update company successfully", async () => {
			const mockCompanyData = { _id: "company-123", supportEmail: "new@company.com" };
			vi.mocked(apiClient.put).mockResolvedValue({
				data: { data: mockCompanyData },
			});

			const { result } = renderHook(
				() => {
					const { useUpdateCompany } = useProfileAPI();
					return useUpdateCompany;
				},
				{ wrapper }
			);

			const updateData = {
				id: "company-123",
				data: { supportEmail: "new@company.com" },
			};

			const mutationResult = await result.current.mutateAsync(updateData);

			expect(mutationResult).toEqual(mockCompanyData);
			expect(apiClient.put).toHaveBeenCalledWith("/admin/company/company-123", { supportEmail: "new@company.com" });
		});

		it("should handle partial company updates", async () => {
			vi.mocked(apiClient.put).mockResolvedValue({
				data: { data: { updated: true } },
			});

			const { result } = renderHook(
				() => {
					const { useUpdateCompany } = useProfileAPI();
					return useUpdateCompany;
				},
				{ wrapper }
			);
			await result.current.mutateAsync({
				id: "company-123",
				data: { name: "New Company Name" },
			});

			expect(apiClient.put).toHaveBeenCalledWith("/admin/company/company-123", { name: "New Company Name" });
		});

		it("should handle company update errors", async () => {
			vi.mocked(apiClient.put).mockRejectedValue({
				response: { data: { message: "Company not found" } },
			});

			const { result } = renderHook(
				() => {
					const { useUpdateCompany } = useProfileAPI();
					return useUpdateCompany;
				},
				{ wrapper }
			);

			await expect(
				result.current.mutateAsync({
					id: "invalid-id",
					data: { supportEmail: "test@test.com" },
				})
			).rejects.toThrow();
		});
	});
});
