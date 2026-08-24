import { DataTable } from "@/components/common/table/table";
import { PromotionCodeColumns } from "@/module/stripe-payment/components/promotion-codes/promotion-codes-columns";
import type { IPromotionCodeTableProps } from "@/module/stripe-payment/types";

export const PromotionCodeTable = ({ data, setFilters, setSorting, sorting, filters }: IPromotionCodeTableProps) => {
	return (
		<DataTable
			columns={PromotionCodeColumns()}
			data={data}
			sorting={sorting}
			onSortingChange={setSorting}
			filters={filters}
			onFiltersChange={setFilters}
		/>
	);
};
