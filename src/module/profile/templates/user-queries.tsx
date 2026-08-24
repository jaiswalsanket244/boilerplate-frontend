"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { getErrorMessage } from "@/lib/utils";
import { QueryDetail } from "@/module/profile/components/user-queries/query-detail";
import { UserQueriesList } from "@/module/profile/components/user-queries/query-list";
import { useUserQueries } from "@/module/profile/hooks/useUserQueries";
import { useState } from "react";

function UserQueries() {
	const isMobile = useIsMobile();

	const [selectedQueryId, setSelectedQueryId] = useState<string | null>(null);
	const [showDetail, setShowDetail] = useState(false);

	const {
		queries,
		error,
		isLoading,
		filters,
		searchTerm,
		pagination,
		handleFiltersChange,
		handleSearchChange,
		handlePageChange,
		handleSortChange,
	} = useUserQueries();

	const selectedQuery = queries.find((query) => query._id === selectedQueryId) || null;

	const handleSelectQuery = (queryId: string) => {
		if (selectedQueryId === queryId) return;

		setSelectedQueryId(queryId);

		setShowDetail(true);
	};

	const handleBackToList = () => {
		setShowDetail(false);
		setSelectedQueryId(null);
	};

	if (error) {
		return (
			<div className="flex h-[calc(100vh-var(--header-height))] overflow-hidden bg-background">
				<div data-testid="error-message" className="flex h-full w-full items-center justify-center">
					{getErrorMessage(error)}
				</div>
			</div>
		);
	}
	return (
		<div className="flex h-[calc(100vh-var(--header-height))] overflow-hidden bg-background">
			{isMobile ? (
				<>
					{!showDetail ? (
						<UserQueriesList
							queries={queries}
							selectedQueryId={selectedQueryId}
							onSelectQuery={handleSelectQuery}
							searchTerm={searchTerm}
							onSearchChange={handleSearchChange}
							filters={filters}
							onFiltersChange={handleFiltersChange}
							isLoading={isLoading}
							pagination={pagination}
							onPageChange={handlePageChange}
							onSortChange={handleSortChange}
							className="w-full"
						/>
					) : (
						<QueryDetail
							key={selectedQueryId || "selectedQuery"}
							query={selectedQuery}
							onBack={handleBackToList}
							showBackButton={true}
						/>
					)}
				</>
			) : (
				<>
					<UserQueriesList
						queries={queries}
						selectedQueryId={selectedQueryId}
						onSelectQuery={handleSelectQuery}
						searchTerm={searchTerm}
						onSearchChange={handleSearchChange}
						filters={filters}
						onFiltersChange={handleFiltersChange}
						isLoading={isLoading}
						pagination={pagination}
						onPageChange={handlePageChange}
						onSortChange={handleSortChange}
						className="w-full max-w-md"
					/>
					<QueryDetail
						key={selectedQueryId || "selectedQuery"}
						query={selectedQuery}
						onBack={handleBackToList}
						showBackButton={false}
					/>
				</>
			)}
		</div>
	);
}

export default UserQueries;
