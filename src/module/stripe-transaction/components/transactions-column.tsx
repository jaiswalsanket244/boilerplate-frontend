import type { ColumnDef } from "@tanstack/react-table";
import {
	PAYMENT_STATUS,
	type StatusBadgeProps,
	TRANSFER_STATUS,
	type ITransaction,
} from "@/module/stripe-transaction/types";
import { Badge } from "@/components/ui/badge";

const colorClasses: Record<string, string> = {
	green: "border-green-lighter bg-green-lighter hover:bg-green-lighter text-green",
	yellow: "border-yellow-50 bg-yellow-50 hover:bg-yellow-lighter text-yellow-700",
	red: "border-red-lighter bg-red-lighter hover:bg-red-lighter text-red",
	gray: "bg-gray-100 text-gray-800",
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, config }) => {
	const { label, color } = config[status] || { label: status, color: "gray" };
	const className = (colorClasses[color] || colorClasses["gray"]) as string;
	return (
		<div className="flex justify-center">
			<Badge variant="default" className={`${className} capitalize shadow-none`}>
				{label}
			</Badge>
		</div>
	);
};

export const TransactionsColumns = (): ColumnDef<ITransaction>[] => [
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
		header: "User",
		cell: ({ row }) => {
			const user = row.original.user;

			const displayName = user.name || "Unknown User";
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
		accessorKey: "vendor",
		header: () => <div className="text-center">Vendor</div>,
		cell: ({ row }) => {
			const name = row.original.vendor?.name || "Unknown Vendor";
			return <p className="w-full text-center">{name}</p>;
		},
		size: 300,
	},
	{
		accessorKey: "createdAt",
		header: () => <div className="text-center">Date</div>,

		size: 300,

		cell: ({ row }) => {
			const date = row.original.purchaseDate || row.original.createdAt;
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
		header: () => <div className="text-center">Amount (in $)</div>,

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
		cell: ({ row }) => (
			<StatusBadge
				status={row.original.paymentStatus}
				config={{
					[PAYMENT_STATUS.PAID]: { label: "Received", color: "green" },
					[PAYMENT_STATUS.PENDING]: { label: "Pending", color: "yellow" },
					[PAYMENT_STATUS.REFUNDED]: { label: "Refunded", color: "red" },
				}}
			/>
		),
	},
	{
		accessorKey: "transferStatus",
		header: () => <div className="text-center">Transfer Status</div>,
		cell: ({ row }) => (
			<StatusBadge
				status={row.original.transferStatus}
				config={{
					[TRANSFER_STATUS.SUCCEEDED]: { label: "Succeeded", color: "green" },
					[TRANSFER_STATUS.PENDING]: { label: "Pending", color: "yellow" },
					[TRANSFER_STATUS.FAILED]: { label: "Failed", color: "red" },
				}}
			/>
		),
	},
];
