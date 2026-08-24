export type CompanyResponseType = {
	items: CompanyType[];
	total: number;
	page: number;
	pageSize: number;
};

export interface PaginatedCompanySearchQuery {
	page?: number;
	pageSize?: number;
	searchValue?: string;
}

export type CompanyType = {
	_id: string;
	name?: string;
	companyStatus?: string;
	userRef?: string;
	supportEmail?: string;
	rotatePassword?: boolean;
	passwordValidityDays?: number;
	passwordGraceDays?: number;
};
export interface ICompany {
	_id: string;
	name?: string;
	companyStatus?: string;
	userRef?: string;
	supportEmail?: string;
	enablePasswordRotation?: boolean;
	passwordValidityDays?: number;
	gracePeriodDays?: number;
}

export type GetOneCompanyResponseData = {
	_id: string;
	name: string;
	companyStatus: string;
	userRef: {
		_id: string;
		name: {
			first: string;
			last: string;
		};
		fullName: string;
		email: string;
	};
};

export interface ICompanyStatusBadgeProps {
	status?: string;
	className?: string;
}

export interface ICompanyStatusDialogProps {
	isOpen: boolean;
	currentStatus: string | null | undefined;
	onClose: () => void;
	onConfirm: () => void;
}

export interface ICompaniesTableProps {
	companies: CompanyType[];
	isLoading?: boolean;
	currentUserEmail?: string;
	onViewCompany: (companyRef: string) => void;
	onToggleStatus: (company: CompanyType) => void;
	getRowAnimationClasses?: (id: string) => string;
}

export interface ICompanyActionsProps {
	company: CompanyType;
	onView: (companyRef: string) => void;
	onToggleStatus: (company: CompanyType) => void;
	showActions: boolean;
}

export interface ISearchBarProps {
	onSearch: (value: string) => void;
	placeholder?: string;
	debounceMs?: number;
}
