"use client";

import { DataTable } from "@/components/common/table/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { RoleActionsMenu } from "@/module/teams/components/role-actions-menu";
import { useRolesApi } from "@/module/teams/hooks/useRoles";
import RoleFormView from "@/module/teams/templates/role-form";
import { ROLE_FORM_MODE, type IRole } from "@/module/teams/types";
import { getRolePermissionCountLabel } from "@/module/teams/utils/roles";
import { ROLES } from "@/types";
import type { ColumnDef } from "@tanstack/react-table";
import { Loader2, Search } from "lucide-react";
import { useMemo, useState } from "react";

export default function RolesListView() {
	const [searchTerm, setSearchTerm] = useState("");
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [selectedRole, setSelectedRole] = useState<IRole | null>(null);
	const [mode, setMode] = useState<ROLE_FORM_MODE>(ROLE_FORM_MODE.CREATE);

	const { useRoleList } = useRolesApi();
	const { data: roles, isLoading, isError } = useRoleList(true);

	const filteredRoles = useMemo(() => {
		const normalizedTerm = searchTerm.trim().toLowerCase();
		const rolesList = roles ?? [];

		if (!normalizedTerm) {
			return rolesList;
		}

		return rolesList.filter((role) =>
			`${role.name} ${role.slug} ${role.description} ${role.resourceTypeSlug}`.toLowerCase().includes(normalizedTerm)
		);
	}, [roles, searchTerm]);

	const handleCreate = () => {
		setSelectedRole(null);
		setMode(ROLE_FORM_MODE.CREATE);
		setIsFormOpen(true);
	};

	const handleEdit = (role: IRole) => {
		setSelectedRole(role);
		setMode(ROLE_FORM_MODE.EDIT);
		setIsFormOpen(true);
	};

	const handleCloseForm = () => {
		setIsFormOpen(false);
		setSelectedRole(null);
	};

	const getSlugBadgeClass = (slug: string) => {
		const base = "rounded-full px-3 py-0.5 text-[13px] font-medium border-none shadow-none";

		switch (slug.toLowerCase()) {
			case ROLES.USER:
				return cn(base, "bg-blue-50 text-blue-600");
			case ROLES.ADMIN:
				return cn(base, "bg-magenta-50 text-magenta-600");
			case ROLES.SUPER_ADMIN:
				return cn(base, "bg-purple-100 text-purple-600");

			default:
				return cn(base, "bg-gray-50 text-gray-600");
		}
	};

	const columns: ColumnDef<IRole>[] = [
		{
			id: "sno",
			header: "S. No.",
			cell: ({ row }) => row.index + 1 + ".",
		},
		{
			accessorKey: "name",
			header: "Role Name",
			cell: ({ row }) => <div className="text-txt-primary font-medium">{row.original.name}</div>,
		},
		{
			accessorKey: "slug",
			header: "Slug",
			cell: ({ row }) => (
				<Badge className={getSlugBadgeClass(row.original.slug)} variant={"secondary"}>
					{row.original.slug}
				</Badge>
			),
		},
		{
			accessorKey: "permissions",
			header: "Permissions",
			cell: ({ row }) => (
				<button className="text-txt-tertiary hover:text-txt-secondary underline underline-offset-4">
					{getRolePermissionCountLabel(row.original.permissions.length)}
				</button>
			),
		},
		{
			id: "actions",
			header: () => <div className="pr-4 text-right">Actions</div>,
			cell: ({ row }) => (
				<div className="flex justify-end pr-4">
					<RoleActionsMenu role={row.original} onEdit={handleEdit} />
				</div>
			),
		},
	];

	return (
		<div className="space-y-6 px-4 md:px-5">
			{/* Role Form Dialog */}
			<RoleFormView open={isFormOpen} onClose={handleCloseForm} role={selectedRole} mode={mode} />

			{/* Search and Actions */}
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div className="flex w-full items-center gap-2 md:max-w-lg">
					<div className="relative flex-1">
						<Search className="text-txt-secondary absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
						<Input
							placeholder="Search"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="border-border bg-background focus-visible:border-border h-10 pl-10 focus-visible:ring-0"
						/>
					</div>
				</div>

				<div className="flex items-center gap-3">
					<Button onClick={handleCreate} className="h-10">
						<span className="mr-2 text-lg leading-none">+</span>
						New Role
					</Button>
				</div>
			</div>

			{/* Table */}
			<div className="border-border/50 overflow-hidden rounded-xl border">
				{isLoading ? (
					<div className="text-txt-secondary flex h-64 flex-col items-center justify-center gap-2">
						<Loader2 className="h-8 w-8 animate-spin" />
						<span>Loading roles...</span>
					</div>
				) : isError ? (
					<div className="flex h-64 items-center justify-center text-red-500">
						Failed to load roles. Please refresh and try again.
					</div>
				) : (
					<DataTable
						columns={columns}
						data={filteredRoles}
						headerRowClassname="bg-background border-b border-border/50"
						rowClassname="border-b border-border/50 hover:bg-transparent"
					/>
				)}
			</div>
		</div>
	);
}
