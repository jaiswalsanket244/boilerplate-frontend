"use client";

import React, { useState } from "react";
import PricingPlans from "@/module/subscription/components/pricing-plans";
import { SortControl } from "@/components/common/sort/sort";
import { Pagination } from "@/components/common/pagination/pagination";
import { ArrowUpDown, Download } from "lucide-react";
import SearchBox from "@/components/common/search-box/search-box";
import { Button } from "@/components/ui/button";
import type { SortingState } from "@tanstack/react-table";
import { exportToCSV } from "@/lib/utils/export-to-csv";

const Subscriptions = () => {
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [value, setValue] = useState<string>("");
	const [sorting, setSorting] = useState<SortingState>([]);

	const handleInputChange = (value: string) => {
		setValue(value);
	};

	const billingData = [
		{
			serialNumber: 1,
			planName: "Product Name",
			billedOn: "DD/MM/YY",
			amount: 123.54,
			invoice: "dummy",
		},
		{
			serialNumber: 2,
			planName: "Product Name",
			billedOn: "DD/MM/YY",
			amount: 22.54,
			invoice: "dummy",
		},
		{
			serialNumber: 3,
			planName: "Product Name",
			billedOn: "DD/MM/YY",
			amount: 23.54,
			invoice: "dummy",
		},
		{
			serialNumber: 4,
			planName: "Product Name",
			billedOn: "DD/MM/YY",
			amount: 3.54,
			invoice: "dummy",
		},
		{
			serialNumber: 5,
			planName: "Product Name",
			billedOn: "DD/MM/YY",
			amount: 53.54,
			invoice: "dummy",
		},
		{
			serialNumber: 6,
			planName: "Product Name",
			billedOn: "DD/MM/YY",
			amount: 92.54,
			invoice: "dummy",
		},
		{
			serialNumber: 7,
			planName: "Product Name",
			billedOn: "DD/MM/YY",
			amount: 223.54,
			invoice: "dummy",
		},
		{
			serialNumber: 8,
			planName: "Product Name",
			billedOn: "DD/MM/YY",
			amount: 223.54,
			invoice: "dummy",
		},
		{
			serialNumber: 9,
			planName: "Product Name",
			billedOn: "DD/MM/YY",
			amount: 223.54,
			invoice: "dummy",
		},
		{
			serialNumber: 10,
			planName: "Product Name",
			billedOn: "DD/MM/YY",
			amount: 223.54,
			invoice: "dummy",
		},
		{
			serialNumber: 11,
			planName: "Product Name",
			billedOn: "DD/MM/YY",
			amount: 223.54,
			invoice: "dummy",
		},
		{
			serialNumber: 12,
			planName: "Product Name",
			billedOn: "DD/MM/YY",
			amount: 223.54,
			invoice: "dummy",
		},
	];

	const sortableColumns = [
		{ key: "billedOn", label: "Billed On" },
		{ key: "amount", label: "Amount" },
	];

	const handlePageChange = (newPage: number) => {
		if (newPage < 1) return;
		if (newPage > totalPages) return;
		setPage(newPage);
	};

	const handlePageSizeChange = (newPageSize: number) => {
		setPageSize(newPageSize);
		setPage(1);
	};

	const searchFilteredData = billingData.filter((item) => {
		if (!value) return true;
		return Object.values(item).some((val) => val.toString().toLowerCase().includes(value.toLowerCase()));
	});

	const handleExportData = () => {
		exportToCSV(
			billingData,
			"Serial Number,Plan Name,Billed On,Amount",
			`billing_history_${new Date().toISOString().slice(0, 10)}`
		);
	};

	const totalPages = Math.ceil(searchFilteredData.length / pageSize);

	return (
		<div>
			<PricingPlans />
			<div className="text-grey mb-2 text-lg">Billing History</div>

			<div className="mb-4 flex items-center justify-between gap-2">
				<div className="item-center flex gap-2">
					<SearchBox
						variant="outline"
						searchTerm={value}
						onSearchChange={handleInputChange}
						placeholder="Search here"
					/>

					<SortControl sortableColumns={sortableColumns} sorting={sorting} onSortChange={setSorting}>
						<Button variant="outline" size="icon">
							<ArrowUpDown className="h-4 w-4" />
						</Button>
					</SortControl>
				</div>
				<Button onClick={handleExportData}>
					<Download />
				</Button>
			</div>

			{/* <DataTable columns={columns} data={currentData} sorting={sorting} /> */}

			<Pagination
				page={page}
				pageSize={pageSize}
				handlePageChange={handlePageChange}
				handlePageSizeChange={handlePageSizeChange}
				totalPages={totalPages}
				totalItems={searchFilteredData.length}
			/>
		</div>
	);
};

export default Subscriptions;
