import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { routes } from "@/config/routes";
import { useRecentlyChangedRows } from "@/hooks/use-recently-changed-rows";
import { useProfileAPI } from "@/module/profile/hooks/useProfile";
import { useRolesApi } from "@/module/teams/hooks/useRoles";
import { type ActionsCellType, ACTION_TYPE, TEAMS_TAB_TYPES, USER_STATUS } from "@/module/teams/types/index";
import { useHandlers } from "@/module/teams/utils/handlers";
import { useQueryClient } from "@tanstack/react-query";
import { Eye, MailX, MoreHorizontal, ShieldAlert, Undo, UserCog, UserMinus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ActionsCell({ row, tabType, canManageTeams, currentUser }: ActionsCellType) {
	const queryClient = useQueryClient();
	const router = useRouter();

	const userId = row.original._id;
	const currentStatus = row.getValue("status");
	const currentRole = row.getValue("role") || (row.original.role as string);
	const email = row.original.email || row.original.invitedEmail;

	const { handleDelete, handleResendInvitation, handleChangeRole, handleUpdateStatus, handleDeleteInvitation } =
		useHandlers();

	const { useRoleList } = useRolesApi();
	const { data: roles } = useRoleList(canManageTeams);

	const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
	const [selectedRole, setSelectedRole] = useState<string>(String(currentRole));

	const { useForcePasswordChangeForUser } = useProfileAPI();
	const forcePasswordMutation = useForcePasswordChangeForUser();

	const isSelf = currentUser?._id === userId;
	const isOwner = currentUser?.companyRef?.userRef === userId;

	const rowId = row.id;

	const { addRow } = useRecentlyChangedRows();

	const invalidateQueries = async () => {
		await queryClient.invalidateQueries({
			predicate: (query) => query.queryKey.includes("team-members"),
		});
		void queryClient.invalidateQueries({ predicate: (query) => query.queryKey.includes("users-count") });
	};

	const runAction = async (name: ACTION_TYPE, fn: () => Promise<any>, refetch?: () => Promise<any>) => {
		try {
			await fn();

			if (refetch) void refetch();

			switch (name) {
				case ACTION_TYPE.DELETE:
					addRow("deleted", rowId);
					break;
				case ACTION_TYPE.CREATE:
					addRow("created", rowId);
					break;
				case ACTION_TYPE.UPDATE:
					addRow("updated", rowId);
					break;
				default:
					break;
			}
		} catch (err) {
			console.error(err);
			addRow("errors", rowId);
		}
	};

	const renderMenuItems = () => {
		switch (tabType) {
			case TEAMS_TAB_TYPES.INVITED_USERS:
				if (!canManageTeams) return null;
				return (
					<>
						<DropdownMenuItem
							data-testid="resend-invitation-menu-item"
							onClick={() => void runAction(ACTION_TYPE.UPDATE, () => handleResendInvitation(email))}
						>
							<Undo className="mr-2 h-4 w-4" />
							Resend Invitation
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => void runAction(ACTION_TYPE.DELETE, () => handleDeleteInvitation(email), invalidateQueries)}
							className="text-red-600"
							data-testid="cancel-invitation-menu-item"
						>
							<MailX className="mr-2 h-4 w-4" />
							Cancel Invitation
						</DropdownMenuItem>
					</>
				);
			case TEAMS_TAB_TYPES.INACTIVE_USERS:
				if (!canManageTeams) return null;
				return (
					<DropdownMenuItem
						onClick={() =>
							void runAction(
								ACTION_TYPE.UPDATE,
								() => handleUpdateStatus(userId, USER_STATUS.ACTIVE),
								invalidateQueries
							)
						}
						data-testid="activate-user-menu-item"
					>
						<UserCog className="mr-2 h-4 w-4" />
						Set user as active
					</DropdownMenuItem>
				);
			case TEAMS_TAB_TYPES.ACTIVE_USERS:
				return (
					<>
						<DropdownMenuItem
							data-testid="view-details-menu-item"
							onClick={() => router.push(routes.users.details(userId))}
						>
							<Eye className="mr-2 h-4 w-4" />
							View Details
						</DropdownMenuItem>
						{canManageTeams && (
							<>
								<DropdownMenuItem onClick={() => setIsRoleDialogOpen(true)} data-testid="change-role-menu-item">
									<UserCog className="mr-2 h-4 w-4" />
									Change Role
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => {
										const newStatus = currentStatus === USER_STATUS.ACTIVE ? USER_STATUS.INACTIVE : USER_STATUS.ACTIVE;

										void runAction(ACTION_TYPE.UPDATE, () => handleUpdateStatus(userId, newStatus), invalidateQueries);
									}}
									data-testid="change-status-menu-item"
								>
									<UserCog className="mr-2 h-4 w-4" />
									Set user as {currentStatus === USER_STATUS.ACTIVE ? USER_STATUS.INACTIVE : USER_STATUS.ACTIVE}
								</DropdownMenuItem>
								<DropdownMenuItem data-testid="impersonate-user-menu-item">
									<UserCog className="mr-2 h-4 w-4" />
									Impersonate User
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() =>
										void runAction(
											ACTION_TYPE.UPDATE,
											() => handleDelete(userId, USER_STATUS.DELETED),
											invalidateQueries
										)
									}
									className="text-red-600"
									data-testid="remove-user-menu-item"
								>
									<UserMinus className="mr-2 h-4 w-4" />
									Remove User
								</DropdownMenuItem>
								{!isSelf && !isOwner && (
									<DropdownMenuItem
										onClick={() => void runAction(ACTION_TYPE.UPDATE, () => forcePasswordMutation.mutateAsync(userId))}
										className="text-orange-600"
										data-testid="force-password-change-menu-item"
									>
										<ShieldAlert className="mr-2 h-4 w-4" />
										Force Password Change
									</DropdownMenuItem>
								)}
							</>
						)}
					</>
				);
			case TEAMS_TAB_TYPES.USERS:
			default:
				if (currentStatus === USER_STATUS.PENDING) {
					if (!canManageTeams) return null;
					return (
						<>
							<DropdownMenuItem
								onClick={() => void runAction(ACTION_TYPE.CREATE, () => handleResendInvitation(email))}
								data-testid="resend-invitation-menu-item"
							>
								<Undo className="mr-2 h-4 w-4" />
								Resend Invitation
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() =>
									void runAction(ACTION_TYPE.UPDATE, () => handleDeleteInvitation(userId), invalidateQueries)
								}
								className="text-red-600"
								data-testid="cancel-invitation-menu-item"
							>
								<MailX className="mr-2 h-4 w-4" />
								Cancel Invitation
							</DropdownMenuItem>
						</>
					);
				}

				if (currentStatus === USER_STATUS.INACTIVE) {
					if (!canManageTeams) return null;
					return (
						<DropdownMenuItem
							onClick={() =>
								void runAction(
									ACTION_TYPE.UPDATE,
									() => handleUpdateStatus(userId, USER_STATUS.ACTIVE),
									invalidateQueries
								)
							}
							data-testid="activate-user-menu-item"
						>
							<UserCog className="mr-2 h-4 w-4" />
							Set user as active
						</DropdownMenuItem>
					);
				}

				return (
					<>
						<DropdownMenuItem
							onClick={() => router.push(routes.users.details(userId))}
							data-testid="view-details-menu-item"
						>
							<Eye className="mr-2 h-4 w-4" />
							View Details
						</DropdownMenuItem>
						{canManageTeams && (
							<>
								<DropdownMenuItem onClick={() => setIsRoleDialogOpen(true)} data-testid="change-role-menu-item">
									<UserCog className="mr-2 h-4 w-4" />
									Change Role
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => {
										const newStatus = currentStatus === USER_STATUS.ACTIVE ? USER_STATUS.INACTIVE : USER_STATUS.ACTIVE;

										void runAction(ACTION_TYPE.UPDATE, () => handleUpdateStatus(userId, newStatus), invalidateQueries);
									}}
									data-testid="change-status-menu-item"
								>
									<UserCog className="mr-2 h-4 w-4" />
									Set user as inactive
								</DropdownMenuItem>
								<DropdownMenuItem data-testid="impersonate-user-menu-item">
									<UserCog className="mr-2 h-4 w-4" />
									Impersonate User
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() =>
										void runAction(
											ACTION_TYPE.UPDATE,
											() => handleDelete(userId, USER_STATUS.DELETED),
											invalidateQueries
										)
									}
									className="text-red-600"
									data-testid="remove-user-menu-item"
								>
									<UserMinus className="mr-2 h-4 w-4" />
									Remove User
								</DropdownMenuItem>
								{!isSelf && !isOwner && (
									<DropdownMenuItem
										onClick={() => void runAction(ACTION_TYPE.UPDATE, () => forcePasswordMutation.mutateAsync(userId))}
										className="text-orange-600"
										data-testid="force-password-change-menu-item"
									>
										<ShieldAlert className="mr-2 h-4 w-4" />
										Force Password Change
									</DropdownMenuItem>
								)}
							</>
						)}
					</>
				);
		}
	};

	const menuItems = renderMenuItems();

	if (!menuItems || isSelf) return null;

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button data-testid="action-cell-button" variant="ghost" className="h-8 w-8 p-0">
						<span className="sr-only">Open menu</span>
						<MoreHorizontal className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent data-testid="dropdown-content" align="end" className="w-52">
					{menuItems}
				</DropdownMenuContent>
			</DropdownMenu>

			{canManageTeams && (
				<Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Change User Role</DialogTitle>
							<DialogDescription>
								Select a new role for {row.original.name.first} {row.original.name.last}.
							</DialogDescription>
						</DialogHeader>
						<div className="py-4">
							<Select value={selectedRole} onValueChange={setSelectedRole}>
								<SelectTrigger>
									<SelectValue placeholder="Select a role" />
								</SelectTrigger>
								<SelectContent>
									{roles?.map((role) => (
										<SelectItem key={role.id} value={role.slug}>
											{role.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
								Cancel
							</Button>
							<Button
								onClick={() => {
									void runAction(ACTION_TYPE.UPDATE, () => handleChangeRole(userId, selectedRole), invalidateQueries);
									setIsRoleDialogOpen(false);
								}}
							>
								Save changes
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}
		</>
	);
}
