"use client";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ProductModal from "@/module/stripe-connect/components/products/create-product-modal";
import DeleteProductDialog from "@/module/stripe-connect/components/products/delete-product-dialog";
import type { ProductInfo } from "@/module/stripe-connect/types";
import type { Row } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

export default function ProductActionsCell({ row }: { row: Row<ProductInfo> }) {
	const product = row.original;

	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	const handleEdit = () => setIsEditDialogOpen((prev) => !prev);

	return (
		<>
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
					<DropdownMenuItem onClick={() => void handleEdit()} className="cursor-pointer">
						<Pencil className="mr-2 h-4 w-4" />
						Edit Product
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="cursor-pointer text-red-600">
						<Trash2 className="mr-2 h-4 w-4" />
						Delete Product
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{isEditDialogOpen && (
				<ProductModal
					key={product._id}
					open={isEditDialogOpen}
					setOpen={setIsEditDialogOpen}
					onSuccess={() => void handleEdit()}
					product={product}
					mode="edit"
				/>
			)}

			{isDeleteDialogOpen && (
				<DeleteProductDialog
					key={product._id}
					product={product}
					open={isDeleteDialogOpen}
					setOpen={setIsDeleteDialogOpen}
				/>
			)}
		</>
	);
}
