import type { CompanyType } from "@/module/company/types";
import type { IUser, USER_TYPE } from "@/types";
import type { ApiResponse } from "@/types/api-response";
import type { PERMISSIONS } from "@/types/permission";
import type { IconType } from "react-icons";
import * as z from "zod";

export * from "@/module/profile/types/user-query";

export type ChangePasswordApiResponseType = {
	status: number;
	message?: string;
	messageCode?: string;
	data?: {
		user: string;
	};
};

export type ChangePasswordDataType = {
	currentPassword: string;
	newPassword: string;
	confirmedPassword: string;
	email: string;
};

export type TabLink = {
	label: string;
	url: string;
	icon: IconType;
};

export type SettingsTabsProps = {
	role?: USER_TYPE;
	className?: string;
};

export interface IGetUserResponse extends ApiResponse<IUser> {}

export type NotificationItemType = {
	_id: string;
	message: string;
};

export type NotificationApiResponseType = {
	success: boolean;
	message: string;
	data: NotificationItemType[];
};

export type UpdatedProfileDataType = {
	name: {
		first: string;
		last: string;
	};
	images?: string;
};

export type UpdateApiResponseType = {
	message: string;
	data: {
		token: string;
	};
};

export type ImageUploadButtonProps = {
	currentImageUrl?: string | string[];
	fallbackText?: string;
	onImageSelect: (file: File, previewUrl: string) => void;
	onImageRemove: () => void;
	isUploading?: boolean;
	className?: string;
};

export interface Props {
	isOpen: boolean;
	placement?: "left" | "right" | "top" | "bottom";
	size?: "DEFAULT" | "sm" | "lg" | "xl" | "full";
	handleClose: () => void;
}

export interface MenuItem {
	href: string;
	name: string;
	Icon: React.ReactNode;
	permissions?: PERMISSIONS[];
	subItems?: MenuItem[];
	hidden?: boolean;
}

export interface SidebarMenuProps extends React.ComponentPropsWithoutRef<"aside"> {
	role: USER_TYPE;
	className?: string;
}

export interface LinksProps extends React.ComponentPropsWithoutRef<"a"> {
	menuItem: MenuItem;
}

export const cardFormSchema = z.object({
	cardHolder: z.string().min(1, { message: "Card holder name is required" }),
	cardNumber: z.string().min(10, { message: "Card Number is required" }),
	expiryDate: z.string().optional(),
	cvc: z.string().optional(),
});
export type CardFormTypes = z.infer<typeof cardFormSchema>;

// form zod validation schema
export const passwordFormSchema = z.object({
	currentPassword: z.string().min(8, { message: "Current password is required" }),
	newPassword: z.string().min(8, { message: "New password required" }),
	confirmedPassword: z.string().min(8, { message: "Confirmed password required" }),
});

// generate form types from zod validation schema
export type PasswordFormTypes = z.infer<typeof passwordFormSchema>;

// form zod validation schema
export const personalInfoFormSchema = z.object({
	first_name: z.string().min(1, { message: "First name is required" }),
	last_name: z.string().min(1, { message: "Last name is required" }),
	// userRole: z.string().min(1, { message: "Role is required" }),
	// country: z.string().min(1, { message: "Country is required" }),
	// timezone: z.string().min(1, { message: "Timezone is required" }),
	// description: z.string().optional(),
});

export type PersonalInfoFormTypes = z.infer<typeof personalInfoFormSchema>;

export interface UploadedFile {
	type: string;
	name: string;
}

export const profileFormSchema = z.object({
	firstName: z.string().min(1, { message: "First name is required" }),
	lastName: z.string().min(1, { message: "last name is required" }),
	email: z.string().min(1, { message: "Email is required" }),
});

export type ProfileFormTypes = z.infer<typeof profileFormSchema>;

export const companySettingsFormSchema = z.object({
	supportEmail: z.string().optional(),
	enablePasswordRotation: z.boolean().default(false).optional(),
	passwordValidityDays: z.coerce.number().min(1, { message: "Must be at least 1 day" }).optional(),
	gracePeriodDays: z.coerce.number().min(0, { message: "Cannot be negative" }).optional(),
});
export type TCompanySettingsForm = z.infer<typeof companySettingsFormSchema>;

export type UpdateProfileByIdType = {
	id: string;
	companyRef: string;
	update: {
		name?: {
			first: string;
			last: string;
		};
	};
};

export type UpdateProfileByIdApiResponseType = {
	success: boolean;
	message: string;
};

export type ChangePasswordByIdType = {
	id: string;
	data: {
		currentPassword: string;
		newPassword: string;
		confirmedPassword: string;
	};
};

export type ChangePasswordByIdApiResponseType = {
	success: boolean;
	message: string;
};

export type GetSignedUrlType = {
	fileName: string;
	fileType: string;
};

export type GetSignedUrlResponseType = {
	message: string;
	data: {
		url: string;
		keyFile: string;
	};
};

export interface IUpdateCompanyResponse {
	success: boolean;
	message: string;
	data: CompanyType;
	errors: object;
}
export type ParamsType = {
	id: string;
};

export interface INotification {
	_id: string;
	title: string;
	userRef: string;
	isOpened: boolean;
	message: string;
	redirectUrl?: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface IGetNotificationsResponse extends ApiResponse<INotification[]> {}
export interface IUnreadNotificationCountResponse extends ApiResponse<{ count: number }> {}
export interface IMarkAllAsReadResponse extends ApiResponse<boolean> {}
export interface IMarkAsReadResponse extends ApiResponse<boolean> {}
export interface IGetPreferencesResponse extends ApiResponse<IUserNotificationPreference> {}

export enum NOTIFICATION_CHANNELS {
	EMAIL = "email",
	PUSH = "push",
	IN_APP = "inApp",
}

export enum NOTIFICATION_TYPES {
	CHAT_MESSAGE = "chat_message",
	PROFILE_AND_PASSWORD = "profile_and_password",
}

export interface INotificationChannels {
	[NOTIFICATION_CHANNELS.EMAIL]: boolean;
	[NOTIFICATION_CHANNELS.PUSH]: boolean;
	[NOTIFICATION_CHANNELS.IN_APP]: boolean;
}

export interface IUserNotificationPreference {
	userRef: string;
	preferences: Record<NOTIFICATION_TYPES, INotificationChannels>;
	createdAt?: Date;
	updatedAt?: Date;
}
