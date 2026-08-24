import * as z from "zod";

export type TSortOrder = "asc" | "desc";
export type TSortBy = "createdAt" | "email";

export interface FilterState {
	subjects: string[];
	dateFrom?: string;
	dateTo?: string;
	status: string[];
	sortBy?: TSortBy;
	sortOrder?: TSortOrder;
}

export enum USER_QUERY_SUBJECT {
	GENERAL = "General Inquiry",
	TECHNICAL = "Technical Support",
	BILLING = "Billing and Payments",
	FEATURE = "Feature Requests or Feedback",
}

export enum USER_QUERY_STATUS {
	RESOLVED = "Resolved",
	IN_PROGRESS = "In Progress",
	PENDING = "Pending",
	CLOSED = "Closed",
}

export const contactFormSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
	subject: z.nativeEnum(USER_QUERY_SUBJECT),
	message: z.string().min(1, "Message is required"),
	name: z.object({
		first: z.string().min(1, "First name is required"),
		last: z.string().min(1, "Last name is required"),
	}),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

export interface IUserQuery {
	email: string;
	subject: USER_QUERY_SUBJECT;
	message: string;
	name: {
		first: string;
		last: string;
	};
	_id: string;
	status: USER_QUERY_STATUS;
	companyRef?: string;
	createdAt: string;
	updatedAt?: string;
	userName: string;
}

export interface ICreateQueryResponse {
	success: boolean;
	message: string;
	data: IUserQuery;
	errors: object;
}
export interface IGetAllQueriesResponse {
	success: boolean;
	message: string;
	data: [{ items: IUserQuery[]; total: number; page: number; pageSize: number }];
	errors: object;
}

export interface IUserQueryStatusBadgeProps {
	status: USER_QUERY_STATUS;
	className?: string;
}

export interface ITicketCardProps {
	query: IUserQuery;
	isNew?: boolean;
}

export interface IQueryListProps {
	queries: IUserQuery[];
	selectedQueryId: string | null;
	onSelectQuery: (queryId: string) => void;
	searchTerm: string;
	onSearchChange: (term: string) => void;
	filters: FilterState;
	onFiltersChange: (filters: FilterState) => void;
	onApplyFilters?: () => Promise<void>;
	isLoading?: boolean;
	className?: string;
	pagination: IPaginationState;
	onPageChange: (page: number) => void;
	onSortChange: (sortBy: TSortBy, sortOrder?: TSortOrder) => void;
}

export interface ISortOptionsProps {
	sortBy?: TSortBy;
	sortOrder?: TSortOrder;
	onSortChange: (sortBy: TSortBy, sortOrder?: TSortOrder) => void;
}

export type TSortOption = { label: string; value: TSortBy; order: TSortOrder };

export interface IFiltersProps {
	filters: FilterState;
	onFiltersChange: (filters: FilterState) => void;
	searchTerm: string;
	onSearchChange: (term: string) => void;
	onSortChange: (sortBy: TSortBy, sortOrder?: TSortOrder) => void;
}

export interface IPaginationState {
	page: number;
	size: number;
	totalPages: number;
	totalItems: number;
}

export interface IUpdateQueryPayload {
	id: string;
	data: Partial<IUserQuery>;
}
export interface IEmailFormProps {
	onSendEmail?: (emailData: TSendEmailPayload) => Promise<void>;
}

export interface IBreadcrumbProps {
	items: { label: string; href?: string }[];
}

export interface IQueryDetailProps {
	query: IUserQuery | null;
	isLoading?: boolean;
	onBack?: () => void;
	showBackButton?: boolean;
}
export interface FilterDialogProps {
	filters: FilterState;
	onFiltersChange: (filters: FilterState) => void;
	searchTerm: string;
	onSearchChange: (term: string) => void;
}

export interface CollapsibleSectionProps {
	title: string;
	defaultOpen?: boolean;
	children: React.ReactNode;
}

export interface SubjectFilterProps {
	selectedSubjects: string[];
	onSubjectsChange: (subjects: string[]) => void;
}

export interface DateFilterProps {
	dateFrom?: string;
	dateTo?: string;
	onDateFromChange: (date?: string) => void;
	onDateToChange: (date?: string) => void;
}

export interface DatePickerButtonProps {
	date?: string;
	placeholder: string;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onDateSelect: (date: Date | undefined) => void;
}

export interface IUseUserQueriesProps {
	initialFilters?: Partial<FilterState>;
	pageSize?: number;
}

export interface StatusFilterProps {
	selectedStatus: string[];
	onStatusChange: (status: string[]) => void;
}

export const emailSchema = z.object({
	cc: z.boolean().default(false),
	bcc: z.boolean().default(false),
	ccEmails: z.array(z.string().email("Invalid email address")).default([]),
	bccEmails: z.array(z.string().email("Invalid email address")).default([]),
	message: z.string().min(1, "Message is required"),
});

export type TEmailFormData = z.infer<typeof emailSchema>;

export type TSendEmailPayload = Pick<TEmailFormData, "bccEmails" | "ccEmails" | "message">;
