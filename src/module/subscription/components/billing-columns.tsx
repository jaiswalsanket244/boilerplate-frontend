import type { ColumnDef } from "@tanstack/react-table";
import type { BillingHistory } from "@/module/subscription/types/index";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export const columns: ColumnDef<BillingHistory>[] = [
	{
		accessorKey: "serialNumber",
		header: "S. No",
	},
	{
		accessorKey: "planName",
		header: "Plan",
	},
	{
		accessorKey: "billedOn",
		header: "Billed On",
		enableSorting: true,
	},
	{
		accessorKey: "amount",
		header: "Amount",
		enableSorting: true,
	},
	{
		accessorKey: "invoice",
		header: "Download Invoice",
		cell: () => {
			const handleDownload = () => {
				console.log(`Downloading invoice for row`);
			};

			return (
				<div className="pl-7 text-left">
					<Button variant="ghost" size="sm" onClick={handleDownload} className="h-8 w-8 p-0 hover:bg-gray-100">
						<Download className="h-4 w-4" />
					</Button>
				</div>
			);
		},
	},
];
