"use client";

import { Pagination } from "@/components/common/pagination/pagination";
import { routes } from "@/config/routes";
import { getSessionStorage } from "@/lib/utils/session-storage";
import { Breadcrumb } from "@/module/profile/components/previous-queries/breadcrumb";
import { QueryCard } from "@/module/profile/components/previous-queries/query-card";
import { useUserQueries } from "@/module/profile/hooks/useUserQueries";
import { SESSION_STORAGE_KEYS } from "@/types";
import { Loader } from "lucide-react";

const PreviousQueries = () => {
	const { queries, pagination, handlePageChange, isLoading } = useUserQueries();

	const breadcrumbItems = [{ label: "Contact Us", href: routes.settings.contactUs }, { label: "Previous Queries" }];

	const newlyCreatedQueries = getSessionStorage<string[]>(SESSION_STORAGE_KEYS.NEW_QUERY_IDS);

	return (
		<div className="flex max-h-full w-full flex-col space-y-6 overflow-hidden pb-3">
			<Breadcrumb items={breadcrumbItems} />

			<div className="flex-1 space-y-4 overflow-y-auto pb-7">
				{isLoading && (
					<div className="flex min-h-[45vh] w-full flex-1 items-center justify-center">
						<Loader className="mr-2 size-5 animate-spin" /> <span className="text-lg">Loading Queries...</span>
					</div>
				)}
				{!isLoading && !queries?.length && (
					<div className="flex min-h-[45vh] w-full flex-1 items-center justify-center">No Queries Found</div>
				)}
				{!isLoading &&
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
