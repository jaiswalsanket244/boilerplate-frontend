import { routes } from "@/config/routes";
import { canAccess } from "@/lib/utils/access-check";
import type { MenuItem } from "@/module/profile/types";
import {
	clientMenuItems,
	impersonateAdminMenuItems,
	settingsMenuItems,
	superAdminMenuItems,
	systemMenuItems,
} from "@/module/profile/utils/menu-items";
import { ROLES, type IUser } from "@/types";
import type { PERMISSIONS } from "@/types/permission";

const checkHasAnyPermission = (requiredPermissions?: PERMISSIONS[], userPerms?: PERMISSIONS[], role?: string) => {
	if (!requiredPermissions || requiredPermissions.length === 0) return true;
	if (role === ROLES.SUPER_ADMIN) return true;
	if (!userPerms || userPerms.length === 0) return false;

	return requiredPermissions.some((permission) => canAccess(userPerms, permission));
};

export const filterMenuByPermissions = (
	menuList: MenuItem[],
	userPerms: PERMISSIONS[] = [],
	role?: string
): MenuItem[] => {
	return menuList
		.map((item) => {
			const filteredSubItems = item.subItems ? filterMenuByPermissions(item.subItems, userPerms, role) : undefined;
			const passesOwnCheck = checkHasAnyPermission(item.permissions, userPerms, role);
			const hasVisibleSubItems = !!filteredSubItems?.length;

			if ((passesOwnCheck && filteredSubItems === undefined) || hasVisibleSubItems) {
				return { ...item, subItems: filteredSubItems };
			}

			return null;
		})
		.filter(Boolean) as MenuItem[];
};

export const getBaseMenuForUser = (user?: Pick<IUser, "roles"> | null, isImpersonatting = false) => {
	if (isImpersonatting && user?.roles === ROLES.SUPER_ADMIN) return impersonateAdminMenuItems;
	if (user?.roles === ROLES.SUPER_ADMIN) return superAdminMenuItems;
	if (user?.roles === ROLES.SYSTEM) return systemMenuItems;

	return clientMenuItems;
};

export const getDefaultRedirectUrl = (menuItems: MenuItem[], role: string) => {
	if (role === ROLES.SUPER_ADMIN) {
		return routes.superAdmin.companies.list;
	}

	const firstItem = menuItems[0];

	return firstItem?.href || firstItem?.subItems?.[0]?.href || "";
};

export const buildMenuForUser = (user?: Pick<IUser, "permissions" | "roles"> | null, isImpersonatting = false) => {
	const permissions = user?.permissions ?? [];

	const menuItems = filterMenuByPermissions(getBaseMenuForUser(user, isImpersonatting), permissions, user?.roles);
	const settingsMenuItemsList = filterMenuByPermissions(settingsMenuItems, permissions, user?.roles);

	if (!user?.roles) {
		return {
			menuItems,
			settingsMenuItems: settingsMenuItemsList,
			defaultRedirectUrl: "",
			permissions,
			role: user?.roles ?? null,
		};
	}

	return {
		menuItems,
		settingsMenuItems: settingsMenuItemsList,
		defaultRedirectUrl: getDefaultRedirectUrl(menuItems, user.roles),
		permissions,
		role: user?.roles ?? null,
	};
};
