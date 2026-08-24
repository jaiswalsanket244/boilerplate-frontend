import { Badge } from "@/components/ui/badge";
import { STATUS } from "@/types";
import type { ICompanyStatusBadgeProps } from "@/module/company/types";

export function CompanyStatusBadge({ status = "Unknown", className = "" }: ICompanyStatusBadgeProps) {
	const isInactive = status === STATUS.INACTIVE;
	const badgeClassName = `ml-1 ${isInactive ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"} ${className}`;

	return (
		<Badge variant="outline" className={badgeClassName} data-testid="company-status-badge">
			{status || "Unknown"}
		</Badge>
	);
}
