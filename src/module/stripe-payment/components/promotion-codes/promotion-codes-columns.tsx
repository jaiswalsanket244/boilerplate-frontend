import type { IPromotionCode } from "@/module/stripe-payment/types";
import type { ColumnDef } from "@tanstack/react-table";
import { format, fromUnixTime, isAfter } from "date-fns";
import UpdateCodeStatusButton from "@/module/stripe-payment/components/promotion-codes/update-code-status-button";

export function PromotionCodeColumns(): ColumnDef<IPromotionCode>[] {
	const columns: ColumnDef<IPromotionCode>[] = [
		{
			accessorKey: "serialNumber",
			header: "S. No.",
			cell: ({ row }) => {
				return <div className="font-medium">{row.index + 1}</div>;
			},
			size: 100,
		},
		{
			accessorKey: "code",
			header: () => <div className="flex justify-start">Code</div>,
			cell: ({ row }) => {
				const code = row.original.code;
				return <p className="text-left font-medium">{code}</p>;
			},
			size: 300,
		},
		{
			accessorKey: "max_redemptions",
			header: () => <div className="flex justify-center">Max Redeems</div>,
			cell: ({ row }) => {
				return <div className="flex justify-center">{row.original.max_redemptions ?? "N/A"}</div>;
			},
			size: 200,
		},
		{
			accessorKey: "expires_at",
			header: () => <div className="flex justify-start">Expires At</div>,
			cell: ({ row }) => {
				const expiresAt = row.original.expires_at;
				return <p className="text-left font-medium">{format(fromUnixTime(expiresAt), "dd/MM/yyyy")}</p>;
			},
			size: 200,
		},
		{
			accessorKey: "actions",
			header: () => <div className="flex justify-center">Actions</div>,
			cell: ({ row }) => {
				const isExpired = isAfter(new Date(), fromUnixTime(row.original.expires_at));
				return <div className="flex justify-center">{isExpired ? "-" : <UpdateCodeStatusButton row={row} />}</div>;
			},
		},
	];

	return columns;
}
