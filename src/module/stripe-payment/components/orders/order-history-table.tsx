import type { IOrderHistoryTableProps } from "@/module/stripe-payment/types";
import { DataTable } from "@/components/common/table/table";
import { OrderColumns } from "@/module/stripe-payment/components/orders/order-history-column";
import Image from "next/image";

const OrderHistoryTable = ({ data, sorting, setSorting, filters, setFilters }: IOrderHistoryTableProps) => {
	return (
		<>
			{!data?.length && (
				<div className="flex min-h-[50vh] flex-1 flex-col items-center justify-center">
					<Image src="/assets/png/no-orders.png" alt="No data" width={200} height={200} />
					<p className="text-xl font-medium">You haven’t ordered anything yet.</p>
				</div>
			)}
			{data?.length > 0 && (
				<DataTable
					columns={OrderColumns()}
					data={data}
					sorting={sorting}
					onSortingChange={setSorting}
					filters={filters}
					onFiltersChange={setFilters}
				/>
			)}
		</>
	);
};

export default OrderHistoryTable;
