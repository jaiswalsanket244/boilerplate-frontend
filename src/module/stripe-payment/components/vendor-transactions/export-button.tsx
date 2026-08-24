import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { useStripePaymentApi } from "@/module/stripe-payment/hooks/useStripePaymentApi";

export const ExportButton = () => {
	const { exportTransactions } = useStripePaymentApi();

	const [isDownloading, setIsDownloading] = useState(false);
	const [isFailed, setIsFailed] = useState(false);

	const handleDownload = async () => {
		try {
			setIsDownloading(true);
			const response = await exportTransactions();

			const url = window.URL.createObjectURL(new Blob([response.data]));

			// Create a temporary link
			const link = document.createElement("a");
			link.href = url;
			link.setAttribute("download", `transactions-${Date.now()}.xlsx`); // filename
			document.body.appendChild(link);
			link.click();

			// Clean up
			link.remove();
			window.URL.revokeObjectURL(url);
		} catch (error) {
			setIsFailed(true);
			setTimeout(() => setIsFailed(false), 3000);
		} finally {
			setIsDownloading(false);
		}
	};

	if (isFailed) {
		return (
			<div className="border-error bg-error/10 text-error flex h-10 shrink-0 items-center rounded-sm border p-2 font-bold transition-colors duration-300 ease-in-out">
				Export Failed
			</div>
		);
	}

	return (
		<Button
			type="button"
			variant={"outline"}
			className={`flex h-10 items-center gap-2`}
			onClick={() => {
				void handleDownload();
			}}
			disabled={isDownloading}
		>
			{isDownloading ? (
				<>
					<Loader2 className="size-5 animate-spin" />
					<span>Exporting...</span>
				</>
			) : (
				<>
					<Download className="h-4 w-4" /> <span>Export</span>
				</>
			)}
		</Button>
	);
};
