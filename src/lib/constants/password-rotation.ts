import { routes } from "@/config/routes";
import { ERROR_CODES } from "@/lib/constants/error-codes";

export const PASSWORD_ROTATION_ERROR_CODES = new Set<string>([
	ERROR_CODES.PASSWORD_EXPIRED,
	ERROR_CODES.PASSWORD_CHANGE_REQUIRED,
]);

export const PASSWORD_ROTATION_ALLOWED_PATHS = new Set([
	routes.settings.changePassword,
	routes.settings.contactUs,
	routes.auth.signIn,
	routes.auth.forgotPassword,
	routes.auth.setPassword,
]);
