import { useTeamAPI } from "@/module/teams/hooks/useTeam";
import { mockApiClient } from "@/tests/utils/mock-api-client";
import { wrapWithQueryClient } from "@/tests/utils/mock-providers";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TEAMS_TAB_TYPES, type InviteUserData, type InviteUsersData } from "@/module/teams/types";
import { ROLES, STATUS } from "@/types";

const mockTeamMembers = {
	data: [
		{
			_id: "user-1",
			email: "john@example.com",
			name: { first: "John", last: "Doe" },
			roles: ROLES.USER,
			status: STATUS.ACTIVE,
			createdAt: "2024-01-01T00:00:00.000Z",
			images: [],
		},
		{
			_id: "user-2",
			email: "jane@example.com",
			name: { first: "Jane", last: "Smith" },
			roles: ROLES.ADMIN,
			status: STATUS.ACTIVE,
			createdAt: "2024-01-02T00:00:00.000Z",
			images: [],
		},
	],
	pagination: {
		totalCount: 2,
		currentPage: 1,
		totalPages: 1,
		pageSize: 10,
	},
};

const mockInvitedUsers = {
	data: [
		{
			_id: "invited-1",
			invitedEmail: "invited@example.com",
			name: { first: "Invited", last: "User" },
			status: "INVITED",
			createdAt: "2024-01-03T00:00:00.000Z",
			expiry: 1234567890,
		},
	],
};

const mockUserCounts = {
	total: 10,
	active: 8,
	invited: 1,
	inActive: 1,
};

const wrapper = ({ children }: { children: React.ReactNode }) => wrapWithQueryClient(children);

