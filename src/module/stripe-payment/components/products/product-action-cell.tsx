"use client";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ProductModal from "@/module/stripe-payment/components/products/create-product-modal";
import DeleteProductDialog from "@/module/stripe-payment/components/products/delete-product-dialog";
import type { IProduct } from "@/module/stripe-payment/types";
import type { Row } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

export default function ProductActionsCell({ row }: { row: Row<IProduct> }) {
	const product = row.original;

	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const handleEdit = () => {
		setIsMenuOpen(false);
		setIsEditDialogOpen((prev) => !prev);
	};

	return (
		<>
			<DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
				<DropdownMenuTrigger asChild>
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
					<DropdownMenuItem
						onClick={() => {
							setIsDeleteDialogOpen(true);
							setIsMenuOpen(false);
						}}
						className="cursor-pointer text-red-600"
					>
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
