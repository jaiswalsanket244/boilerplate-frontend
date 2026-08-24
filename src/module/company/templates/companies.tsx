"use client";

import { Pagination } from "@/components/common/pagination/pagination";
import { useRecentlyChangedRows } from "@/hooks/use-recently-changed-rows";
import AddCompanyButton from "@/module/company/components/add-company-button";
import { CompaniesTable } from "@/module/company/components/companies-table";
import { CompanyStatusDialog } from "@/module/company/components/company-status-dialog";
import { SearchBar } from "@/module/company/components/search-bar";
import { useCompanyAPI } from "@/module/company/hooks/useCompany";
import { useCompanyOperations } from "@/module/company/hooks/useCompanyOperations";
import { usePagination } from "@/module/company/hooks/usePagination";
import { useProfileAPI } from "@/module/profile/hooks/useProfile";
import PageHeader from "@common/page-header";
import { useState } from "react";

const pageHeader = {
	title: "Companies",
};

export default function Companies() {
	const { useGetAllCompanyData } = useCompanyAPI();
	const { useGetUserData } = useProfileAPI();
	const { addRow, getRowAnimationClasses } = useRecentlyChangedRows();

	const [searchValue, setSearchValue] = useState<string>("");
	const { page, pageSize, handlePageChange, handlePageSizeChange, calculateTotalPages } = usePagination();

	const { data: companyData, isSuccess, isPending } = useGetAllCompanyData({ searchValue, page, pageSize });
	const { data: superAdminDetails } = useGetUserData();

	const { companyId, companyStatus, openStatusDialog, closeStatusDialog, redirectToAdminPage, handleStatusChange } =
		useCompanyOperations({
			onSuccess: (action, companyRef) => {
				addRow(action, companyRef);
			},
		});

	const totalPages = calculateTotalPages((companyData && companyData[0]?.total) || 0);
	const companies = (isSuccess && companyData[0]?.items) || [];

	return (
		<>
			<PageHeader title={pageHeader.title}>
				<AddCompanyButton />
			</PageHeader>

			<SearchBar onSearch={setSearchValue} />

			<CompaniesTable
				companies={companies}
				currentUserEmail={superAdminDetails?.email}
				onViewCompany={redirectToAdminPage}
				onToggleStatus={openStatusDialog}
				getRowAnimationClasses={getRowAnimationClasses}
				isLoading={isPending}
			/>

			<Pagination
				page={page}
				pageSize={pageSize}
				totalPages={totalPages}
				totalItems={companyData?.[0]?.total || 0}
				handlePageChange={(newPage) => handlePageChange(newPage, totalPages)}
				handlePageSizeChange={handlePageSizeChange}
			/>

			<CompanyStatusDialog
				isOpen={!!companyId}
				currentStatus={companyStatus}
				onClose={closeStatusDialog}
				onConfirm={handleStatusChange}
			/>
		</>
	);
}
