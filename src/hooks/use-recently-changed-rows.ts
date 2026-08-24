import { useQuery, useQueryClient } from "@tanstack/react-query";
import { uiKeys } from "@/lib/constants/query-keys";
import { cn } from "@/lib/utils";

type RowChangeType = "created" | "updated" | "deleted" | "errors";

interface RecentlyChangedRows {
	created: string[];
	updated: string[];
	deleted: string[];
	errors: string[];
}

const initialData: RecentlyChangedRows = {
	created: [],
	updated: [],
	deleted: [],
	errors: [],
};

export const useRecentlyChangedRows = (timeout = 2000) => {
	const queryClient = useQueryClient();

	const { data = initialData } = useQuery<RecentlyChangedRows>({
		queryKey: uiKeys.recentlyChangedRows,
		queryFn: () => initialData,
		initialData,
		enabled: false,
	});

	const addRow = (type: RowChangeType, id: string) => {
		queryClient.setQueryData(uiKeys.recentlyChangedRows, (old: RecentlyChangedRows = initialData) => {
			if (old[type].includes(id)) return old;
			return {
				...old,
				[type]: [...old[type], id],
			};
		});

		// remove after {timeout} seconds
		setTimeout(() => {
			queryClient.setQueryData(uiKeys.recentlyChangedRows, (old: RecentlyChangedRows = initialData) => ({
				...old,
				[type]: old[type].filter((x) => x !== id),
			}));
		}, timeout);
	};

	const clearAll = () => {
		queryClient.setQueryData(uiKeys.recentlyChangedRows, initialData);
	};

	const getRowAnimationClasses = (id: string) => {
		const isCreated = data.created.includes(id);
		const isUpdated = data.updated.includes(id);
		const isDeleting = data.deleted.includes(id);
		const error = data.errors.includes(id);

		return cn("transition-all w-full overflow-x-hidden overflow-hidden", {
			"animate-fade-in-blue": isCreated,
			"animate-fade-in-yellow": isUpdated,
			"animate-delete-row": isDeleting,
			"animate-error-shake": error,
		});
	};

	return { data, addRow, clearAll, getRowAnimationClasses };
};
