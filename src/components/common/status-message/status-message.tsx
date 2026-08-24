import { cn } from "@/lib/utils";
import { MESSAGE_STATUS } from "@/types";
import { AlertCircle, CheckCircle2, InfoIcon } from "lucide-react";

export const StatusMessage = ({ type, message }: { type: MESSAGE_STATUS; message: string }) => {
	const getIcon = () => {
		switch (type) {
			case MESSAGE_STATUS.SUCCESS:
				return <CheckCircle2 className="h-4 w-4" />;
			case MESSAGE_STATUS.ERROR:
				return <AlertCircle className="h-4 w-4" />;
			case MESSAGE_STATUS.INFO:
				return <InfoIcon className="h-4 w-4" />;
			default:
				return null;
		}
	};

	return (
		<div
			className={cn(
				"flex items-center gap-2 rounded-lg p-3 text-sm transition-all",
				type === MESSAGE_STATUS.SUCCESS
					? "border border-green-200 bg-green-50 text-green-700"
					: type === MESSAGE_STATUS.ERROR
						? "border border-red-200 bg-red-50 text-red-700"
						: "border border-blue-200 bg-blue-50 text-blue-700"
			)}
		>
			{getIcon()}
			<span>{message}</span>
		</div>
	);
};
