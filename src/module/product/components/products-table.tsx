"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRecentlyChangedRows } from "@/hooks/use-recently-changed-rows";
import { ProductTableRow } from "@/module/product/components/product-table-row";
import type { ProductsTableProps } from "@/module/product/types";

export function ProductsTable({ products, isSuccess, onEdit, onDelete }: ProductsTableProps) {
	const hasProducts = isSuccess && products && products.length > 0;

	const { getRowAnimationClasses } = useRecentlyChangedRows();

	return (
		<div className="relative overflow-x-auto sm:rounded-lg">
			<Table data-testid="products-table">
				<TableHeader className="bg-muted text-txt-primary-800 text-xs uppercase" data-testid="table-header">
					<TableRow>
						<TableHead>Product Name</TableHead>
						<TableHead>Description</TableHead>
						<TableHead>Price</TableHead>
						<TableHead className="text-center">Action</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody data-testid="table-body">
					{hasProducts ? (
						products.map((product) => (
							<ProductTableRow
								key={String(product._id)}
								product={product}
								rowClassName={getRowAnimationClasses(String(product._id))}
								onEdit={() => onEdit(product)}
								onDelete={() => onDelete(String(product._id))}
							/>
						))
					) : (
						<TableRow>
							<TableCell colSpan={4} className="py-5 text-center">
								<p className="mt-3" data-testid="no-data-message">
									No Data
								</p>
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}
