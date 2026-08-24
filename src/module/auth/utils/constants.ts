import { routes } from "@/config/routes";
import { AUTH_PAGE_TYPE, type IAuthFooterProps } from "@/module/auth/types";

export const authFooterConfig: Record<AUTH_PAGE_TYPE, IAuthFooterProps> = {
	[AUTH_PAGE_TYPE.SIGN_UP]: {
		text: "Already have an account?",
		linkText: "Sign In",
		href: routes.auth.signIn,
	},

	[AUTH_PAGE_TYPE.SIGN_IN]: {
		text: "Don’t have an account?",
		linkText: "Sign Up",
		href: routes.auth.signUp,
	},

	[AUTH_PAGE_TYPE.RESET_PASSWORD]: {
		text: "Don’t want to reset your password?",
		linkText: "Sign In",
		href: routes.auth.signIn,
	},

	[AUTH_PAGE_TYPE.VERIFY_OTP]: {
		text: "Didn’t receive an email?",
		linkText: "Click to resend",
		href: routes.auth.requestLoginOtp,
	},

	[AUTH_PAGE_TYPE.FORGOT_PASSWORD]: {
		text: "Don’t want to reset your password?",
		linkText: "Sign In",
		href: routes.auth.signIn,
	},
};
