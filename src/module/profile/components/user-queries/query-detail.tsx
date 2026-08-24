import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import EmailForm from "@/module/profile/components/user-queries/email-form";
import { USER_QUERY_STATUS, type IQueryDetailProps, type TSendEmailPayload } from "@/module/profile/types";
import { getUserNameInitials } from "@/module/profile/utils/helpers";
import { format, isValid } from "date-fns";
import { ArrowLeft } from "lucide-react";
import useUserQueryAPI from "@/module/profile/hooks/useUserQueryAPI";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function QueryDetail({ query, onBack, showBackButton = false }: IQueryDetailProps) {
	const { useSendEmail, useUpdateQuery } = useUserQueryAPI();

	const { mutateAsync: sendEmail } = useSendEmail();
	const { mutateAsync: updateQuery } = useUpdateQuery();

	const [isFailedToUpdateStatus, setIsFailedToUpdateStatus] = useState(false);
	const [queryStatus, setQueryStatus] = useState<USER_QUERY_STATUS | undefined>(query?.status);

	const handleSendEmail = async (emailData: TSendEmailPayload) => {
		if (!query) return;

		await sendEmail({ id: query._id, payload: emailData });
	};

	if (!query) {
		return (
			<div data-testid="no-query-selected" className="bg-background flex h-full flex-1 items-center justify-center">
				<p className="text-muted-foreground text-center text-lg">Select a query to view details</p>
			</div>
		);
	}

	const handleStatusChange = async (status: USER_QUERY_STATUS) => {
		try {
			setQueryStatus(status);
			await updateQuery({ id: query._id, data: { status } });
		} catch (error) {
			setIsFailedToUpdateStatus(true);

			setTimeout(() => {
				setIsFailedToUpdateStatus(false);
				setQueryStatus(query?.status);
			}, 3000);
			console.error("Failed to update query status:", error);
		}
	};
	const formattedDate = isValid(new Date(query.createdAt)) ? format(query.createdAt, "dd/MM/yyyy") : "—";

	return (
		<div
			data-testid="query-detail"
			className="bg-background text-txt-primary flex h-full flex-1 flex-col overflow-hidden"
		>
			<div className="flex items-center gap-4 p-2 md:p-4">
				{showBackButton && (
					<Button data-testid="back-button" variant="ghost" size="sm" onClick={onBack} className="p-2 lg:hidden">
						<ArrowLeft className="h-4 w-4" />
					</Button>
				)}
				<Avatar className="size-10 lg:size-12">
					<AvatarFallback className="bg-muted text-foreground">{getUserNameInitials(query.name.first)}</AvatarFallback>
				</Avatar>
				<div className="min-w-0 flex-1">
					<div className="mb-1 flex flex-col">
						<p className="text-foreground truncate text-base font-medium">
							{query.name?.first} {query.name?.last}
						</p>
						<span data-testid="email-span" className="text-muted-foreground truncate text-xs lg:text-sm">
							{query.email}
						</span>
					</div>
				</div>
				<Select
					data-testid="mock-select"
					value={queryStatus}
					onValueChange={(status) => void handleStatusChange(status as USER_QUERY_STATUS)}
				>
					<SelectTrigger
						className={cn(
							"w-[110px] transition-colors duration-500 sm:w-[180px]",
							isFailedToUpdateStatus && "border-error ring-error bg-red-50"
						)}
						data-testid="select-trigger"
					>
						<SelectValue placeholder="Mark as" />
					</SelectTrigger>
					<SelectContent>
						{Object.values(USER_QUERY_STATUS).map((status) => (
							<SelectItem key={status} value={status}>
								{status}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="custom-scrollbar flex flex-1 flex-col overflow-hidden p-2 pb-0 lg:p-4 lg:pb-0">
				<div className="mb-6 flex-1 space-y-3 overflow-y-auto lg:mb-8">
					<div className="space-x-2">
						<span className="text-base font-bold">Ticket ID: </span>
						<span className="text-base">{query._id}</span>
					</div>

					<div className="space-x-2">
						<span className="text-base font-bold">Subject: </span>
						<span className="text-base">{query.subject}</span>
					</div>

					<p data-testid="message-content" className="text-base leading-relaxed">
						{query.message}
					</p>

					<p className="text-right">Date: {formattedDate}</p>
				</div>

				<EmailForm onSendEmail={handleSendEmail} />
			</div>
		</div>
	);
}
