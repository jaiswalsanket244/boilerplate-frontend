const superAdminRoutes = {
	dashboard: "/super-admin/dashboard",
	companies: {
		list: "/super-admin/companies",
		invite: "/super-admin/invite-companies",
		impersonate: (id: string) => `/client/dashboard?companyRef=${id}`,
	},
	stripeTransactions: "/super-admin/stripe-transactions",
	stripeConnect: {
		vendors: "/super-admin/stripe-connect/vendors",
	},
	auditLogs: {
		list: "/super-admin/audit-logs",
		archive: "/super-admin/audit-logs/archive",
	},
	system: {
		errorLogs: {
			generic: "/super-admin/error-logs/generic",
			email: "/super-admin/error-logs/email",
		},
	},
	settings: "/settings",
};

export const routes = {
	auth: {
		signUp: "/signup",
		signIn: "/signin",
		setPassword: "/set-password",
		forgotPassword: "/forgot-password",
		otpLogin: "/otp-login",
		requestLoginOtp: "/request-login-otp",
		requestLoginMagicLink: "/request-login-magic-link",
		verifySignUpOtp: "/verify-signup-otp",
		verifyLoginOtp: "/verify-login-otp",
		mfaSetup: "/mfa/setup",
		mfaSetupVerify: "/mfa/setup/verify",
		mfaRecovery: "/mfa/recovery",
		mfaRecoveryCodes: "/mfa/recovery-codes",
		mfaVerify: "/mfa/verify",
		mfaIdentityVerify: "/mfa/identity/verify",
	},

	dashboard: "/client/dashboard",
	products: {
		list: "/client/products",
		create: "/client/products/create",
		edit: (id: string) => `/client/products/${id}/edit`,
		details: (id: string) => `/client/products/${id}`,
	},
	subscriptions: "/client/subscriptions",
	teams: "/client/teams",
	roles: {
		list: "/client/teams/roles",
	},
	users: {
		details: (id: string) => `/client/user-details/${id}`,
	},
	stripeConnect: {
		main: "/client/stripe-connect",
		accountSession: (id: string) => `/client/stripe-connect/${id}`,
		productList: "/client/stripe-connect/product-list",
		myOrders: "/client/stripe-connect/my-orders",
		transactions: "/client/stripe-connect/vendor-transactions",
		payment: (id: string) => `/client/stripe-connect/product-list/${id}`,
	},
	stripePayment: {
		main: "/client/stripe-payment",
		productList: "/client/stripe-payment/product-list",
		checkout: (id: string) => `/client/stripe-payment/product-list/${id}`,
		transactions: "/client/stripe-payment/transactions",
		orders: "/client/stripe-payment/my-orders",
		paymentStatus: (id: string) => `/client/stripe-payment/payment-status?session_id=${id}`,
		coupons: {
			list: "/client/stripe-payment/coupons",
			create: "/client/stripe-payment/coupons/create",
			edit: (id: string) => `/client/stripe-payment/coupons/${id}`,
			promotionCodes: (id: string) => `/client/stripe-payment/coupons/${id}/promotion-codes`,
		},
	},
	cards: {
		list: "/client/cards",
		add: "/client/cards/create",
	},
	chat: "/client/chat",
	queries: "/client/queries",
	auditLogs: {
		list: "/client/audit-logs",
	},

	superAdmin: superAdminRoutes,
	system: {
		signIn: "/system/signin",
		errorLogs: {
			generic: "/system/error-logs/generic", // error-logs:write
			email: "/system/error-logs/email",
		},
		jobs: "/system/jobs",
	},
	settings: {
		profile: "/settings/profile",
		company: "/settings/company",
		changePassword: "/settings/password",
		faqs: "/settings/faqs",
		contactUs: "/settings/contact-us",
		notifications: "/settings/notifications",
		previousQueries: "/settings/contact-us/queries",
	},
};
