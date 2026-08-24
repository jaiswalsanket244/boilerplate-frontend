import { cn } from "@/lib/utils";
import { type IUserQueryStatusBadgeProps } from "@/module/profile/types";
import { getStatusStyles } from "@/module/profile/utils/helpers";

export function StatusBadge({ status, className }: IUserQueryStatusBadgeProps) {
	return (
		<span
			className={cn(
				"inline-flex items-center rounded-full border bg-yellow-50 px-3 py-1 text-xs font-semibold capitalize",
				getStatusStyles(status),
				className
			)}
			data-testid="status-badge"
		>
			{status}
		</span>
	);
}
