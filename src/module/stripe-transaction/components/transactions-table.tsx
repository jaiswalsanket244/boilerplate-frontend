import { DataTable } from "@/components/common/table/table";
import { TransactionsColumns } from "@/module/stripe-transaction/components/transactions-column";
import type { IStripeTransactionsTableProps } from "@/module/stripe-transaction/types";

const TransactionsTable: React.FC<IStripeTransactionsTableProps> = ({
	data,
	sorting,
	setSorting,
	filters,
	setFilters,
}) => {
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
};

export default TransactionsTable;
