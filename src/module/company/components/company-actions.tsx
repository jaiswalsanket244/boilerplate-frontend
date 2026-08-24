import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { ICompanyActionsProps } from "@/module/company/types";
import { FiEye } from "react-icons/fi";
import { RiExchangeFundsLine } from "react-icons/ri";

export function CompanyActions({ company, onView, onToggleStatus, showActions }: ICompanyActionsProps) {
	if (!showActions) {
		return null;
	}

	return (
		<div className="flex items-center justify-start gap-3">
			<TooltipProvider>
				<Tooltip key={`view-${company._id}`}>
					<TooltipTrigger asChild>
						<Button
							variant="plain"
							onClick={() => onView(company._id)}
							className="cursor-pointer"
							data-testid={`view-company-${company._id}`}
						>
							<FiEye size={17} className="text-txt-primary" />
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						<p>View Company</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>

			<TooltipProvider>
				<Tooltip key={`toggle-${company._id}`}>
					<TooltipTrigger asChild>
						<Button
							variant="plain"
							onClick={() => onToggleStatus(company)}
							className="cursor-pointer"
							data-testid={`toggle-status-${company._id}`}
						>
							<RiExchangeFundsLine size={17} />
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						<p>Toggle Company Status</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		</div>
	);
}
