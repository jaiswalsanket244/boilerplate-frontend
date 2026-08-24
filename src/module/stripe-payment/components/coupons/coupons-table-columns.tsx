import type { ColumnDef } from "@tanstack/react-table";
import type { ICoupon } from "@/module/stripe-payment/types";
import CouponsActionsCell from "@/module/stripe-payment/components/coupons/coupon-actions";

export const CouponsTableColumns = (): ColumnDef<ICoupon>[] => {
	const columns: ColumnDef<ICoupon>[] = [
		{
			accessorKey: "serialNumber",
			header: "S. No.",
			cell: ({ row }) => {
				return <div className="font-medium">{row.index + 1}</div>;
			},
			size: 300,
		},
		{
			accessorKey: "name",
			header: () => <div className="flex justify-start">Coupon Name</div>,
			cell: ({ row }) => {
				const name = row.original.name;
				return <p className="text-left font-medium">{name}</p>;
			},
			size: 300,
		},
		{
			accessorKey: "duration",
			header: () => <div className="flex justify-start">Duration</div>,
			cell: ({ row }) => {
				return <div className="flex justify-start">{row.original.duration}</div>;
			},
			size: 300,
		},
		{
			accessorKey: "amount_off",
			header: () => <div className="text-center">Amount Off</div>,
			cell: ({ row }) => {
				return <div className="flex justify-center">{row.original.amount_off ?? "N/A"}</div>;
			},
		},
		{
			accessorKey: "percent_off",
			header: () => <div className="text-center">% Off</div>,
			cell: ({ row }) => {
				return <div className="flex justify-center">{row.original.percent_off ?? "N/A"}</div>;
			},
		},
		{
			accessorKey: "duration_in_months",
			header: () => (
				<div className="flex flex-col items-center text-center">
					<span>Duration</span>
					<span className="text-xs"> (in months)</span>
				</div>
			),
			cell: ({ row }) => {
				return <div className="flex justify-center">{row.original.duration_in_months ?? "N/A"}</div>;
			},
		},
		{
			accessorKey: "max_redemptions",
			header: () => (
				<div className="flex flex-col items-center">
					<span>Max</span>
					<span>Redemptions</span>
				</div>
			),
			cell: ({ row }) => {
				return <div className="flex justify-center">{row.original.max_redemptions ?? "N/A"}</div>;
			},
		},
		{
			accessorKey: "times_redeemed",
			header: () => (
				<div className="flex flex-col items-center text-center">
					<span>Times</span>
					<span>Redeemed</span>
				</div>
			),
			cell: ({ row }) => {
				return <div className="flex justify-center">{row.original.times_redeemed ?? "N/A"}</div>;
			},
		},
		{
			accessorKey: "valid",
			header: () => <div className="text-center">Valid</div>,
			cell: ({ row }) => {
				return (
					<div className={`flex justify-center ${row.original.valid ? "text-green-600" : "text-red-600"}`}>
						{row.original.valid ? "Yes" : "No"}
					</div>
				);
			},
		},
		{
			accessorKey: "actions",
			header: () => <div className="text-center">Actions</div>,
			cell: ({ row }) => {
				return <CouponsActionsCell row={row} />;
			},
		},
	];

	return columns;
};
