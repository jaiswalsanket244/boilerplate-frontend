import { type MFA_AUTH_CONTEXT_VALUES } from "@/lib/constants/paths";
import type { IUser } from "@/types";
import { type ApiResponse } from "@/types/api-response";

// -----
// ENUMS
// -----
export enum SOCIAL_OAUTH_METHOD {
	GOOGLE = "GOOGLE",
	LINKEDIN = "LINKEDIN",
	MICROSOFT = "MICROSOFT",
	APPLE = "APPLE",
	GITHUB = "GITHUB",
}

export enum OTP_PURPOSE {
	LOGIN = "LOGIN",
	SIGNUP = "SIGNUP",
	VERIFICATION = "VERIFICATION",
	PASSWORD_RESET = "PASSWORD_RESET",
}

export enum AUTH_PAGE_TYPE {
	SIGN_IN = "signin",
	SIGN_UP = "signup",
	FORGOT_PASSWORD = "forgot-password",
	RESET_PASSWORD = "reset-password",
	VERIFY_OTP = "otp",
}

export enum MFA_FLOW {
	SETUP = "setup",
	RESET = "reset",
	RECOVERY = "recovery",
}

export type TMfaAuthContext = (typeof MFA_AUTH_CONTEXT_VALUES)[keyof typeof MFA_AUTH_CONTEXT_VALUES];

export type TMfaResetIdentityMethod = "authenticator" | "email_otp";

// ========== Props   ================
export interface IOtpFormProps {
	email: string;
	title?: string;
	description?: string;
	submitButtonText?: string;
	onSubmit: (data: OtpFormData) => void;
	isLoading?: boolean;
	onGoBack?: () => void;
	otpLength: number;
	isIncorrectOtp?: boolean;
	setIsIncorrectOtp?: (value: boolean) => void;
	isCorrectOtp?: boolean;
}

export interface IAuthLayoutProps {
	children: React.ReactNode;
	type?: AUTH_PAGE_TYPE;
	showSocialAuth?: boolean;
}

export interface IAuthFooterProps {
	text: string;
	linkText: string;
	href: string;
}

export interface IMfaResetEmailOtpDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export interface IMfaRecoverySuccessDialogProps {
	open: boolean;
	onSkip: () => void;
	onSetupAuthenticator: () => void;
}

// =========  Interfaces ================

export interface OtpFormData {
	otp: string;
}

export interface IForgetPasswordData {
	email: string;
}

export interface IResetPasswordData {
	password: string;
	confirmPassword: string;
}

export interface IUserLoginData {
	email?: string;
	password?: string;
	otp?: string;
	loginType?: string;
}

export interface IVerifyEmailOtpData {
	email?: string;
	otp: string;
	loginType?: string;
}

export interface ISendEmailOtpData {
	email: string;
}

export interface IRequestOtpParams {
	identifier: string;
	purpose: OTP_PURPOSE;
}

export interface IVerifyOtpParams {
	identifier: string;
	otp: string;
	purpose: OTP_PURPOSE;
}

export interface IQueryRegisterData {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	confirmPassword: string;
	inviteToken?: string;
}

export interface IUserRegisterData {
	name: {
		first: string;
		last: string;
	};
	email: string;
	password: string;
	referralCode?: string;
	inviteToken?: string;
}

export interface IAcceptInviteData {
	inviteToken: string;
}

export type PopupConfig = {
	width: number;
	height: number;
	left: number;
	top: number;
};

export interface ISocialCallbackHandlerProps {
	provider: SOCIAL_OAUTH_METHOD;
	handleOnSuccess?: () => void;
	handleOnError?: (error: unknown) => void;
}

// ========== API response ===========

export interface IResetPasswordResponse extends ApiResponse<{ token: string; email?: string; password?: string }> {}

export interface IForgetPasswordResponse extends ApiResponse<boolean> {}

export interface ILoginResponse extends ApiResponse<{
	token: string;
	user: IUser;
	isPasswordExpired: boolean;
}> {}

export interface IRegisterResponse extends ApiResponse<{
	user: IUser;
	token?: string;
	redirectToMfaSetup: boolean;
}> {}

export interface ISocialSignupResponse extends ApiResponse<{ user: IUser }> {}

export interface ILogoutResponse extends ApiResponse<null> {}

export interface IEmailFromTokenResponse extends ApiResponse<string> {}

export interface IRequestMagicLinkResponse extends ApiResponse<null> {}

export interface IRequestOtpResponse extends ApiResponse<null> {}

export interface IResendOtpResponse extends ApiResponse<null> {}

export interface IVerifyOtpResponse extends ApiResponse<{ user: IUser }> {}

export interface IMfaSetupData {
	qrCode: string;
	uri: string;
	secret: string;
}

export interface IInitiateMfaSetupResponse extends ApiResponse<IMfaSetupData> {}

export interface IVerifyMfaSetupResponse extends ApiResponse<{
	user: IUser;
	recoveryCodes: string[];
}> {}

export interface IVerifyMfaResponse extends ApiResponse<{
	user: IUser;
}> {}

export interface IVerifyMfaRecoveryCodeResponse extends ApiResponse<{
	user: IUser;
}> {}

export interface IMfaResetIdentityVerifyResponse extends ApiResponse<{
	verified: boolean;
}> {}

export interface IMfaResetSetupInitiateResponse extends ApiResponse<IMfaSetupData> {}

export interface IMfaResetSetupVerifyResponse extends ApiResponse<{
	user: IUser;
	recoveryCodes: string[];
}> {}
