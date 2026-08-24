import React from "react";
import type { IVendorsTableProps } from "@/module/stripe-connect/types";
import { DataTable } from "@/components/common/table/table";
import { VendorsTableColumns } from "@/module/stripe-connect/components/vendors/vendor-table-columns";

const VendorsTable = ({ data }: IVendorsTableProps) => {
	return (
		<div className="overflow-hidden rounded-lg">
			<DataTable data={data} columns={VendorsTableColumns()} />
		</div>
	);
};

export default VendorsTable;
