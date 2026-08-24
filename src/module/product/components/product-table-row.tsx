"use client";

import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { routes } from "@/config/routes";
import { canAccess } from "@/lib/utils/access-check";
import { DeleteProductAlert } from "@/module/product/components/delete-product-alert";
import type { ProductTableRowProps } from "@/module/product/types";
import { formatPrice } from "@/module/product/utils/helpers";
import { useMenuStore } from "@/stores/menu-store";
import { PERMISSIONS } from "@/types/permission";
import { EditIcon, EyeIcon } from "lucide-react";
import Link from "next/link";

export function ProductTableRow({ product, rowClassName, onEdit, onDelete }: ProductTableRowProps) {
	const permissions = useMenuStore().permissions;
	const isAdmin = canAccess(permissions, PERMISSIONS.PRODUCTS_MANAGE);

	const detailsRoute = routes.products.details(String(product._id));

	return (
		<TableRow className={rowClassName} data-testid={`product-row-${product._id}`}>
			<TableCell data-testid="product-title" className="max-w-48 truncate">
				{product.title}
			</TableCell>
			<TableCell data-testid="product-description" className="max-w-xs overflow-hidden">
				{product.description !== undefined && (
					<div className="line-clamp-3" dangerouslySetInnerHTML={{ __html: product.description }} />
				)}
			</TableCell>
			<TableCell data-testid="product-price">${formatPrice(product.price)}</TableCell>
			<TableCell>
				<div className="flex items-center justify-center gap-3">
					{isAdmin && (
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										onClick={onEdit}
										variant="ghost"
										data-testid={`edit-button-${product._id}`}
										className="border-none p-2 hover:border"
									>
										<EditIcon className="size-5" />
									</Button>
								</TooltipTrigger>
								<TooltipContent>Edit Product</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					)}

					{isAdmin && <DeleteProductAlert onDeleteProduct={onDelete} productId={product._id} />}

					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Link href={detailsRoute} data-testid={`view-link-${product._id}`} className="p-2">
									<EyeIcon className="text-txt-primary size-4.5" />
								</Link>
							</TooltipTrigger>
							<TooltipContent>View Product</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
			</TableCell>
		</TableRow>
	);
}
