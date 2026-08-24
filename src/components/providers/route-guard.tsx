"use client";

import { routes } from "@/config/routes";
import type { MenuItem } from "@/module/profile/types";
import { useMenuStore } from "@/stores/menu-store";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getUserCookies } from "@/lib/utils/cookies";
import { useProfileAPI, shouldUseImpersonatedMenu } from "@/module/profile/hooks/useProfile";
import { ROLES } from "@/types";

const UNIVERSAL_PROTECTED_ROUTES = [
	routes.settings.profile,
	routes.settings.changePassword,
	routes.settings.faqs,
	routes.settings.notifications,
	routes.settings.contactUs,
];

const isPathAllowed = (pathname: string, menuItems: MenuItem[]): boolean => {
	const { userType } = getUserCookies();

	if (userType === ROLES.SUPER_ADMIN) return true;

	return menuItems.some((item) => {
		if (item.href && (pathname === item.href || pathname.startsWith(`${item.href}/`))) {
			return true;
		}
		if (item.subItems) {
			return isPathAllowed(pathname, item.subItems);
		}
		return false;
	});
};

export default function RouteGuard({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const router = useRouter();

	const { menuItems, settingsMenuItems, defaultRedirectUrl, role } = useMenuStore();
	const [isAuthorized, setIsAuthorized] = useState(false);

	const { useGetUserData } = useProfileAPI();
	const { data: user, isLoading, isError, isSuccess } = useGetUserData();

	useEffect(() => {
		// 1. Handle error or unauthenticated state
		if (isError) {
			router.push(routes.auth.signIn);
			return;
		}

		// 2. Sync user data with menu store if needed
		if (isSuccess && user && role !== user.roles) {
			useMenuStore.getState().setMenuForUser(user, shouldUseImpersonatedMenu(user));
			return;
		}

		// 3. Wait for user data and menu store to be populated
		if (isLoading || !isSuccess || !role) {
			return;
		}

		// 3. Check if current path is a universal route
		const isUniversal = UNIVERSAL_PROTECTED_ROUTES.some(
			(route) => pathname === route || pathname.startsWith(`${route}/`)
		);

		if (isUniversal) {
			setIsAuthorized(true);
			return;
		}

		// 4. Check if path is in authorized menu items
		const allowedInMain = isPathAllowed(pathname, menuItems);
		const allowedInSettings = isPathAllowed(pathname, settingsMenuItems);

		if (allowedInMain || allowedInSettings) {
			setIsAuthorized(true);
		} else {
			// 5. Unauthorized: redirect to default url
			if (defaultRedirectUrl && pathname !== defaultRedirectUrl) {
				router.push(defaultRedirectUrl);
			} else if (!defaultRedirectUrl) {
				// Fallback if everything fails
				router.push(routes.auth.signIn);
			}
		}
	}, [pathname, menuItems, settingsMenuItems, defaultRedirectUrl, role, router, isError, isLoading, isSuccess, user]);

	// Prevent flickering by showing nothing until authorized
	if (!isAuthorized) {
		return (
			<div className="flex h-full w-full items-center justify-center">
				<div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
			</div>
		);
	}

	return <>{children}</>;
}
