import axios, { type InternalAxiosRequestConfig } from "axios";

import { routes } from "@/config/routes";
import { env } from "@/env.mjs";
import { PASSWORD_ROTATION_ALLOWED_PATHS, PASSWORD_ROTATION_ERROR_CODES } from "@/lib/constants/password-rotation";
import { clearCookies } from "@/lib/utils/cookies";
import { isClient } from "@/lib/utils/is-client";
import type { ApiError } from "@/types/api-response";

const apiUrl = env.NEXT_PUBLIC_API_URL;

const HEADERS = {
	"Content-Type": "application/json",
};

const apiClient = axios.create({
	baseURL: apiUrl,
	headers: {
		...HEADERS,
	},
	withCredentials: true,
});

type RetryableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: unknown) => void }> = [];

const processQueue = (error: unknown) => {
	failedQueue.forEach((prom) => {
		if (error) {
			prom.reject(error);
		} else {
			prom.resolve();
		}
	});

	failedQueue = [];
};

/* Session is dead: drop client-readable cookies so stale role/company context can't survive the redirect. */
const redirectToSignIn = () => {
	clearCookies();
	if (isClient()) {
		window.location.replace(routes.auth.signIn);
	}
};

apiClient.interceptors.response.use(
	(response) => {
		return response;
	},
	(error: ApiError) => {
		const originalRequest = error.config as RetryableRequestConfig | undefined;
		const status = error?.response?.status;
		const errorCode = error?.response?.data?.messageCode || "";

		if (status === 401 && originalRequest?.url?.includes("/auth/refresh-token")) {
			redirectToSignIn();
			return Promise.reject(error);
		}

		// Check for 401 status and token-related errors
		if (status === 401 && originalRequest && !originalRequest._retry) {
			if (isRefreshing) {
				return new Promise(function (resolve, reject) {
					failedQueue.push({ resolve, reject });
				})
					.then(() => {
						return apiClient(originalRequest);
					})
					.catch((err) => {
						return Promise.reject(err);
					});
			}

			originalRequest._retry = true;
			isRefreshing = true;

			return new Promise(function (resolve, reject) {
				apiClient
					.post("/auth/refresh-token")
					.then(() => {
						processQueue(null);
						resolve(apiClient(originalRequest));
					})
					.catch((err) => {
						processQueue(err);
						redirectToSignIn();
						reject(err);
					})
					.finally(() => {
						isRefreshing = false;
					});
			});
		}

		// Enforce password rotation block from backend
		if (status === 403 && PASSWORD_ROTATION_ERROR_CODES.has(errorCode)) {
			if (isClient()) {
				const currentPath = window.location.pathname;
				if (!PASSWORD_ROTATION_ALLOWED_PATHS.has(currentPath)) {
					window.location.href = routes.settings.changePassword;
				}
			}
		}

		// Reject the promise with the error so it can be handled by the calling code
		return Promise.reject(error);
	}
);

export { apiClient, apiUrl };
