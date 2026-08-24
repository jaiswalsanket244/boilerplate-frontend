import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type IVendor } from "@/module/stripe-connect/types";
import type { Row } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

const VendorActionsDropdown = ({ row }: { row: Row<IVendor> }) => {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild className="">
				<div className="flex w-full justify-center gap-2">
					<Button variant="ghost" className="h-8 w-8 p-0 ">
						<span className="sr-only">Open menu</span>
						<MoreHorizontal className="h-4 w-4" />
					</Button>
				</div>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end" className="w-40">
				{/* TODO : For now we don't have any actions on vendor. will be added later */}
				<DropdownMenuItem className="cursor-pointer">Edit Vendor</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default VendorActionsDropdown;
