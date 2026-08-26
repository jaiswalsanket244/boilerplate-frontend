import type { PopupConfig } from "@/module/auth/types";

// -------------------
// auth pop-up helpers
// -------------------
export function createPopupWindow(url: string, config: PopupConfig) {
	const { width, height, left, top } = config;
	return window.open(
		url,
		"oauth-popup",
		`width=${width},height=${height},top=${top},left=${left},popup=true,location=yes`
	);
}

export function getPopupConfig(): PopupConfig {
	const width = 500;
	const height = 600;
	const left = window.screenX + (window.outerWidth - width) / 2;
	const top = window.screenY + (window.outerHeight - height) / 2;
	return { width, height, left, top };
}
