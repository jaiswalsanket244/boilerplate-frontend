export type SetupIntentResponseType = {
	success: boolean;
	message: string;
	data: {
		client_secret: string;
	};
	errors: object;
};

export type BillingDetailsType = {
	address: {
		city: string | null;
		country: string | null;
		line1: string | null;
		line2: string | null;
		postal_code: string | null;
		state: string | null;
	};
	email: string | null;
	name: string;
	phone: string | null;
	tax_id: string | null;
};

export type CardDetailsType = {
	allow_redisplay: string;
	billing_details: BillingDetailsType;
	card: CardType;
	created: number;
	customer: string;
	id: string;
	livemode: boolean;
	metadata: object;
	type: string;
	object: string;
};

export type CardType = {
	brand: string;
	last4: string;
	exp_month: number;
	exp_year: number;
	checks: {
		address_line1_check: string | null;
		address_postal_code_check: string | null;
		cvc_check: string | null;
	};
	country: string;
	fingerprint: string;
	funding: string;
	generated_from: string | null;
	installments: string | null;
	networks: {
		available: string[];
		preferred: string | null;
	};
	three_d_secure_usage: {
		supported: boolean;
	};
	wallet: string | null;
	regulated_status: string | null;
};

export type GetCardsResponseType = {
	success: boolean;
	message: string;
	data: {
		cards: CardDetailsType[];
		defaultPaymentMethodId: string | null;
	};
	errors: object;
};
