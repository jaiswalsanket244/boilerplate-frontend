"use client";

import { TransactionsColumns } from "@/module/stripe-connect/components/vendor-transactions/all-vendor-transactions/transactions-column";
import { DataTable } from "@/components/common/table/table";
import type { TransactionsTableType } from "@/module/stripe-connect/types";

export default function TransactionsTable({ data, sorting, setSorting, filters, setFilters }: TransactionsTableType) {
	return (
		<div className="w-full space-y-4">
			<div className="rounded-lg border">
				<DataTable
					columns={TransactionsColumns()}
					data={data}
					sorting={sorting}
					onSortingChange={setSorting}
					filters={filters}
					onFiltersChange={setFilters}
				/>
			</div>
		</div>
	);
}
