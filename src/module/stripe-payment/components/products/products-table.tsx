"use client";

import { DataTable } from "@/components/common/table/table";
import { canAccess } from "@/lib/utils/access-check";
import { ProductColumns } from "@/module/stripe-payment/components/products/product-column";
import type { IProductsTableProps } from "@/module/stripe-payment/types";
import { useMenuStore } from "@/stores/menu-store";
import { PERMISSIONS } from "@/types/permission";

export default function ProductsTable({ data, sorting, setSorting, filters, setFilters }: IProductsTableProps) {
	const permissions = useMenuStore().permissions;
	return (
		<DataTable
			columns={ProductColumns(canAccess(permissions, PERMISSIONS.STRIPE_PAYMENT_PRODUCTS_MANAGE))}
			data={data}
			sorting={sorting}
			onSortingChange={setSorting}
			filters={filters}
			onFiltersChange={setFilters}
		/>
	);
}
