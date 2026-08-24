import { routes } from "@/config/routes";
import {
	MFA_AUTH_PATHS,
	MFA_CONTEXT_REDIRECTS,
	MFA_PENDING_ONLY_PATHS,
	MFA_RESET_PATHS,
	MFA_ROUTE_CONTEXT,
	PUBLIC_PATHS,
} from "@/lib/constants/paths";
import { COOKIES, ROLES } from "@/types";
import { getCookie } from "cookies-next";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
	const path = request.nextUrl.pathname;
	const isPublicPath = PUBLIC_PATHS.includes(path);

	const token = await getCookie(COOKIES.TOKEN, { cookies });
	const userType = await getCookie(COOKIES.USER_TYPE, { cookies });
	const passwordExpired = await getCookie(COOKIES.PASSWORD_EXPIRED, { cookies });
	const mfaToken = await getCookie(COOKIES.PENDING_MFA_TOKEN, { cookies });
	const mfaAuthContext = await getCookie(COOKIES.MFA_AUTH_CONTEXT, { cookies });

	const hasPrimaryAuth = Boolean(token);
	const hasPendingMfaAuth = Boolean(mfaToken);
	const canAccessMfaSetupFlow = hasPrimaryAuth || hasPendingMfaAuth;
	const requiredMfaContexts = MFA_ROUTE_CONTEXT[path];
	const expectedMfaPath = mfaAuthContext ? MFA_CONTEXT_REDIRECTS[String(mfaAuthContext)] : undefined;

	const Redirect = () => {
		if (token) {
			if (userType === ROLES.SUPER_ADMIN) {
				return NextResponse.redirect(new URL(routes.superAdmin.companies.list, request.url));
			}
			return NextResponse.redirect(new URL(routes.dashboard, request.url));
		}
		return NextResponse.redirect(new URL(routes.auth.signIn, request.url));
	};

	if (MFA_PENDING_ONLY_PATHS.includes(path) && !hasPendingMfaAuth) {
		return Redirect();
	}

	if (MFA_AUTH_PATHS.includes(path) && !canAccessMfaSetupFlow) {
		return NextResponse.redirect(new URL(routes.auth.signIn, request.url));
	}

	if (MFA_RESET_PATHS.includes(path) && !canAccessMfaSetupFlow) {
		return NextResponse.redirect(new URL(routes.auth.signIn, request.url));
	}

	if (hasPendingMfaAuth && mfaAuthContext && expectedMfaPath && path !== expectedMfaPath) {
		return NextResponse.redirect(new URL(expectedMfaPath, request.url));
	}

	if (requiredMfaContexts && !requiredMfaContexts.includes(String(mfaAuthContext))) {
		const redirectPath = MFA_RESET_PATHS.includes(path) ? routes.settings.profile : routes.auth.signIn;

		return NextResponse.redirect(new URL(redirectPath, request.url));
	}

	// Redirect to change-password if password is expired,
	// but avoid the loop by not redirecting if already on that page.
	if (token && passwordExpired === "true" && path !== routes.settings.changePassword) {
		return NextResponse.redirect(new URL(routes.settings.changePassword, request.url));
	}

	if (token && isPublicPath) {
		// If trying to access public paths with a token, redirect to dashboard
		return Redirect();
	}

	if (!token && !hasPendingMfaAuth && !isPublicPath) {
		// If trying to access private paths without a token, redirect to signin
		return Redirect();
	}

	if (
		// Redirect users to their designated dashboards if they attempt to access unauthorized routes.
		token &&
		path.startsWith("/super-admin") &&
		userType !== ROLES.SUPER_ADMIN
	) {
		return Redirect();
	}

	// Default behavior: allow the request to proceed
	return NextResponse.next();
}

export const config = {
	matcher: [
		"/signin",
		"/signup",
		"/",
		"/mfa/:path*",
		"/super-admin/:path*",
		"/system/:path*",
		"/client/:path*",
		"/settings/:path*",
		"/checkout",
	],
};
