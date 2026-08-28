"use client";

import { AlertCircle, Loader, RotateCcw } from "lucide-react";
import { useState } from "react";

import { Pagination } from "@/components/common/pagination/pagination";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { getSessionStorage } from "@/lib/utils/session-storage";
import { Breadcrumb } from "@/module/profile/components/previous-queries/breadcrumb";
import { QueryCard } from "@/module/profile/components/previous-queries/query-card";
import { useUserQueries } from "@/module/profile/hooks/useUserQueries";
import { SESSION_STORAGE_KEYS } from "@/types";

const PreviousQueries = () => {
	const { queries, pagination, handlePageChange, isLoading, error, refetch } = useUserQueries();

	// react-query keeps status "error" (not pending) while a refetch-after-error is in flight,
	// so isLoading stays false; track the retry locally to show the loading state during the retry.
	const [isRetrying, setIsRetrying] = useState(false);

	const handleRetry = async () => {
		setIsRetrying(true);
		try {
			await refetch();
		} finally {
			setIsRetrying(false);
		}
	};

	const showLoading = isLoading || isRetrying;
	const showError = !showLoading && !!error;

	const breadcrumbItems = [{ label: "Contact Us", href: routes.settings.contactUs }, { label: "Previous Queries" }];

	const newlyCreatedQueries = getSessionStorage<string[]>(SESSION_STORAGE_KEYS.NEW_QUERY_IDS);

	return (
		<div className="flex max-h-full w-full flex-col space-y-6 overflow-hidden pb-3">
			<Breadcrumb items={breadcrumbItems} />

			<div className="flex-1 space-y-4 overflow-y-auto pb-7">
				{showLoading && (
					<div className="flex min-h-[45vh] w-full flex-1 items-center justify-center">
						<Loader className="mr-2 size-5 animate-spin" /> <span className="text-lg">Loading Queries...</span>
					</div>
				)}
				{showError && (
					<div className="flex min-h-[45vh] w-full flex-1 items-center justify-center">
						<div className="flex flex-col items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
							<AlertCircle className="h-6 w-6" />
							<span>Failed to load queries. Please try again.</span>
							<Button variant="outline" size="sm" onClick={() => void handleRetry()}>
								<RotateCcw className="mr-2 h-4 w-4" />
								Try again
							</Button>
						</div>
					</div>
				)}
				{!showLoading && !showError && !queries?.length && (
					<div className="flex min-h-[45vh] w-full flex-1 items-center justify-center">No Queries Found</div>
				)}
				{!showLoading &&
					!showError &&
					queries?.length &&
					queries?.map((query) => (
						<QueryCard key={query._id} query={query} isNew={newlyCreatedQueries?.includes(query._id)} />
					))}

				{pagination.totalPages > 1 && (
					<Pagination
						page={pagination.page}
						totalPages={pagination.totalPages}
						totalItems={pagination.totalItems}
						pageSize={pagination.size}
						handlePageChange={handlePageChange}
					/>
				)}
			</div>
		</div>
	);
};

export default PreviousQueries;
