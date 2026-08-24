import { routes } from "@/config/routes";

export const MFA_AUTH_CONTEXT_VALUES = {
	SETUP: "setup",
	SETUP_VERIFY: "setup-verify",
	RECOVERY_CODES: "recovery-codes",
	RESET_IDENTITY_VERIFY: "reset-identity-verification",
	RESET_SETUP: "reset-setup",
	RESET_SETUP_VERIFY: "reset-setup-verify",
	RESET_RECOVERY_CODES: "reset-recovery-codes",
	RECOVERY: "recovery",
	VERIFICATION: "verification",
	ENABLE_MFA: "enable-mfa",
} as const;

export const PUBLIC_PATHS = [routes.auth.signIn, routes.auth.signUp, routes.auth.forgotPassword, routes.system.signIn];
export const MFA_PENDING_ONLY_PATHS = [routes.auth.mfaVerify, routes.auth.mfaRecovery];
export const MFA_AUTH_PATHS = [routes.auth.mfaSetup, routes.auth.mfaSetupVerify, routes.auth.mfaRecoveryCodes];
export const MFA_RESET_PATHS = [routes.auth.mfaIdentityVerify];

export const MFA_ROUTE_CONTEXT: Partial<Record<string, string[]>> = {
	[routes.auth.mfaSetup]: [MFA_AUTH_CONTEXT_VALUES.SETUP, MFA_AUTH_CONTEXT_VALUES.RESET_SETUP],
	[routes.auth.mfaSetupVerify]: [MFA_AUTH_CONTEXT_VALUES.SETUP_VERIFY, MFA_AUTH_CONTEXT_VALUES.RESET_SETUP_VERIFY],
	[routes.auth.mfaRecoveryCodes]: [
		MFA_AUTH_CONTEXT_VALUES.RECOVERY_CODES,
		MFA_AUTH_CONTEXT_VALUES.RESET_RECOVERY_CODES,
	],
	[routes.auth.mfaIdentityVerify]: [MFA_AUTH_CONTEXT_VALUES.RESET_IDENTITY_VERIFY],
	[routes.auth.mfaRecovery]: [MFA_AUTH_CONTEXT_VALUES.RECOVERY],
	[routes.auth.mfaVerify]: [MFA_AUTH_CONTEXT_VALUES.VERIFICATION],
};

export const MFA_CONTEXT_REDIRECTS: Partial<Record<string, string>> = {
	[MFA_AUTH_CONTEXT_VALUES.SETUP]: routes.auth.mfaSetup,
	[MFA_AUTH_CONTEXT_VALUES.SETUP_VERIFY]: routes.auth.mfaSetupVerify,
	[MFA_AUTH_CONTEXT_VALUES.RECOVERY_CODES]: routes.auth.mfaRecoveryCodes,
	[MFA_AUTH_CONTEXT_VALUES.RESET_IDENTITY_VERIFY]: routes.auth.mfaIdentityVerify,
	[MFA_AUTH_CONTEXT_VALUES.RESET_SETUP]: routes.auth.mfaSetup,
	[MFA_AUTH_CONTEXT_VALUES.RESET_SETUP_VERIFY]: routes.auth.mfaSetupVerify,
	[MFA_AUTH_CONTEXT_VALUES.RESET_RECOVERY_CODES]: routes.auth.mfaRecoveryCodes,
	[MFA_AUTH_CONTEXT_VALUES.RECOVERY]: routes.auth.mfaRecovery,
	[MFA_AUTH_CONTEXT_VALUES.VERIFICATION]: routes.auth.mfaVerify,
};
