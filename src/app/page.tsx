"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useProfileAPI } from "@/module/profile/hooks/useProfile";
import { useMenuStore } from "@/stores/menu-store";
import { routes } from "@/config/routes";

export default function IndexPage() {
	const router = useRouter();
	const { useGetUserData } = useProfileAPI();
	const { data: userData } = useGetUserData();
	const defaultRedirectUrl = useMenuStore((state) => state.defaultRedirectUrl);

	useEffect(() => {
		if (userData && defaultRedirectUrl) {
			router.push(defaultRedirectUrl);
		} else if (!userData && !useMenuStore.getState().defaultRedirectUrl) {
			// If not logged in, RouteGuard in layouts will handle it,
			// but for root we can redirect to signin
			router.push(routes.auth.signIn);
		}
	}, [defaultRedirectUrl, router, userData]);
	return null;
}
