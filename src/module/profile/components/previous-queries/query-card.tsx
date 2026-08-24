import { cn } from "@/lib/utils";
import { StatusBadge } from "@/module/profile/components/previous-queries/status-badge";
import type { ITicketCardProps } from "@/module/profile/types";
import { format } from "date-fns";

export function QueryCard({ query, isNew }: ITicketCardProps) {
	return (
		<div
			className={cn(
				"border-border/60 bg-background font-lato relative max-w-full overflow-x-hidden rounded-lg border p-6 text-base transition-shadow duration-200 hover:shadow-md",
				isNew && "border-info/40 bg-blue-50/60"
			)}
		>
			<div className="mb-2 flex items-start justify-between">
				<div className="flex flex-1 items-center gap-2">
					<span className="text-txt-primary-800 font-bold">Subject:</span>
					<span className="text-txt-primary">{query.subject}</span>
				</div>
				<StatusBadge status={query.status} />
			</div>

			<p className="text-txt-primary-800 mb-4 line-clamp-2 w-full max-w-3xl leading-relaxed">{query.message}</p>

			<div className="flex items-center justify-between">
				<div className="text-txt-primary flex w-full flex-col gap-3 font-medium">
					<div className="text-txt-secondary-800 ml-auto text-sm">
						Date: {format(new Date(query.createdAt), "dd/MM/yyyy")}
					</div>
					<div>
						<span className="font-bold">Ticket ID:</span> <span className="font-medium">#{query._id}</span>
					</div>
				</div>
			</div>
		</div>
	);
}