describe("useTeamAPI hook", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("useInviteUser", () => {
		it("should invite a user successfully", async () => {
			const mockResponse = {
				data: {
					status: 200,
					message: "User invited successfully",
					data: {
						message: "Invitation sent",
						emails: ["newuser@example.com"],
					},
				},
			};

			mockApiClient.post.mockResolvedValue(mockResponse);

			const { result } = renderHook(
				() => {
					const { useInviteUser } = useTeamAPI();
					return useInviteUser;
				},
				{ wrapper }
			);

			const inviteData: InviteUserData = {
				email: "newuser@example.com",
				companyRef: "company-123",
			};

			const mutationResult = await result.current.mutateAsync(inviteData);

			expect(mutationResult).toEqual(mockResponse.data);
			expect(mockApiClient.post).toHaveBeenCalledWith("/admin/invite-users/", inviteData);
		});

		it("should handle error when inviting user", async () => {
			mockApiClient.post.mockRejectedValue({
				response: { data: { message: "User already exists" } },
			});

			const { result } = renderHook(
				() => {
					const { useInviteUser } = useTeamAPI();
					return useInviteUser;
				},
				{ wrapper }
			);

			const inviteData: InviteUserData = {
				email: "existing@example.com",
				companyRef: "company-123",
			};

			await expect(result.current.mutateAsync(inviteData)).rejects.toThrow();
		});

		it("should invite user without companyRef", async () => {
			const mockResponse = {
				data: {
					status: 200,
					message: "User invited",
					data: {
						message: "Invitation sent",
						emails: ["user@example.com"],
					},
				},
			};

			mockApiClient.post.mockResolvedValue(mockResponse);

			const { result } = renderHook(
				() => {
					const { useInviteUser } = useTeamAPI();
					return useInviteUser;
				},
				{ wrapper }
			);

			const inviteData: InviteUserData = {
				email: "user@example.com",
			};

			await result.current.mutateAsync(inviteData);

			expect(mockApiClient.post).toHaveBeenCalledWith("/admin/invite-users/", inviteData);
		});
	});

	describe("useInviteMultipleUser", () => {
		it("should invite multiple users successfully", async () => {
			const mockResponse = {
				data: {
					status: 200,
					message: "Users invited",
					data: {
						successfulInvites: 2,
						failedEmails: [],
						invitedUsers: [
							{
								email: "user1@example.com",
								data: { message: "Invited" },
							},
							{
								email: "user2@example.com",
								data: { message: "Invited" },
							},
						],
					},
				},
			};

			mockApiClient.post.mockResolvedValue(mockResponse);

			const { result } = renderHook(
				() => {
					const { useInviteMultipleUser } = useTeamAPI();
					return useInviteMultipleUser;
				},
				{ wrapper }
			);

			const inviteData: InviteUsersData = {
				users: [
					{ email: "user1@example.com", firstName: "User", lastName: "One" },
					{ email: "user2@example.com", firstName: "User", lastName: "Two" },
				],
				companyRef: "company-123",
			};

			const mutationResult = await result.current.mutateAsync(inviteData);

			expect(mutationResult).toEqual(mockResponse.data);
			expect(mockApiClient.post).toHaveBeenCalledWith("/admin/invite-users/users", inviteData);
		});

		it("should handle partial success when inviting multiple users", async () => {
			const mockResponse = {
				data: {
					status: 200,
					message: "Partial success",
					data: {
						successfulInvites: 1,
						failedEmails: ["invalid@example.com"],
						invitedUsers: [
							{
								email: "valid@example.com",
								data: { message: "Invited" },
							},
						],
					},
				},
			};

			mockApiClient.post.mockResolvedValue(mockResponse);

			const { result } = renderHook(
				() => {
					const { useInviteMultipleUser } = useTeamAPI();
					return useInviteMultipleUser;
				},
				{ wrapper }
			);

			const inviteData: InviteUsersData = {
				users: [
					{ email: "valid@example.com", firstName: "Valid", lastName: "User" },
					{ email: "invalid@example.com", firstName: "Invalid", lastName: "User" },
				],
				companyRef: "company-123",
			};

			const mutationResult = await result.current.mutateAsync(inviteData);

			expect(mutationResult.data.successfulInvites).toBe(1);
			expect(mutationResult.data.failedEmails).toContain("invalid@example.com");
		});

		it("should handle error when inviting multiple users", async () => {
			mockApiClient.post.mockRejectedValue({
				response: { data: { message: "Failed to invite users" } },
			});

			const { result } = renderHook(
				() => {
					const { useInviteMultipleUser } = useTeamAPI();
					return useInviteMultipleUser;
				},
				{ wrapper }
			);

			const inviteData: InviteUsersData = {
				users: [{ email: "test@example.com", firstName: "Test", lastName: "User" }],
				companyRef: "company-123",
			};

			await expect(result.current.mutateAsync(inviteData)).rejects.toThrow();
		});

		it("should return error object on failure", async () => {
			const mockError = {
				response: { data: { message: "Server error" } },
			};

			mockApiClient.post.mockRejectedValue(mockError);

			const { result } = renderHook(
				() => {
					const { useInviteMultipleUser } = useTeamAPI();
					return useInviteMultipleUser;
				},
				{ wrapper }
			);

			const inviteData: InviteUsersData = {
				users: [{ email: "test@example.com", firstName: "Test", lastName: "User" }],
			};

			try {
				await result.current.mutateAsync(inviteData);
			} catch (error) {
				expect(error).toBeDefined();
			}
		});
	});

	describe("useDeleteUser", () => {
		it("should delete user successfully", async () => {
			const mockResponse = {
				data: {
					message: "User deleted successfully",
				},
			};

			mockApiClient.post.mockResolvedValue(mockResponse);

			const { result } = renderHook(
				() => {
					const { useDeleteUser } = useTeamAPI();
					return useDeleteUser;
				},
				{ wrapper }
			);

			const deleteData = {
				userId: "user-123",
				Status: "DELETED",
				companyRef: "company-123",
			};

			const mutationResult = await result.current.mutateAsync(deleteData);

			expect(mutationResult).toEqual(mockResponse.data);
			expect(mockApiClient.post).toHaveBeenCalledWith("/admin/invite-users/user-123", {
				Status: "DELETED",
				companyRef: "company-123",
			});
		});

		it("should delete user without companyRef", async () => {
			const mockResponse = {
				data: {
					message: "User deleted",
				},
			};

			mockApiClient.post.mockResolvedValue(mockResponse);

			const { result } = renderHook(
				() => {
					const { useDeleteUser } = useTeamAPI();
					return useDeleteUser;
				},
				{ wrapper }
			);

			const deleteData = {
				userId: "user-456",
				Status: "DELETED",
			};

			await result.current.mutateAsync(deleteData);

			expect(mockApiClient.post).toHaveBeenCalledWith("/admin/invite-users/user-456", {
				Status: "DELETED",
				companyRef: undefined,
			});
		});

		it("should handle error when deleting user", async () => {
			mockApiClient.post.mockRejectedValue({
				response: { data: { message: "User not found" } },
			});

			const { result } = renderHook(
				() => {
					const { useDeleteUser } = useTeamAPI();
					return useDeleteUser;
				},
				{ wrapper }
			);

			const deleteData = {
				userId: "invalid-user",
				Status: "DELETED",
			};

			await expect(result.current.mutateAsync(deleteData)).rejects.toThrow();
		});
	});

	describe("useResendInvitationMutation", () => {
		it("should resend invitation successfully", async () => {
			const mockResponse = {
				data: {
					message: "Invitation resent successfully",
				},
			};

			mockApiClient.post.mockResolvedValue(mockResponse);

			const { result } = renderHook(
				() => {
					const { useResendInvitationMutation } = useTeamAPI();
					return useResendInvitationMutation;
				},
				{ wrapper }
			);

			const resendData = {
				email: "user@example.com",
				companyRef: "company-123",
			};

			const mutationResult = await result.current.mutateAsync(resendData);

			expect(mutationResult).toEqual(mockResponse.data);
			expect(mockApiClient.post).toHaveBeenCalledWith("/admin/invite-users/resend-invite", resendData);
		});

		it("should resend invitation without companyRef", async () => {
			const mockResponse = {
				data: {
					message: "Invitation resent",
				},
			};

			mockApiClient.post.mockResolvedValue(mockResponse);

			const { result } = renderHook(
				() => {
					const { useResendInvitationMutation } = useTeamAPI();
					return useResendInvitationMutation;
				},
				{ wrapper }
			);

			const resendData = {
				email: "user@example.com",
			};

			await result.current.mutateAsync(resendData);

			expect(mockApiClient.post).toHaveBeenCalledWith("/admin/invite-users/resend-invite", {
				email: "user@example.com",
				companyRef: undefined,
			});
		});

		it("should handle error when resending invitation", async () => {
			mockApiClient.post.mockRejectedValue({
				response: { data: { message: "Email not found" } },
			});

			const { result } = renderHook(
				() => {
					const { useResendInvitationMutation } = useTeamAPI();
					return useResendInvitationMutation;
				},
				{ wrapper }
			);

			const resendData = {
				email: "nonexistent@example.com",
				companyRef: "company-123",
			};

			await expect(result.current.mutateAsync(resendData)).rejects.toThrow();
		});
	});

	describe("useCancelInviteMutation", () => {
		it("should cancel invitation successfully", async () => {
			const mockResponse = {
				data: {
					message: "Invitation cancelled successfully",
				},
			};

			mockApiClient.post.mockResolvedValue(mockResponse);

			const { result } = renderHook(
				() => {
					const { useCancelInviteMutation } = useTeamAPI();
					return useCancelInviteMutation;
				},
				{ wrapper }
			);

			const cancelData = {
				userId: "user-123",
				companyRef: "company-123",
			};

			const mutationResult = await result.current.mutateAsync(cancelData);

			expect(mutationResult).toEqual(mockResponse.data);
			expect(mockApiClient.post).toHaveBeenCalledWith("/admin/invite-users/cancel-invite/user-123");
		});

		it("should cancel invitation without companyRef", async () => {
			const mockResponse = {
				data: {
					message: "Invitation cancelled",
				},
			};

			mockApiClient.post.mockResolvedValue(mockResponse);

			const { result } = renderHook(
				() => {
					const { useCancelInviteMutation } = useTeamAPI();
					return useCancelInviteMutation;
				},
				{ wrapper }
			);

			const cancelData = {
				userId: "user-456",
			};

			await result.current.mutateAsync(cancelData);

			expect(mockApiClient.post).toHaveBeenCalledWith("/admin/invite-users/cancel-invite/user-456");
		});

		it("should handle error when cancelling invitation", async () => {
			mockApiClient.post.mockRejectedValue({
				response: { data: { message: "Invitation not found" } },
			});

			const { result } = renderHook(
				() => {
					const { useCancelInviteMutation } = useTeamAPI();
					return useCancelInviteMutation;
				},
				{ wrapper }
			);

			const cancelData = {
				userId: "invalid-user",
			};

			await expect(result.current.mutateAsync(cancelData)).rejects.toThrow();
		});
	});

	describe("useUpdateStatusMutation", () => {
		it("should update user status successfully", async () => {
			const mockResponse = {
				data: {
					message: "Status updated successfully",
				},
			};

			mockApiClient.put.mockResolvedValue(mockResponse);

			const { result } = renderHook(
				() => {
					const { useUpdateStatusMutation } = useTeamAPI();
					return useUpdateStatusMutation;
				},
				{ wrapper }
			);

			const updateData = {
				userId: "user-123",
				status: STATUS.ACTIVE,
				companyRef: "company-123",
			};

			const mutationResult = await result.current.mutateAsync(updateData);

			expect(mutationResult).toEqual(mockResponse.data);
			expect(mockApiClient.put).toHaveBeenCalledWith("/admin/user/status/user-123", updateData);
		});

		it("should update status to different values", async () => {
			const statuses = [STATUS.ACTIVE, STATUS.INACTIVE];

			for (const status of statuses) {
				const mockResponse = {
					data: {
						message: `Status updated to ${status}`,
					},
				};

				mockApiClient.put.mockResolvedValue(mockResponse);

				const { result } = renderHook(
					() => {
						const { useUpdateStatusMutation } = useTeamAPI();
						return useUpdateStatusMutation;
					},
					{ wrapper }
				);

				const updateData = {
					userId: "user-123",
					status,
					companyRef: "company-123",
				};

				await result.current.mutateAsync(updateData);

				expect(mockApiClient.put).toHaveBeenCalledWith("/admin/user/status/user-123", updateData);
			}
		});

		it("should handle error when updating status", async () => {
			mockApiClient.put.mockRejectedValue({
				response: { data: { message: "Failed to update status" } },
			});

			const { result } = renderHook(
				() => {
					const { useUpdateStatusMutation } = useTeamAPI();
					return useUpdateStatusMutation;
				},
				{ wrapper }
			);

			const updateData = {
				userId: "user-123",
				status: STATUS.ACTIVE,
			};

			await expect(result.current.mutateAsync(updateData)).rejects.toThrow();
		});
	});

	describe("useUpdateRoleMutation", () => {
		it("should update user role successfully", async () => {
			const mockResponse = {
				data: {
					message: "Role updated successfully",
				},
			};

			mockApiClient.put.mockResolvedValue(mockResponse);

			const { result } = renderHook(
				() => {
					const { useUpdateRoleMutation } = useTeamAPI();
					return useUpdateRoleMutation;
				},
				{ wrapper }
			);

			const updateData = {
				userId: "user-123",
				role: ROLES.ADMIN,
				companyId: "company-123",
			};

			const mutationResult = await result.current.mutateAsync(updateData);

			expect(mutationResult).toEqual(mockResponse.data);
			expect(mockApiClient.put).toHaveBeenCalledWith("/admin/user/user-role/company-123", updateData);
		});

		it("should update role to different values", async () => {
			const roles = [ROLES.ADMIN, ROLES.USER];

			for (const role of roles) {
				const mockResponse = {
					data: {
						message: `Role updated to ${role}`,
					},
				};

				mockApiClient.put.mockResolvedValue(mockResponse);

				const { result } = renderHook(
					() => {
						const { useUpdateRoleMutation } = useTeamAPI();
						return useUpdateRoleMutation;
					},
					{ wrapper }
				);

				const updateData = {
					userId: "user-123",
					role,
					companyId: "company-123",
				};

				await result.current.mutateAsync(updateData);

				expect(mockApiClient.put).toHaveBeenCalledWith("/admin/user/user-role/company-123", updateData);
			}
		});

		it("should handle error when updating role", async () => {
			mockApiClient.put.mockRejectedValue({
				response: { data: { message: "Unauthorized" } },
			});

			const { result } = renderHook(
				() => {
					const { useUpdateRoleMutation } = useTeamAPI();
					return useUpdateRoleMutation;
				},
				{ wrapper }
			);

			const updateData = {
				userId: "user-123",
				role: ROLES.ADMIN,
				companyId: "company-123",
			};

			await expect(result.current.mutateAsync(updateData)).rejects.toThrow();
		});
	});

	describe("useGetInvitedUsers", () => {
		it("should fetch invited users successfully", async () => {
			const mockResponse = {
				data: mockInvitedUsers,
			};

			mockApiClient.get.mockResolvedValue(mockResponse);

			const { result } = renderHook(
				() => {
					const { useGetInvitedUsers } = useTeamAPI();
					return useGetInvitedUsers("company-123");
				},
				{ wrapper }
			);

			await waitFor(() => {
				expect(result.current.isPending).toBe(false);
			});

			expect(result.current.data).toEqual(mockInvitedUsers);
			expect(mockApiClient.get).toHaveBeenCalledWith("/admin/invite-users/", {
				params: { companyRef: "company-123" },
			});
		});

		it("should not fetch when companyRef is empty", async () => {
			const { result } = renderHook(
				() => {
					const { useGetInvitedUsers } = useTeamAPI();
					return useGetInvitedUsers("");
				},
				{ wrapper }
			);

			expect(mockApiClient.get).not.toHaveBeenCalled();
		});

		it("should handle empty invited users list", async () => {
			const mockResponse = {
				data: {
					data: [],
				},
			};

			mockApiClient.get.mockResolvedValue(mockResponse);

			const { result } = renderHook(
				() => {
					const { useGetInvitedUsers } = useTeamAPI();
					return useGetInvitedUsers("company-123");
				},
				{ wrapper }
			);

			await waitFor(() => {
				expect(result.current.data).toEqual({ data: [] });
			});
		});

		it("should handle error when fetching invited users", async () => {
			mockApiClient.get.mockRejectedValue(new Error("Network error"));

			const { result } = renderHook(
				() => {
					const { useGetInvitedUsers } = useTeamAPI();
					return useGetInvitedUsers("company-123");
				},
				{ wrapper }
			);

			await waitFor(() => {
				expect(result.current.isError).toBe(true);
				expect(result.current.error).toBeDefined();
			});
		});
	});

	describe("useGetTeamMembers", () => {
		it("should fetch team members successfully for USERS tab", async () => {
			const mockResponse = { data: { data: mockTeamMembers } };
			mockApiClient.get.mockResolvedValue(mockResponse);

			const { result } = renderHook(
				() => {
					const { useGetTeamMembers } = useTeamAPI();
					return useGetTeamMembers("company-123", TEAMS_TAB_TYPES.USERS);
				},
				{ wrapper }
			);

			await waitFor(() => {
				expect(result.current.isPending).toBe(false);
			});

			expect(result.current.data).toEqual(mockTeamMembers);
			expect(mockApiClient.get).toHaveBeenCalledWith(expect.stringContaining("/admin/invite-users/users/"));
		});

		it("should fetch invited users for INVITED_USERS tab", async () => {
			const mockResponse = { data: { data: mockInvitedUsers } };
			mockApiClient.get.mockResolvedValue(mockResponse);

			const { result } = renderHook(
				() => {
					const { useGetTeamMembers } = useTeamAPI();
					return useGetTeamMembers("company-123", TEAMS_TAB_TYPES.INVITED_USERS);
				},
				{ wrapper }
			);

			await waitFor(() => {
				expect(result.current.isPending).toBe(false);
			});

			expect(result.current.data).toEqual(mockInvitedUsers);
			expect(mockApiClient.get).toHaveBeenCalledWith(expect.stringContaining("/admin/invite-users/"));
		});

		it("should fetch team members with query string", async () => {
			const mockResponse = { data: { data: mockTeamMembers } };
			mockApiClient.get.mockResolvedValue(mockResponse);

			const queryString = "page=1&pageSize=10&search=john";

			const { result } = renderHook(
				() => {
					const { useGetTeamMembers } = useTeamAPI();
					return useGetTeamMembers("company-123", TEAMS_TAB_TYPES.USERS, queryString);
				},
				{ wrapper }
			);

			await waitFor(() => {
				expect(result.current.isPending).toBe(false);
			});

			expect(mockApiClient.get).toHaveBeenCalledWith(
				expect.stringContaining(`?${queryString}&companyRef=company-123&tab=users`)
			);
		});

		it("should fetch team members for ACTIVE_USERS tab", async () => {
			const mockResponse = { data: { data: mockTeamMembers } };
			mockApiClient.get.mockResolvedValue(mockResponse);

			const { result } = renderHook(
				() => {
					const { useGetTeamMembers } = useTeamAPI();
					return useGetTeamMembers("company-123", TEAMS_TAB_TYPES.ACTIVE_USERS);
				},
				{ wrapper }
			);

			await waitFor(() => {
				expect(result.current.isPending).toBe(false);
			});

			expect(mockApiClient.get).toHaveBeenCalledWith(expect.stringContaining("tab=active"));
		});

		it("should fetch team members for INACTIVE_USERS tab", async () => {
			const mockResponse = { data: { data: mockTeamMembers } };
			mockApiClient.get.mockResolvedValue(mockResponse);

			const { result } = renderHook(
				() => {
					const { useGetTeamMembers } = useTeamAPI();
					return useGetTeamMembers("company-123", TEAMS_TAB_TYPES.INACTIVE_USERS);
				},
				{ wrapper }
			);

			await waitFor(() => {
				expect(result.current.isPending).toBe(false);
			});

			expect(mockApiClient.get).toHaveBeenCalledWith(expect.stringContaining("tab=in-active-users"));
		});

		it("should not fetch when companyRef is empty", async () => {
			const { result } = renderHook(
				() => {
					const { useGetTeamMembers } = useTeamAPI();
					return useGetTeamMembers("", TEAMS_TAB_TYPES.USERS);
				},
				{ wrapper }
			);

			expect(mockApiClient.get).not.toHaveBeenCalled();
		});

		it("should handle error when fetching team members", async () => {
			mockApiClient.get.mockRejectedValue(new Error("Network error"));

			const { result } = renderHook(
				() => {
					const { useGetTeamMembers } = useTeamAPI();
					return useGetTeamMembers("company-123", TEAMS_TAB_TYPES.USERS);
				},
				{ wrapper }
			);

			await waitFor(() => {
				expect(result.current.isError).toBe(true);
				expect(result.current.error).toBeDefined();
			});
		});

		it("should use correct query key with different parameters", async () => {
			const mockResponse = { data: { data: mockTeamMembers } };
			mockApiClient.get.mockResolvedValue(mockResponse);

			const { result, rerender } = renderHook(
				({ companyRef, tab, query }) => {
					const { useGetTeamMembers } = useTeamAPI();
					return useGetTeamMembers(companyRef, tab, query);
				},
				{
					wrapper,
					initialProps: {
						companyRef: "company-123",
						tab: TEAMS_TAB_TYPES.USERS,
						query: "page=1",
					},
				}
			);

			await waitFor(() => {
				expect(result.current.isPending).toBe(false);
			});

			// Change parameters
			rerender({
				companyRef: "company-123",
				tab: TEAMS_TAB_TYPES.ACTIVE_USERS,
				query: "page=2",
			});

			await waitFor(() => {
				expect(mockApiClient.get).toHaveBeenCalledWith(expect.stringContaining("page=2"));
			});
		});
	});

	describe("useUsersCountQuery", () => {
		it("should fetch user counts successfully", async () => {
			const mockResponse = {
				data: {
					data: mockUserCounts,
				},
			};

			mockApiClient.get.mockResolvedValue(mockResponse);

			const { result } = renderHook(
				() => {
					const { useUsersCountQuery } = useTeamAPI();
					return useUsersCountQuery("company-123");
				},
				{ wrapper }
			);

			await waitFor(() => {
				expect(result.current.isPending).toBe(false);
			});

			expect(result.current.data).toEqual(mockUserCounts);
			expect(mockApiClient.get).toHaveBeenCalledWith("/admin/invite-users/users-count", {
				params: { companyRef: "company-123" },
			});
		});

		it("should not fetch when companyRef is empty", async () => {
			const { result } = renderHook(
				() => {
					const { useUsersCountQuery } = useTeamAPI();
					return useUsersCountQuery("");
				},
				{ wrapper }
			);

			expect(mockApiClient.get).not.toHaveBeenCalled();
		});

		it("should handle zero counts", async () => {
			const mockResponse = {
				data: {
					data: {
						total: 0,
						active: 0,
						invited: 0,
						inActive: 0,
					},
				},
			};

			mockApiClient.get.mockResolvedValue(mockResponse);

			const { result } = renderHook(
				() => {
					const { useUsersCountQuery } = useTeamAPI();
					return useUsersCountQuery("company-123");
				},
				{ wrapper }
			);

			await waitFor(() => {
				expect(result.current.data).toEqual({
					total: 0,
					active: 0,
					invited: 0,
					inActive: 0,
				});
			});
		});

		it("should handle error when fetching user counts", async () => {
			mockApiClient.get.mockRejectedValue(new Error("Failed to fetch counts"));

			const { result } = renderHook(
				() => {
					const { useUsersCountQuery } = useTeamAPI();
					return useUsersCountQuery("company-123");
				},
				{ wrapper }
			);

			await waitFor(() => {
				expect(result.current.isError).toBe(true);
				expect(result.current.error).toBeDefined();
			});
		});

		it("should refetch counts when companyRef changes", async () => {
			const mockResponse1 = {
				data: {
					data: mockUserCounts,
				},
			};

			const mockResponse2 = {
				data: {
					data: {
						total: 5,
						active: 4,
						invited: 0,
						inActive: 1,
					},
				},
			};

			mockApiClient.get.mockResolvedValueOnce(mockResponse1).mockResolvedValueOnce(mockResponse2);

			const { result, rerender } = renderHook(
				({ companyRef }) => {
					const { useUsersCountQuery } = useTeamAPI();
					return useUsersCountQuery(companyRef);
				},
				{
					wrapper,
					initialProps: { companyRef: "company-123" },
				}
			);

			await waitFor(() => {
				expect(result.current.data).toEqual(mockUserCounts);
			});

			// Change companyRef
			rerender({ companyRef: "company-456" });

			await waitFor(() => {
				expect(result.current.data).toEqual({
					total: 5,
					active: 4,
					invited: 0,
					inActive: 1,
				});
			});
		});
	});

	describe("API URL constants", () => {
		it("should use correct endpoints for all operations", async () => {
			const mockResponse = { data: { message: "Success" } };
			mockApiClient.post.mockResolvedValue(mockResponse);
			mockApiClient.put.mockResolvedValue(mockResponse);
			mockApiClient.get.mockResolvedValue({ data: mockTeamMembers });

			// Test invite user endpoint
			const { result: inviteResult } = renderHook(
				() => {
					const { useInviteUser } = useTeamAPI();
					return useInviteUser;
				},
				{ wrapper }
			);

			await inviteResult.current.mutateAsync({
				email: "test@example.com",
			});

			expect(mockApiClient.post).toHaveBeenCalledWith("/admin/invite-users/", expect.anything());

			// Test update status endpoint
			const { result: statusResult } = renderHook(
				() => {
					const { useUpdateStatusMutation } = useTeamAPI();
					return useUpdateStatusMutation;
				},
				{ wrapper }
			);

			await statusResult.current.mutateAsync({
				userId: "user-123",
				status: STATUS.ACTIVE,
				companyRef: "company-123",
			});

			expect(mockApiClient.put).toHaveBeenCalledWith("/admin/user/status/user-123", expect.anything());
		});
	});
});
