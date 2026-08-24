import type { ApiError } from "@/types/api-response";
import { isAxiosError } from "axios";

export const getErrorMessage = (error: unknown): string => {
	if (isAxiosError(error)) {
		const axiosError = error as ApiError;
		return axiosError.response?.data?.message || "Network Error";
	}
	if (error instanceof Error) {
		return error.message;
	}
	return "Something went wrong! Please try again.";
};
