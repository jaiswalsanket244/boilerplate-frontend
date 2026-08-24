"use client";

import { DataTable } from "@/components/common/table/table";
import { canAccess } from "@/lib/utils/access-check";
import { ProductColumns } from "@/module/stripe-connect/components/products/product-column";
import type { ProductsTableDataType } from "@/module/stripe-connect/types/index";
import { useMenuStore } from "@/stores/menu-store";
import { PERMISSIONS } from "@/types/permission";

export default function ProductsTable({ data, sorting, setSorting, filters, setFilters }: ProductsTableDataType) {
	const permissions = useMenuStore().permissions;

	return (
		<div className="border-border rounded-lg border">
			<DataTable
				columns={ProductColumns(canAccess(permissions, PERMISSIONS.STRIPE_CONNECT_PRODUCTS_MANAGE))}
				data={data}
				sorting={sorting}
				onSortingChange={setSorting}
				filters={filters}
				onFiltersChange={setFilters}
			/>
		</div>
	);
}
