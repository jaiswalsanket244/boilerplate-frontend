"use client";

export const setSessionStorage = <T>(key: string, value: T): void => {
	if (typeof window === "undefined") return;

	window?.sessionStorage.setItem(key, JSON.stringify(value));
};

export const getSessionStorage = <T>(key: string): T | null => {
	if (typeof window === "undefined") return null;
	try {
		const item = window?.sessionStorage?.getItem(key);
		if (item) {
			return JSON.parse(item) as T;
		}
		return null;
	} catch (error) {
		console.error(error);
		return null;
	}
};

export const clearSessionStorage = (key: string): void => {
	if (typeof window === "undefined") return;
	window?.sessionStorage.removeItem(key);
};
