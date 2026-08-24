import type { ColumnDef } from "@tanstack/react-table";
import type { ProductInfo } from "@/module/stripe-connect/types";
import ProductActionsCell from "@/module/stripe-connect/components/products/product-action-cell";
import BuyProductCell from "@/module/stripe-connect/components/products/buy-product-cell";

export const ProductColumns = (showActions: boolean): ColumnDef<ProductInfo>[] => {
	const baseColumns: ColumnDef<ProductInfo>[] = [
		{
			accessorKey: "serialNumber",
			header: "S. No.",
			cell: ({ row }) => {
				return <div className="ml-2 font-medium">{row.index + 1}.</div>;
			},
			size: 10,
		},
		{
			accessorKey: "title",
			header: () => <div className="text-left">Product Name</div>,
			cell: ({ row }) => {
				const name = row.original.title || "Untitled Product";
				return <p className="text-txt-primary-900 text-left text-sm font-medium">{name}</p>;
			},
			size: 200,
		},
		{
			accessorKey: "price",
			header: () => <div className="text-center">Price (in $)</div>,

			cell: ({ row }) => {
				const price = row.original.price ?? 0;
				return <div className="text-center text-sm font-medium">{price.toFixed(2)}</div>;
			},
			size: 100,
		},
	];

	if (showActions) {
		return [
			...baseColumns,
			{
				id: "actions",
				header: () => <div className="text-center">Actions</div>,
				cell: ({ row }) => <ProductActionsCell row={row} />,
				size: 100,
			},
		];
	}

	return [
		...baseColumns,
		{
			id: "buyNow",
			header: () => <div className="text-center">Purchase</div>,
			cell: ({ row }) => <BuyProductCell row={row} />,
			size: 100,
		},
	];
};
