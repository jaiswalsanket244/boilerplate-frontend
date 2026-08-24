"use client";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRolesApi } from "@/module/teams/hooks/useRoles";
import type { IRoleActionsMenuProps } from "@/module/teams/types";
import { useQueryClient } from "@tanstack/react-query";
import { MoreVertical, PencilLine, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function RoleActionsMenu({ role, onEdit }: IRoleActionsMenuProps) {
	const queryClient = useQueryClient();
	const { useDeleteRoleMutation } = useRolesApi();
	const deleteRoleMutation = useDeleteRoleMutation();
	const [error, setError] = useState("");
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	const handleDelete = async () => {
		setError("");
		deleteRoleMutation.mutate(role.slug, {
			onSuccess: async () => {
				await queryClient.invalidateQueries({ queryKey: ["roles"] });
				setIsDeleteDialogOpen(false);
			},
			onError: (error) => {
				setError(error.response?.data?.message || "Unable to delete the role.");
			},
		});
	};

	return (
		<div className="space-y-1 text-right">
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
						<MoreVertical className="h-4 w-4" />
						<span className="sr-only">Open actions for {role.name}</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem onClick={() => onEdit(role)} disabled={role.type === "EnvironmentRole"}>
						<PencilLine className="h-4 w-4" />
						Edit role
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => setIsDeleteDialogOpen(true)}
						className="text-destructive focus:text-destructive"
						disabled={role.type === "EnvironmentRole" || deleteRoleMutation.isPending}
					>
						<Trash2 className="h-4 w-4" />
						Delete role
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the{" "}
							<span className="text-primary font-semibold">&quot;{role.name}&quot;</span> role.
						</AlertDialogDescription>
						{error ? <p className="mt-1 text-xs text-red-500">{error}</p> : null}
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={deleteRoleMutation.isPending}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={(e) => {
								e.preventDefault();
								void handleDelete();
							}}
							disabled={deleteRoleMutation.isPending}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{deleteRoleMutation.isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Deleting...
								</>
							) : (
								"Delete Role"
							)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
