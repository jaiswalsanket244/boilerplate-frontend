import { getUserCookies } from "@/lib/utils/cookies";
import { ROLES } from "@/types";

export function isSuperAdminUser() {
	const { userType } = getUserCookies();

	return userType === ROLES.SUPER_ADMIN;
}

const levels = {
	view: 1,
	write: 2,
	manage: 3,
};

type TAction = keyof typeof levels;

function parse(permission: string) {
	const parts = permission.split(":");
	const action = parts.pop() as TAction; // last part
	const domain = parts.join(":"); // everything else
	return { domain, action };
}

export function canAccess(permissions: string[], requiredPermission: string, exactMatch?: boolean) {
	const { userType } = getUserCookies();
	if (userType === ROLES.SUPER_ADMIN) return true;

	if (!permissions?.length) return false;

	const { domain: reqDomain, action: reqAction } = parse(requiredPermission);

	if (exactMatch) return permissions.includes(requiredPermission);

	if (!reqAction) return false;

	return permissions.some((userPerm) => {
		const { domain: userDomain, action: userAction } = parse(userPerm);

		if (!userAction) return false;

		return userDomain === reqDomain && levels[userAction] >= levels[reqAction];
	});
}
