import type { ColumnDef } from "@tanstack/react-table";
import { STRIPE_CONNECT_PAYMENT_STATUS, type Transactions } from "@/module/stripe-connect/types";
import { Badge } from "@/components/ui/badge";

export const TransactionsColumns = (): ColumnDef<Transactions>[] => [
	{
		accessorKey: "serialNumber",
		header: "S. No.",
		cell: ({ row }) => {
			return <div className="font-medium">{row.index + 1}.</div>;
		},
		size: 100,
	},
	{
		accessorKey: "user",
		header: () => <div className="text-center">User</div>,
		cell: ({ row }) => {
			const user = row.original.user;
			const fullName = `${user?.name?.first || ""} ${user?.name?.last || ""}`.trim();
			const displayName = fullName || "Unknown User";
			return <div className="text-center font-medium">{displayName}</div>;
		},
		size: 300,
	},
	{
		accessorKey: "product",
		header: () => <div className="text-center">Product</div>,
		cell: ({ row }) => {
			const productName = row.original.product?.name || "Unknown Product";
			return <p className="w-full text-center">{productName}</p>;
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
		header: () => <div className="text-center">Amount to be received(in $)</div>,
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
		accessorKey: "status",
		header: () => <div className="text-center">Payment Status</div>,
		cell: ({ row }) => {
			const status = row.original.status;

			const getStatusClasses = (status: string) => {
				switch (status) {
					case STRIPE_CONNECT_PAYMENT_STATUS.PAID:
						return "border-green-lighter bg-green-lighter hover:bg-green-lighter text-green";
					case STRIPE_CONNECT_PAYMENT_STATUS.PENDING:
						return "border-yellow-50 bg-yellow-50 hover:bg-yellow-lighter text-yellow-700";
					case STRIPE_CONNECT_PAYMENT_STATUS.REFUNDED:
						return "border-red-lighter bg-red-lighter hover:bg-red-lighter text-red";
					default:
						return "bg-gray-100 text-gray-800";
				}
			};

			const getStatusLabel = (status: string) => {
				switch (status) {
					case STRIPE_CONNECT_PAYMENT_STATUS.PAID:
						return "Received";
					case STRIPE_CONNECT_PAYMENT_STATUS.PENDING:
						return "Pending";
					case STRIPE_CONNECT_PAYMENT_STATUS.REFUNDED:
						return "Refunded";
					default:
						return status;
				}
			};

			return (
				<div className="flex justify-center">
					<Badge variant="default" className={`${getStatusClasses(status)} capitalize shadow-none`}>
						{getStatusLabel(status)}
					</Badge>
				</div>
			);
		},
	},
];
