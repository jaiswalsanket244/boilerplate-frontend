import type { CompanyType } from "@/module/company/types";
import type { SortingState, ColumnFiltersState, OnChangeFn, ColumnDef } from "@tanstack/react-table";
import type { PERMISSIONS } from "@/types/permission";

export type USER_TYPE = "user" | "admin" | "super-admin" | "system";

export interface SortConfigType {
	key?: string;
	direction?: string;
}

export interface AwsUrlResponse {
	data: {
		url: string;
		keyFile: string;
	};
}

export interface OAuthUserInterface {
	accessToken: string;
}

export type SignUpApiResponseType = {
	message: string;
	data: {
		data: {
			user: {
				name: {
					first: string;
					last: string;
				};
				email: string;
				oauth: string;
				roles: string;
				companyRef: string;
				_id: string;
			};
			mfa: {
				required: boolean;
				enrolled: boolean;
			};
		};
	};
};

export interface PaginatedSearchQuery {
	page?: number;
	pageSize?: number;
	searchValue?: string;
	sortBy?: boolean;
	companyRef: string;
}

export interface SearchBoxProps {
	searchTerm?: string;
	variant: string;
	placeholder: string;
	onSearchChange: (value: string) => void;
}

export type PaginationType = {
	page: number;
	pageSize: number;
	totalPages: number;
	handlePageChange: (page: number) => void;
	handlePageSizeChange?: (page: number) => void;
	totalItems: number;
};

export interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	rowClassname?: string;
	headerRowClassname?: string;
	sorting?: SortingState;
	onSortingChange?: OnChangeFn<SortingState>;
	filters?: ColumnFiltersState;
	onFiltersChange?: OnChangeFn<ColumnFiltersState>;
}

export interface FilterOption {
	value: string;
	label: string;
}
export interface FilterableColumn {
	key: string;
	label: string;
	type: "select" | "date" | "text";
	options?: FilterOption[];
}
export interface FilterControlProps {
	filterableColumns: FilterableColumn[];
	filters: ColumnFiltersState;
	onFilterChange: (updaterOrValue: ColumnFiltersState | ((old: ColumnFiltersState) => ColumnFiltersState)) => void;
	children: React.ReactElement<{ className?: string }>;
}

export interface DateRange {
	from?: string;
	to?: string;
}

export interface IUser {
	_id: string;
	email: string;
	fullName: string;
	name: {
		first: string;
		last: string;
	};
	roles: ROLES;
	status: string;
	profileImage?: string;
	oauth?: string;
	images: string[];
	companyRef: CompanyType;
	stripeCustomerId?: string;
	createdAt: string;
	isPasswordExpired: boolean;
	passwordExpiresAt: string;
	passwordExpiryDaysLeft?: number | undefined;
	mfa: {
		enrolled: boolean;
		enabled: boolean;
	};
	permissions?: PERMISSIONS[];
}

// ------
// Enums
// ------
export enum ROLES {
	SUPER_ADMIN = "super-admin",
	ADMIN = "admin",
	USER = "user",
	SYSTEM = "system",
}

export enum STATUS {
	ACTIVE = "ACTIVE",
	INACTIVE = "INACTIVE",
}

export enum INVITED_USER_STATUS {
	PENDING = "PENDING",
	ACCEPTED = "ACCEPTED",
	CANCELED = "CANCELED",
}

export enum COOKIES {
	TOKEN = "token", // this is set from backend and its mainly used for authentication.
	USER_TYPE = "userType",
	COMPANY_REF = "companyRef",
	IS_ADMIN_PATH = "isAdminPath",
	USER_REF = "userRef",
	CHAT_TOKEN = "chatToken",
	PASSWORD_EXPIRED = "passwordExpired",
	PENDING_MFA_TOKEN = "pendingMfaToken",
	MFA_AUTH_CONTEXT = "mfaAuthContext",
}

type CookiePrimitive = string | number | boolean;

export type CookieValueMap = {
	[K in COOKIES]: CookiePrimitive;
};

export enum AUTH_PAGE_TYPE {
	SIGN_IN = "signin",
	SIGN_UP = "signup",
	FORGOT_PASSWORD = "forgot-password",
	RESET_PASSWORD = "reset-password",
	VERIFY_OTP = "otp",
}
export enum THEMES {
	LIGHT = "light",
	DARK = "dark",
	SYSTEM = "system",
	// THEME_RED = "theme-red",
	// THEME_RED_DARK = "theme-red-dark",
	THEME_BLUE = "theme-blue",
	THEME_BLUE_DARK = "theme-blue-dark",
	BOLD_TECH = "bold-tech",
	BOLD_TECH_DARK = "bold-tech-dark",
	DOOM = "doom",
	DOOM_DARK = "doom-dark",
	RETRO_ARCADE = "retro-arcade",
	RETRO_ARCADE_DARK = "retro-arcade-dark",
}

export enum SESSION_STORAGE_KEYS {
	NEW_QUERY_IDS = "new-query-ids",
	NEWLY_CREATED_PRODUCTS = "newly-created-products",
	UPDATED_PRODUCTS = "updated-products",
	DELETED_PRODUCTS = "deleted-products",
	INVITE_TOKEN = "inviteToken",
	MFA_AUTH_CONTEXT = "mfaAuthContext",
	MFA_RESET_EMAIL_OTP_RESEND_AT = "mfaResetEmailOtpResendAt",
	MFA_AUTO_EMAIL_OTP_SEND_AT = "mfaResetAutoEmailOtpSendAt",
	RECOVERY_CODES = "recoveryCodes",
}

export enum MESSAGE_STATUS {
	SUCCESS = "success",
	INFO = "info",
	WARNING = "warning",
	ERROR = "error",
	IDLE = "idle",
	FAILED = "failed",
}
