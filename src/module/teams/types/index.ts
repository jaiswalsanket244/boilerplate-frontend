import z from "zod";
import type { ColumnFiltersState, Row, SortingState } from "@tanstack/react-table";
import type { PaginatedResponse } from "@/types/pagination";
import type { ApiResponse } from "@/types/api-response";
import { type SetStateAction } from "react";
import { type INVITED_USER_STATUS, type USER_TYPE, type IUser } from "@/types";

export type TAB_TYPE = "users" | "active" | "invited-users" | "in-active-users";

export enum USER_STATUS {
	PENDING = "PENDING",
	INVITED = "INVITED",
	ACTIVE = "ACTIVE",
	INACTIVE = "INACTIVE",
	DELETED = "DELETED",
}
export enum TEAMS_TAB_TYPES {
	USERS = "users",
	INVITED_USERS = "invited-users",
	ACTIVE_USERS = "active",
	INACTIVE_USERS = "in-active-users",
}

export enum ACTION_TYPE {
	CREATE = "create",
	UPDATE = "update",
	DELETE = "delete",
}

export enum ROLE_FORM_MODE {
	CREATE = "create",
	EDIT = "edit",
}

export enum IMPORT_TYPE {
	manual = "manual",
	import = "import",
}

export const UPLOAD_STATUS = {
	IDLE: "idle",
	UPLOADING: "uploading",
	PARSING: "parsing",
	VALIDATING: "validating",
	COMPLETE: "complete",
	ERROR: "error",
} as const;

export type UploadStatus = (typeof UPLOAD_STATUS)[keyof typeof UPLOAD_STATUS];

export interface IInviteUserResponse extends ApiResponse<{
	message: string;
	emails: string[];
}> {}

export interface IInviteMultipleUserResponse extends ApiResponse<{
	successfulInvites: number;
	failedEmails: string[];
	invitedUsers: {
		email: string;
		data: {
			message: string;
		};
	}[];
}> {}
export interface InviteUserData {
	email: string;
	companyRef?: string;
}

export interface InviteUsersData {
	users: {
		email: string;
		firstName: string;
		lastName: string;
	}[];
	companyRef?: string;
}

export interface AcceptInviteData {
	inviteToken: string;
}

export interface AcceptInviteResponse {
	status: number;
}

export interface IApiResponse {
	message: string;
}

export interface IPermissions {
	collectionName: string;
	access?: boolean;
	permission?: string;
}
export interface IInvitedUser {
	_id: string;
	invitedEmail: string;
	companyRef?: string;
	userRef: string;
	status: INVITED_USER_STATUS;
	role: USER_TYPE;
	expiry: number;
	errorMessages: string;
	name: {
		first: string;
		last: string;
	};
	permissions: IPermissions[];
}

export interface InvitedUsers {
	data: IInvitedUser[];
}

export interface IUserListResponse extends ApiResponse<PaginatedResponse<IUser>> {}

export interface IUserCountResponse extends ApiResponse<{
	total: number;
	invited: number;
	active: number;
	inActive: number;
}> {}

export interface IGetUserResponse extends ApiResponse<IUser> {}

export interface IUpdateRoleResponse extends ApiResponse<IUser> {}

export interface IUpdateStatusResponse extends ApiResponse<IUser> {}
export interface ICancelInvitationResponse extends ApiResponse<{
	message: string;
}> {}

export interface IResendInvitationResponse extends ApiResponse<{
	message: string;
}> {}

export interface TeamMember {
	_id: string;
	serialNumber: number;
	email: string;
	invitedEmail: string;
	name: {
		first: string;
		last: string;
	};
	images?: string;
	role?: string;
	createdAt: string | number | Date;
	status: string;
	invitedRole?: string;
}

export interface ActionsCellType {
	tabType: TAB_TYPE;
	row: Row<TeamMember>;
	canManageTeams: boolean;
	currentUser: IUser | null;
}

