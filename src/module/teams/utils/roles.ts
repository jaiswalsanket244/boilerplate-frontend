import type { IPermission, IRole, RoleFormValues, RolePermission } from "@/module/teams/types";
import { z } from "zod";

export const roleFormSchema = z.object({
	name: z.string().trim().min(2, "Name must be at least 2 characters."),
	slug: z
		.string()
		.trim()
		.min(2, "Slug must be at least 2 characters.")
		.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug can contain lowercase letters, numbers, and hyphens only."),
	description: z.string().trim().min(10, "Description must be at least 10 characters."),
	permissions: z.array(z.string()).min(1, "Select at least one permission."),
});

export const getRolePermissionCountLabel = (count: number) => {
	if (count === 0) return "None";
	if (count === 1) return "1 permission";
	return `${count} permissions`;
};

export const toRoleFormValues = (role?: IRole): RoleFormValues => ({
	name: role?.name ?? "",
	slug: role?.slug ?? "",
	description: role?.description ?? "",
	permissions: role?.permissions ?? [],
});

export const createRoleSlug = (value: string) =>
	value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");

const toTitleCase = (value: string) =>
	value
		.split(/[-_\s]+/)
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");

export const normalizePermission = (permission: IPermission): RolePermission => {
	return {
		id: permission.slug,
		label: typeof permission.name === "string" && permission.name ? permission.name : toTitleCase(permission.id),
		description: permission.description ?? "Permission details were not provided by the API.",
		category: permission.resourceTypeSlug,
	};
};
