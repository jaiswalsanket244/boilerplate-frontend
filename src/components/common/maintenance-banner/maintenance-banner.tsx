"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";

import { apiClient } from "@/lib/api";
import { cn } from "@/lib/utils";
import { getSessionStorage, setSessionStorage } from "@/lib/utils/session-storage";
import type { ApiResponse } from "@/types/api-response";

const DISMISS_KEY = "maintenance-banner-dismissed";
const DEFAULT_MESSAGE =
	"We're currently performing scheduled maintenance. Some features may be temporarily unavailable.";

interface IMaintenanceStatus {
	maintenanceMode: boolean;
	maintenanceMessage: string;
}

export const MaintenanceBanner = () => {
	const [dismissed, setDismissed] = useState(() => getSessionStorage<boolean>(DISMISS_KEY) === true);

	const { data } = useQuery({
		queryKey: ["maintenance-status"],
		queryFn: async () => {
			const response = await apiClient.get<ApiResponse<IMaintenanceStatus>>("/maintenance");
			return response.data.data;
		},
		// The flag rarely changes, so keep it fresh long enough to avoid refetching on every navigation.
		staleTime: 1000 * 60 * 5,
		// A failed/pending fetch must never block the page: treat it as "no banner", don't retry-storm.
		retry: false,
	});

	if (dismissed || !data?.maintenanceMode) return null;

	const message = data.maintenanceMessage?.trim() ? data.maintenanceMessage : DEFAULT_MESSAGE;

	const handleDismiss = () => {
		setSessionStorage(DISMISS_KEY, true);
		setDismissed(true);
	};

	return (
		<div
			role="alert"
			className={cn("bg-amber-50 flex items-center gap-2 border-b border-amber-200 px-4 py-3 text-sm text-amber-800")}
		>
			<AlertTriangle className="h-4 w-4 shrink-0" />
			<span className="flex-1">{message}</span>
			<button
				type="button"
				onClick={handleDismiss}
				aria-label="Dismiss maintenance banner"
				className="shrink-0 rounded p-1 text-amber-800 transition-colors hover:bg-amber-100"
			>
				<X className="h-4 w-4" />
			</button>
		</div>
	);
};

export default MaintenanceBanner;
