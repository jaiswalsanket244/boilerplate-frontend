"use client";

import { routes } from "@/config/routes";
import { clearCookies, getUserCookies } from "@/lib/utils/cookies";
import { useProfileAPI } from "@/module/profile/hooks/useProfile";
import { ROLES, STATUS } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CheckActiveStatus() {
	const { useGetUserData } = useProfileAPI();
	const { data: userData, isError, isLoading, isSuccess } = useGetUserData();
	const router = useRouter();

	useEffect(() => {
		if (isError || isLoading) {
			return;
		}

		if (userData?.isPasswordExpired) {
			router.push(routes.settings.changePassword);
			return;
		}

		const userIsActive = userData?.status === STATUS.ACTIVE;
		const { userType } = getUserCookies();
		// we need to  check company status for admin and user (Super Admin doesn't belong to any company )
		const companyIsActive = userData?.companyRef?.companyStatus === STATUS.ACTIVE;
		if (isSuccess && ((userType !== ROLES.SUPER_ADMIN && !companyIsActive) || !userIsActive || !userData)) {
			clearCookies();
			router.push(routes.auth.signIn);
		} else {
			return;
		}
	}, [userData, isLoading, isError, router, isSuccess]);

	return null;
}
