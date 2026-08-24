import type { ColumnDef } from "@tanstack/react-table";
import { PAYMENT_STATUS, type ITransaction } from "@/module/stripe-payment/types";
import { Badge } from "@/components/ui/badge";

export const TransactionsColumns = (): ColumnDef<ITransaction>[] => [
	{
		accessorKey: "serialNumber",
		header: "S. No.",
		cell: ({ row }) => {
			return <div className="font-medium">{row.index + 1}.</div>;
		},
		size: 50,
	},
	{
		accessorKey: "userName",
		header: () => <div className="text-center">User Name</div>,
		cell: ({ row }) => {
			return <div className="text-center font-medium">{row.original.userName}</div>;
		},
		size: 300,
	},
	{
		accessorKey: "productName",
		header: () => <div className="text-center">Product Name</div>,
		cell: ({ row }) => {
			return <p className="w-full text-center">{row.original.productName}</p>;
		},
		size: 300,
	},
	{
		accessorKey: "createdAt",
		header: () => <div className="text-center">Date</div>,

		size: 300,

		cell: ({ row }) => {
			const date = row.original.createdAt;
			if (!date) return <div>-</div>;

			// Show formatted value but keep raw ISO internally
			const formattedDate = new Date(date).toLocaleDateString("en-GB", {
				day: "2-digit",
				month: "2-digit",
				year: "2-digit",
			});
			return <div className="text-center">{formattedDate}</div>;
		},
	},

	{
		accessorKey: "amount",
		header: () => <div className="text-center">Amount(in $)</div>,
		enableSorting: true,
		cell: ({ row }) => {
			const amount = row.original.amount ?? 0;
			return (
				<div className="flex justify-center font-medium">
					<span className="w-16">${amount.toFixed(2)}</span>
				</div>
			);
		},
		size: 300,
	},
	{
		accessorKey: "paymentStatus",
		header: () => <div className="text-center">Payment Status</div>,
		cell: ({ row }) => {
			const status = row.original.paymentStatus;

			const getStatusClasses = (status: string) => {
				switch (status) {
					case PAYMENT_STATUS.PAID:
						return "border-green-200 bg-green-50 hover:bg-green-100 text-green";
					case PAYMENT_STATUS.PENDING:
						return "border-yellow-200 bg-yellow-50 hover:bg-yellow-100 text-yellow-700";
					case PAYMENT_STATUS.REFUNDED:
						return "border-red-200 bg-red-50 hover:bg-red-100 text-red";
					default:
						return "bg-gray-100 text-gray-800";
				}
			};

			const getStatusLabel = (status: string) => {
				switch (status) {
					case PAYMENT_STATUS.PAID:
						return "Received";
					case PAYMENT_STATUS.PENDING:
						return "Pending";
					case PAYMENT_STATUS.REFUNDED:
						return "Refunded";
					default:
						return status;
				}
			};

			return (
				<div className="flex justify-center">
					<Badge
						variant="default"
						className={`${getStatusClasses(status)} flex w-20 justify-center capitalize shadow-none`}
					>
						{getStatusLabel(status)}
					</Badge>
				</div>
			);
		},
	},
];
