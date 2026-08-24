import type { IOrderDetails } from "@/module/stripe-payment/types";
import type { ColumnDef } from "@tanstack/react-table";

import RefundDialog from "@/module/stripe-payment/components/orders/refund-dialog";

export const OrderColumns = (): ColumnDef<IOrderDetails>[] => {
	const columns: ColumnDef<IOrderDetails>[] = [
		{
			accessorKey: "serialNumber",
			header: "S. No.",
			cell: ({ row }) => {
				return <div className="font-medium">{row.index + 1}</div>;
			},
			size: 300,
		},
		{
			accessorKey: "productName",
			header: () => <div className="text-center">Product</div>,
			cell: ({ row }) => {
				const name = row.original.productName || "Unknown Product";
				return <div className="text-center font-medium text-txt-primary-900">{name}</div>;
			},
			size: 300,
		},
		{
			accessorKey: "orderPlacedAt",
			header: () => <div className="text-center">Date of Purchase</div>,
			cell: ({ row }) => {
				const date = new Date(row.original.orderPlacedAt);
				return (
					<div className="flex justify-center text-txt-primary-800">
						{date.toLocaleDateString("en-GB")} {/* DD/MM/YYYY format */}
					</div>
				);
			},
			size: 300,
		},
		{
			accessorKey: "amountPaid",
			header: () => <div className="text-center">Amount (in $)</div>,
			enableSorting: true,
			filterFn: (row, columnId, filterValue: { min?: number; max?: number }) => {
				const amount = row.getValue<number>(columnId) ?? 0;
				const min = filterValue?.min ?? null;
				const max = filterValue?.max ?? null;

				return (!min || amount >= min) && (!max || amount <= max);
			},
			cell: ({ row }) => {
				const amount = row.original.amountPaid ?? 0;
				return <div className="text-center font-medium">{amount.toFixed(2)}</div>;
			},
			size: 100,
		},
		{
			id: "orderStatus",
			header: () => <div className="text-center">Order Status</div>,
			size: 300,
			cell: ({ row }) => {
				const { refunded } = row.original;
				const status = refunded ? "Cancelled" : "Complete";

				return (
					<div className="flex justify-center">
						<span
							className={`rounded-md px-3 py-1 text-sm font-medium ${
								status === "Complete" ? "bg-green-50 text-green" : "bg-red-50 text-red"
							}`}
						>
							{status}
						</span>
					</div>
				);
			},
		},

		{
			id: "refundStatus",
			header: () => <div className="text-center">Refund Status</div>,
			size: 300,
			cell: ({ row }) => {
				const { refunded } = row.original;

				if (!refunded) {
					return <div className="text-center text-gray-400">-</div>;
				}

				return (
					<div className="flex justify-center">
						<span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">Refunded</span>
					</div>
				);
			},
		},
		{
			id: "action",
			header: () => <div className="text-center">Action</div>,
			cell: ({ row }) => <RefundDialog row={row} />,
			size: 300,
		},
	];

	return columns;
};
