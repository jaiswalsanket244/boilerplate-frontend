import type { ApiResponse } from "@/types/api-response";

export interface ISession {
	id: string;
	device: string;
	browser: string;
	os: string;
	ipDisplay: string;
	lastActiveAt: string | null;
	createdAt: string;
	isCurrent: boolean;
}

export interface IGetSessionsResponse extends ApiResponse<{ sessions: ISession[] }> {}
export interface IRevokeSessionResponse extends ApiResponse<{ success: boolean }> {}
export interface IRevokeOtherSessionsResponse extends ApiResponse<{ revokedCount: number }> {}
