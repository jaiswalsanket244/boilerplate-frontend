"use client";

import { createColumns } from "@/module/teams/components/columns";
import { DataTable } from "@/components/common/table/table";
import { useMemo } from "react";
import type { IUsersTableProps } from "@/module/teams/types";

export default function UsersTable({
	data,
	sorting,
	setSorting,
	filters,
	setFilters,
	activeTab,
	canManageTeams,
	currentUser,
}: IUsersTableProps) {
	const columns = useMemo(
		() => createColumns(activeTab, canManageTeams, currentUser),
		[activeTab, canManageTeams, currentUser]
	);

	return (
		<DataTable
			columns={columns}
			data={data}
			sorting={sorting}
			onSortingChange={setSorting}
			filters={filters}
			onFiltersChange={setFilters}
		/>
	);
}
