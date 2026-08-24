import { type AxiosError } from "axios";

export interface ApiResponse<T, E = object> {
	success: boolean;
	message: string;
	messageCode?: string;
	data: T;
	errors?: E;
}

export type ApiError = AxiosError<ApiResponse<null, { [key: string]: string }>>;
