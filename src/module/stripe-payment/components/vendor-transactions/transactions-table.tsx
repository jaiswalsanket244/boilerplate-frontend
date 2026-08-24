"use client";

import { TransactionsColumns } from "@/module/stripe-payment/components/vendor-transactions/transactions-column";
import { DataTable } from "@/components/common/table/table";
import type { ITransactionsTableProps } from "@/module/stripe-payment/types";

export default function TransactionsTable({ data, sorting, setSorting, filters, setFilters }: ITransactionsTableProps) {
	return (
		<DataTable
			columns={TransactionsColumns()}
			data={data}
			sorting={sorting}
			onSortingChange={setSorting}
			filters={filters}
			onFiltersChange={setFilters}
		/>
	);
}
