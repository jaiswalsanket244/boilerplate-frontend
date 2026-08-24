import { Pagination } from "@/components/common/pagination/pagination";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/module/profile/components/previous-queries/status-badge";
import Filters from "@/module/profile/components/user-queries/filters";
import type { IQueryListProps } from "@/module/profile/types";
import { format, isValid } from "date-fns";

export function UserQueriesList({
	queries,
	selectedQueryId,
	onSelectQuery,
	searchTerm,
	onSearchChange,
	filters,
	onFiltersChange,
	isLoading = false,
	className,
	onPageChange,
	pagination,
	onSortChange,
}: IQueryListProps) {
	return (
		<div
			data-testid="user-queries-list"
			className={cn(
				"border-border bg-background flex h-full w-full flex-col overflow-hidden border-r md:max-w-md",
				className
			)}
		>
			<Filters
				onFiltersChange={onFiltersChange}
				filters={filters}
				onSearchChange={onSearchChange}
				searchTerm={searchTerm}
				onSortChange={onSortChange}
			/>

			<div className="flex-1 space-y-6 overflow-y-auto p-4">
				{!isLoading && queries.length === 0 && (
					<div
						data-testid="no-data-message"
						className="flex h-full w-full items-center justify-center text-xl font-semibold md:max-w-md"
					>
						No queries found
					</div>
				)}

				{isLoading && (
					<div
						data-testid="loading-queries"
						className="flex h-full w-full items-center justify-center text-xl font-semibold md:max-w-md"
					>
						Loading queries...
					</div>
				)}

				{!isLoading &&
					queries.map((query, index) => {
						const createdAt = isValid(new Date(query.createdAt))
							? format(new Date(query.createdAt), "dd/MM/yyyy")
							: "-";
						return (
							<div
								key={query._id}
								onClick={() => onSelectQuery(query._id)}
								className={cn(
									"relative cursor-pointer rounded-lg border p-3 transition-colors",
									selectedQueryId === query._id
										? "border-primary/50 border-2"
										: "border-border bg-card hover:bg-card/40"
								)}
								data-testid={`query-${index + 1}`}
							>
								<div className="text-txt-primary mb-2 flex flex-col gap-3 text-base">
									<div className="space-x-2">
										<span className="font-bold">User Name:</span>
										<span>
											{query.name.first} {query.name.last}
										</span>
									</div>
									<div className="space-x-2">
										<span className="font-bold">Ticket ID:</span> <span>#{query._id}</span>
									</div>

									<div className="space-x-2">
										<span className="font-bold">Subject:</span> <span> {query.subject}</span>
									</div>

									<p className="line-clamp-1 truncate">{query.message}</p>
								</div>

								<div className="flex items-center justify-end">
									<span className="text-muted-foreground text-sm">Date: {createdAt}</span>
								</div>

								<StatusBadge status={query.status} className="absolute -top-3 right-4 z-10 rounded px-8" />
							</div>
						);
					})}
			</div>

			{pagination.totalPages > 0 && (
				<Pagination
					page={pagination.page}
					totalPages={pagination.totalPages}
					totalItems={pagination.totalItems}
					pageSize={pagination.size}
					handlePageChange={onPageChange}
				/>
			)}
		</div>
	);
}
