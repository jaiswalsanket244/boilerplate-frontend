import { type SortConfigType } from "@/types";

export interface CardData {
	id?: string;
	title: string;
	value: string;
	description: string;
}

export interface BillingHistory {
	id: string;
	planId: string;
	status: string;
	currentPeriodEnds: number;
	currentPeriodStarts: number;
	planName: string;
	price: number;
}

export type Columns = {
	data: BillingHistory[];
	sortConfig?: SortConfigType;
	handleSelectAll: () => void;
	checkedItems: string[];
	onHeaderCellClick: (value: string) => void;
	onChecked?: (id: string) => void;
};

export interface SubscriptionType {
	_id: string;
	planId: string;
	planName: string;
	status: string;
	currentPeriodEnds: number;
	currentPeriodStarts: number;
	price: number;
	stripeSubscriptionId: string;
	subscriptionCancellationRequested: boolean;
	period?: string;
	billingCycle?: string;
	features?: {
		name: string;
	}[];
	description?: string;
	subscriptionPlanRef: {
		currency?: string;
		description?: string;
		price?: number;
		priceId?: string;
		type?: string;
		title?: string;
	};
}

export interface SubscriptionPlanType {
	name: string;
	description: string;
	image?: string;
	productId?: string;
	id: string;
	plans: {
		id: string;
		product: string;
		amount: number;
		currency: string;
		interval: string;
		nickname: string;
	}[];
	marketing_features: {
		name: string;
	}[];
}
[];

export interface SubscribeApiResponse {
	success?: boolean;
	message?: string;
	data: {
		stripeCustomerId: string;
		subscriptionId: string;
		clientSecret: string;
	};
}

export type CancelSubscriptionAlertProps = {
	onCancelSubscription: () => void;
};

export interface HasActivePlanResult {
	activePlan: SubscriptionType | null;
	activePlanStatus: boolean;
}

export interface BillingHistory {
	serialNumber: number;
	planName: string;
	billedOn: string;
	amount: number;
	invoice: string;
}

export interface PaymentModalProps {
	isOpen: boolean;
	onClose: () => void;
	planName: string;
	planPrice: string;
	onSuccess?: () => void;
}

export interface PlanDetailsType {
	newPriceId: string;
}

export const PLAN_NAME = {
	FREE: "free",
	PRO: "pro",
	PREMIUM: "Premium",
} as const;

export type PlanName = (typeof PLAN_NAME)[keyof typeof PLAN_NAME];