export interface UserInviteDetails {
	email: string;
	firstName: string;
	lastName: string;
	errors?: string[];
	id?: string;
}

export interface MultiUserInputType {
	users: UserInviteDetails[];
	setUsers: React.Dispatch<React.SetStateAction<UserInviteDetails[]>>;
	activeTab: string;
	setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}

export interface IExcelUserImportProps {
	users: UserInviteDetails[];
	setUsers: (users: UserInviteDetails[]) => void;
}

export interface IValidationStatusProps {
	uploadStatus: UploadStatus;
	errorMessage: string;
	validationResult: ValidationResult | null;
	processingProgress: number;
}

export interface IAttachedFileDisplayProps {
	file: File;
	onRemove: () => void;
}

export interface IInviteUsersTableProps {
	users: UserInviteDetails[];
	filteredUsers: UserInviteDetails[];
	searchQuery: string;
	onSearchChange: (query: string) => void;
	onRemoveUser: (userId?: string) => void;
}

export interface IUserRowProps {
	user: UserInviteDetails;
	displayIndex: number;
	onRemove: (userId?: string) => void;
}
export interface IManualUserEntry {
	users: UserInviteDetails[];
	setUsers: React.Dispatch<SetStateAction<UserInviteDetails[]>>;
}

export interface IFileUploadZoneProps {
	onFileSelect: (file: File) => Promise<void>;
}

export interface RowType {
	Email: string;
	FirstName: string;
	LastName: string;
}

export interface IUsersTableProps {
	data: TeamMember[];
	sorting: SortingState;
	filters: ColumnFiltersState;
	setSorting: (updaterOrValue: SortingState | ((old: SortingState) => SortingState)) => void;
	setFilters: (updaterOrValue: ColumnFiltersState | ((old: ColumnFiltersState) => ColumnFiltersState)) => void;
	activeTab: TAB_TYPE;
	canManageTeams: boolean;
	currentUser: IUser | null;
}

export interface IInviteUserDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export interface ValidationResult {
	valid: boolean;
	errors: string[];
	totalRecords: number;
	validRecords: number;
	invalidRecords: number;
}

export interface ISendingInvitationStatusModalProps {
	open: boolean;
	isSuccess: boolean;
	onClose: () => void;
}

export interface RolePermission {
	id: string;
	label: string;
	description: string;
	category: string;
}

export interface RoleFormValues {
	name: string;
	slug: string;
	description: string;
	permissions: string[];
}

// form Zod validation schema
export const personalInfoFormSchema = z.object({
	emails: z.array(z.string().email({ message: "Invalid email address" })),
});

// generate form types from zod validation schema
export type PersonalInfoFormTypes = z.infer<typeof personalInfoFormSchema>;

export interface IPermission {
	id: string;
	slug: string;
	name: string;
	description: string;
	resourceTypeSlug: string;
	system: boolean;
	category?: string;
}

export interface IRole {
	id: string;
	name: string;
	slug: string;
	description: string;
	permissions: string[]; // array of permission slugs or IDs
	resourceTypeSlug: string;
	type: "EnvironmentRole" | "OrganizationRole"; // extendable if more types exist
	isDefault?: boolean;
	system?: boolean;
}

export interface IPermissionSelectorProps {
	permissions: RolePermission[];
	value: string[];
	onChange: (value: string[]) => void;
	error?: string;
}

export interface IRoleActionsMenuProps {
	role: IRole;
	onEdit: (role: IRole) => void;
}

export interface IRoleFormViewProps {
	open: boolean;
	role?: IRole | null;
	mode: ROLE_FORM_MODE;
	onClose: () => void;
}

export interface ICreateRoleResponse extends ApiResponse<IRole> {}

export interface IUpdateOrgRoleResponse extends ApiResponse<IRole> {}

export interface IDeleteRoleResponse extends ApiResponse<{ message: string }> {}

export interface IGetRolesResponse extends ApiResponse<IRole[]> {}

export interface IGetPermissionsResponse extends ApiResponse<IPermission[]> {}
