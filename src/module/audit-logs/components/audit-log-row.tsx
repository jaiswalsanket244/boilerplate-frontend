"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { AuditStatus, type IAuditLog } from "@/module/audit-logs/types";
import { getActionDisplay, initials, relativeTime, summarizeLog } from "@/module/audit-logs/utils/audit-format";

export function AuditRow({ log, onClick }: { log: IAuditLog; onClick: () => void }) {
	const action = getActionDisplay(log);
	const failed = log.status === AuditStatus.FAILURE;
	const actor = log.actor.name || log.actorEmail || "system";

	return (
		<button
			type="button"
			onClick={onClick}
			aria-label={`${action.label} — ${summarizeLog(log)}`}
			className={cn(
				"focus-visible:ring-ring hover:bg-muted/50 flex w-full items-center gap-3 px-4 py-3 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none",
				failed && "bg-red-50/60 dark:bg-red-500/10"
			)}
		>
			<Avatar className="h-9 w-9 shrink-0">
				<AvatarFallback className="text-xs">{initials(log.actor.name, log.actorEmail)}</AvatarFallback>
			</Avatar>

			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-2">
					<span
						aria-hidden
						className={cn("h-1.5 w-1.5 shrink-0 rounded-full", failed ? "bg-red-500" : action.dotClass)}
					/>
					<p className="text-foreground truncate text-sm">{summarizeLog(log)}</p>
				</div>
				<p className="text-muted-foreground mt-0.5 truncate text-xs">
					{actor}
					<span className="text-muted-foreground/70"> · {log.actorRole}</span>
				</p>
			</div>

			<div className="text-muted-foreground hidden shrink-0 flex-col items-end gap-1 text-xs sm:flex">
				<span title={format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss")}>{relativeTime(log.timestamp)}</span>
				{failed && (
					<Badge variant="destructive" className="text-[10px]">
						Failed
					</Badge>
				)}
			</div>
		</button>
	);
}

export function SkeletonRows() {
	return (
		<div className="divide-y">
			{Array.from({ length: 8 }).map((_, i) => (
				<div key={i} className="flex items-center gap-3 px-4 py-3">
					<Skeleton className="h-9 w-9 rounded-full" />
					<div className="flex-1 space-y-2">
						<Skeleton className="h-3 w-40" />
						<Skeleton className="h-3 w-64" />
					</div>
					<Skeleton className="hidden h-3 w-16 sm:block" />
				</div>
			))}
		</div>
	);
}
