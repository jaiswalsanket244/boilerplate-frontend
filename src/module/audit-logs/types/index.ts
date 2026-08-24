import { type ApiResponse } from "@/types/api-response";
import { type PaginatedResponse } from "@/types/pagination";

export enum AuditCategory {
	AUTHENTICATION = "authentication",
	ADMIN_ACTION = "admin_action",
	RBAC = "rbac",
	TENANT = "tenant",
	SYSTEM = "system",
	AUDIT_META = "audit_meta",
	RECORD_CHANGE = "record_change",
}

export enum AuditStatus {
	SUCCESS = "success",
	FAILURE = "failure",
}

export interface IAuditLogChange {
	field: string;
	before: unknown;
	after: unknown;
}

export interface IAuditLogActor {
	name: string | null;
	impersonatedBy?: string;
}

export interface IAuditLogTarget {
	label: string | null;
}

export interface IAuditLogContext {
	ip: string | null;
	userAgent: string | null;
	path: string | null;
	method: string | null;
}

export interface IAuditLog {
	_id: string;
	companyRef: string;
	targetType: string | null;
	targetId: string | null;
	timestamp: string;
	actorId: string;
	actorEmail: string | null;
	actorRole: "super-admin" | "admin" | "user";
	category: AuditCategory;
	action: string;
	status: AuditStatus;
	_sig: string;
	_prevSig: string;
	subsystemMappingVersion: number;
	requestId: string | null;
	actor: IAuditLogActor;
	target: IAuditLogTarget;
	context: IAuditLogContext;
	changes?: IAuditLogChange[];
	metadata?: Record<string, unknown>;
	failureReason?: string;
}

export type AuditLogSearchQuery = {
	page?: number;
	pageSize?: number;
	category?: AuditCategory;
	action?: string;
	actorId?: string;
	actorEmail?: string;
	status?: AuditStatus;
	targetType?: string;
	targetId?: string;
	companyRef?: string;
	from?: string;
	to?: string;
	search?: string;
	sortBy?: "timestamp" | "createdAt" | "action" | "category" | "actorEmail" | "status";
	sortDir?: "asc" | "desc";
	hideInternalChanges?: boolean;
};

export type AuditLogsResponse = ApiResponse<PaginatedResponse<IAuditLog>>;

export type AuditExportFormat = "csv" | "json";

export interface AuditLogExportData {
	url: string;
	key: string;
	format: AuditExportFormat;
	rowCount: number;
	truncated: boolean;
}

export type AuditLogExportResponse = ApiResponse<AuditLogExportData>;

export type ChainBreakTier = "hot" | "cold" | "boundary";

export type ChainBreakType = "signature" | "linkage" | "payload_drift" | "head";

export interface IChainBreak {
	entryId: string;
	position: number;
	expected: string;
	actual: string;
	tier: ChainBreakTier;
	type: ChainBreakType;
}

export interface IRetentionLag {
	count: number;
	oldestTimestamp: string;
	newestTimestamp: string;
}

export interface IChainVerifyReport {
	companyRef: string;
	totalEntries: number;
	hotEntries: number;
	coldEntries: number;
	coldTier: boolean;
	breaksFound: number;
	breaks: IChainBreak[];
	firstEntry: string | null;
	lastEntry: string | null;
	verifiedAt: string;
	status: "clean" | "tampered";
	anchorUnverified?: true;
	retentionLag?: IRetentionLag;
	duplicatesSkipped?: number;
}

export type ChainVerifyResponse = ApiResponse<IChainVerifyReport>;

export interface IAthenaQueryRequest {
	query?: string;
	filters?: {
		action?: string;
		resource?: string;
		resourceId?: string;
		actor?: string;
		status?: AuditStatus;
		startDate?: string;
		endDate?: string;
	};
}

export interface IAthenaQueryResult {
	[key: string]: string | number | boolean | null;
}

export interface IAthenaQueryResultSet {
	rows: IAthenaQueryResult[];
	truncated: boolean;
}

export interface IAthenaQueryResponse {
	success: boolean;
	message: string;
	data: IAthenaQueryResultSet;
}
