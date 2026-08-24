import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { CompanyActions } from "@/module/company/components/company-actions";
import { CompanyStatusBadge } from "@/module/company/components/company-status-badge";
import type { ICompaniesTableProps } from "@/module/company/types";

export function CompaniesTable({
	companies,
	isLoading = false,
	currentUserEmail,
	onViewCompany,
	onToggleStatus,
	getRowAnimationClasses = () => "",
}: ICompaniesTableProps) {
	const hasCompanies = companies && companies.length > 0;

	return (
		<div className="relative overflow-x-auto" data-testid="companies-table-container">
			<Table data-testid="companies-table">
				<TableHeader>
					<TableRow>
						<TableCell>Company Name</TableCell>
						<TableCell>Company Status</TableCell>
						<TableCell>Action</TableCell>
					</TableRow>
				</TableHeader>
				<TableBody>
					{hasCompanies ? (
						companies.map((company) => {
							const showActions = Boolean(currentUserEmail && currentUserEmail !== company.name);

							return (
								<TableRow key={String(company._id)} className={getRowAnimationClasses(String(company._id))}>
									<TableCell>{company.name}</TableCell>
									<TableCell>
										<CompanyStatusBadge status={company.companyStatus} />
									</TableCell>
									<TableCell className="px-6 py-4">
										<CompanyActions
											company={company}
											onView={onViewCompany}
											onToggleStatus={onToggleStatus}
											showActions={showActions}
										/>
									</TableCell>
								</TableRow>
							);
						})
					) : (
						<TableRow>
							<TableCell colSpan={3}>
								<div className="text-center">
									<p className="mt-3">{isLoading ? "Loading..." : "No Data !!"}</p>
								</div>
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}
