import VendorActionsDropdown from "@/module/stripe-connect/components/vendors/vendor-actions-dropdown";
import { type IVendor } from "@/module/stripe-connect/types";
import type { ColumnDef } from "@tanstack/react-table";

export const VendorsTableColumns = (): ColumnDef<IVendor>[] => [
	{
		accessorKey: "name",
		header: () => <p className="pl-10">Vendor Name</p>,
		cell: ({ row }) => {
			return <div className="pl-10 font-medium">{row.original.name}</div>;
		},
		size: 200,
	},
	{
		accessorKey: "email",
		header: "Email",
		cell: ({ row }) => {
			return <div className="font-medium">{row.original.email}</div>;
		},
		size: 300,
	},

	{
		accessorKey: "Action",
		header: () => <div className="text-center">Action</div>,
		cell: ({ row }) => <VendorActionsDropdown row={row} />,
		size: 200,
	},
];
