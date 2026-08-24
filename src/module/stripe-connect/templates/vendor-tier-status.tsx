"use client";

import { Pagination } from "@/components/common/pagination/pagination";
import SearchBox from "@/components/common/search-box/search-box";
import VendorsTable from "@/module/stripe-connect/components/vendors/vendors-table";
import { useStripeConnectAPI } from "@/module/stripe-connect/hooks/useStripeConnect";
import { debounce } from "lodash";
import { Loader } from "lucide-react";
import { useCallback, useState } from "react";

// This is part of `super-admin` flow.
export default function VendorTierStatus() {
	const [searchTerm, setSearchTerm] = useState("");

	const { useGetAllVendorsQuery } = useStripeConnectAPI();

	const [filterState, setFilterState] = useState({
		page: 1,
		pageSize: 10,
		searchValue: "",
	});
	const { data: vendorsData, isLoading } = useGetAllVendorsQuery(filterState);

	const { data: vendors = [], pagination } = vendorsData || {};
	const { totalPages = 1 } = pagination || {};

	const debouncedSetSearchValue = useCallback(
		debounce((value: string) => {
			setFilterState({ ...filterState, searchValue: value });
		}, 1000),
		[]
	);

	const handleInputChange = (value: string) => {
		setSearchTerm(value);
		debouncedSetSearchValue(value);
	};

	const handlePageChange = (newPage: number) => {
		if (newPage < 1) return;
		if (newPage > totalPages) return;

		setFilterState({ ...filterState, page: newPage });
	};

	const handlePageSizeChange = (newPageSize: number) => {
		setFilterState({ ...filterState, pageSize: newPageSize });
	};

	return (
		<div className="space-y-5">
			<h1 className="text-xl">Stripe Vendors</h1>

			<SearchBox
				onSearchChange={handleInputChange}
				variant="outline"
				placeholder="Search vendor by email"
				searchTerm={searchTerm}
			/>

			<div className="relative overflow-x-auto">
				{isLoading ? (
					<div className="flex min-h-[50vh] w-full items-center justify-center">
						<div className="flex items-center">
							<Loader className="mr-2 size-7 animate-spin" /> <span className="text-base">Loading Vendors....</span>
						</div>
					</div>
				) : (
					<>
						<VendorsTable data={vendors} />
						<Pagination
							page={filterState.page}
							totalPages={pagination?.totalPages || 0}
							pageSize={filterState.pageSize}
							handlePageChange={handlePageChange}
							totalItems={pagination?.totalCount || 0}
							handlePageSizeChange={handlePageSizeChange}
						/>
					</>
				)}
			</div>
		</div>
	);
}
