import { routes } from "@/config/routes";
import { setCookies } from "@/lib/utils/cookies";
import { useCompanyAPI } from "@/module/company/hooks/useCompany";
import type { CompanyType } from "@/module/company/types";
import { useMenuStore } from "@/stores/menu-store";
import { COOKIES, ROLES, STATUS } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface UseCompanyOperationsProps {
	onSuccess?: (action: "updated" | "errors", companyRef: string) => void;
}

export function useCompanyOperations({ onSuccess }: UseCompanyOperationsProps = {}) {
	const queryClient = useQueryClient();
	const router = useRouter();

	const [companyStatus, setCompanyStatus] = useState<string | null | undefined>(null);
	const [companyId, setCompanyId] = useState<string | null | undefined>(null);
	const { useUpdateCompanyData } = useCompanyAPI();

	const openStatusDialog = (company: CompanyType) => {
		setCompanyId(company._id);
		setCompanyStatus(company.companyStatus);
	};

	const closeStatusDialog = () => {
		setCompanyId(null);
		setCompanyStatus(null);
	};

	const redirectToAdminPage = (companyRef: string) => {
		setCookies({
			[COOKIES.IS_ADMIN_PATH]: "true",
			[COOKIES.COMPANY_REF]: companyRef,
		});
		useMenuStore.getState().setMenuForUser({ roles: ROLES.SUPER_ADMIN }, false);
		router.push(`${routes.dashboard}?companyRef=${companyRef}`);
	};

	const updateCompanyStatus = (companyRef: string) => {
		const newStatus = companyStatus === STATUS.ACTIVE ? STATUS.INACTIVE : STATUS.ACTIVE;

		useUpdateCompanyData.mutate(
			{ id: companyRef, data: { companyStatus: newStatus } },
			{
				onSuccess: () => {
					void queryClient.invalidateQueries({
						predicate: (query) => query.queryKey.includes("companies"),
					});
					onSuccess?.("updated", companyRef);
				},
				onError: () => {
					onSuccess?.("errors", companyRef);
				},
			}
		);
	};

	const handleStatusChange = () => {
		if (companyId) {
			updateCompanyStatus(companyId);
			closeStatusDialog();
		}
	};

	return {
		companyId,
		companyStatus,
		openStatusDialog,
		closeStatusDialog,
		redirectToAdminPage,
		handleStatusChange,
	};
}
