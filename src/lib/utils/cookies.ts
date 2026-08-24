import { COOKIES, type CookieValueMap, type USER_TYPE } from "@/types";
import { deleteCookie, getCookie as getCookieNext, setCookie } from "cookies-next";

export const getCookies = (...keys: COOKIES[]) => {
	const cookies: Record<string, unknown> = {};
	keys.forEach((key) => {
		const value = getCookieNext(key);

		cookies[key] = value;
	});
	return cookies;
};

export const getCookie = (key: COOKIES) => getCookieNext(key);

export const getUserCookies = () => ({
	userType: getCookie(COOKIES.USER_TYPE) as USER_TYPE,
	userRef: getCookie(COOKIES.USER_REF) as string,
	companyRef: getCookie(COOKIES.COMPANY_REF) as string,
	isAdminPath: Boolean(getCookie(COOKIES.IS_ADMIN_PATH)),
});

export const getChatTokenFromCookie = () => {
	return getCookie(COOKIES.CHAT_TOKEN) as string;
};

export const getCookieExpiryDate = (days: number = 1) => {
	const date = new Date();
	date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
	return date;
};

export const clearCookies = (keys: COOKIES[] = Object.values(COOKIES)) => {
	keys.forEach((key) => {
		deleteCookie(key);
	});
};

export const setCookies = (cookies: Partial<CookieValueMap>, days: number = 1) => {
	const expiryDate = getCookieExpiryDate(days);
	for (const [key, value] of Object.entries(cookies)) {
		setCookie(key, value, { expires: expiryDate });
	}
};
