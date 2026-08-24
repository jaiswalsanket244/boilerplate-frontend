import type { IAcceptInviteData, IRequestOtpParams } from "@/module/auth/types";
import type { MockedApiError } from "@/tests/types/api-error-mock";
import type { IUser } from "@/types";

// SocialCallbackHandler → useSocialRegisterMutation
export type SocialRegisterPayload = { code: string; provider: string; inviteToken?: string };

export type SocialRegisterCallbacks = { onSuccess?: () => void; onError?: (error: unknown) => void };

export type LoginSuccessData = { user: Pick<IUser, "_id" | "roles" | "companyRef"> };
export type LoginCallbacks = { onSuccess: (data: LoginSuccessData) => void; onError: () => void };

export type VerifyOtpCallbacks = { onSuccess: () => void; onError: () => void };

// SignInForm → useLoginMutation. `mfa` is optional: the template defaults it.
export type SignInSuccessData = {
	user: Pick<IUser, "_id" | "email" | "roles" | "companyRef"> & { mfa?: IUser["mfa"] };
	isPasswordExpired?: boolean;
};
export type SignInCallbacks = { onSuccess: (data: SignInSuccessData) => void; onError: (error: unknown) => void };

export type ApiErrorHandler = (error?: MockedApiError) => void;

// ForgetPasswordForm → useForgetPasswordMutation, RequestMagicLinkForm → useRequestMagicLinkMutation
export type EmailOnlyPayload = { email: string };
export type EmailOnlyCallbacks = { onSuccess: () => void; onError: ApiErrorHandler };

// ResetPasswordForm → useUpdatePasswordMutation
export type UpdatePasswordPayload = {
	userData: { password: string; confirmPassword: string; email: string };
	token: string;
};
export type UpdatePasswordCallbacks = { onSuccess: () => void; onError: ApiErrorHandler };

// RequestLoginOtpForm → useRequestOtpMutation
export type RequestOtpCallbacks = { onSuccess: () => void; onError: ApiErrorHandler };

export type EmailFromTokenSuccessData = { data: string };
export type SignUpPayload = IRequestOtpParams | IAcceptInviteData;
export type SignUpCallbacks = {
	onSuccess: (data?: EmailFromTokenSuccessData) => void;
	onError: ApiErrorHandler;
};

// SetPasswordForm → useRegisterMutation
export type RegisterPayload = {
	name: { first: string; last: string };
	email: string;
	password: string;
	inviteToken?: string;
};
export type RegisterSuccessData = {
	user: Pick<IUser, "_id" | "roles" | "companyRef" | "permissions">;
	redirectToMfaSetup?: boolean;
};
export type RegisterCallbacks = { onSuccess: (data: RegisterSuccessData) => void; onError: ApiErrorHandler };
