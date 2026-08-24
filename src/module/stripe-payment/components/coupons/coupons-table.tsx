import { DataTable } from "@/components/common/table/table";
import type { ICouponsTableProps } from "@/module/stripe-payment/types";
import { CouponsTableColumns } from "@/module/stripe-payment/components/coupons/coupons-table-columns";

const CouponsTable = ({ data }: ICouponsTableProps) => {
	return (
		<DataTable
			rowClassname=""
			headerRowClassname="text-sm font-medium text-left"
			columns={CouponsTableColumns()}
			data={data}
		/>
	);
};

export default CouponsTable;
