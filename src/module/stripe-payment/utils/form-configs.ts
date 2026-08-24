import type { FormFieldConfig } from "@/components/common/form/types";
import {
	CURRENCY,
	DURATION,
	type TCreateProductInput,
	type TCreateCouponInput,
	type TPromotionCodeInput,
} from "@/module/stripe-payment/types";

const titleFieldConfig: FormFieldConfig<TCreateProductInput> = {
	name: "title",
	label: "Product Title",
	fieldVariant: "input",
	placeholder: "eg: T-shirt",
	inputProps: {
		type: "text",
	},
};
const priceFieldConfig: FormFieldConfig<TCreateProductInput> = {
	name: "price",
	label: "Price",
	fieldVariant: "input",
	placeholder: "eg: 100",
};

export const productFormFieldsConfig = {
	title: titleFieldConfig,
	price: priceFieldConfig,
};

export const couponFormFieldsConfig: Record<keyof TCreateCouponInput, FormFieldConfig<TCreateCouponInput>> = {
	name: {
		name: "name",
		label: "Coupon Name",
		fieldVariant: "input",
		placeholder: "eg: Summer Sale",
		inputProps: {
			type: "text",
		},
	},
	duration: {
		name: "duration",
		label: "Duration",
		fieldVariant: "select",
		placeholder: "Select Duration",
		options: [
			{ value: DURATION.FOREVER, label: "Forever" },
			{ value: DURATION.ONCE, label: "Once" },
			{ value: DURATION.REPEATING, label: "Repeating" },
		],
	},
	duration_in_months: {
		name: "duration_in_months",
		label: "Duration in months",
		fieldVariant: "input",
		placeholder: "eg: 3",
	},
	percent_off: {
		name: "percent_off",
		label: "Percentage Off",
		fieldVariant: "input",
		placeholder: "eg: 20%",
	},
	amount_off: {
		name: "amount_off",
		label: "Amount Off",
		fieldVariant: "input",
		placeholder: "eg: 10",
	},
	max_redemptions: {
		name: "max_redemptions",
		label: "Max Redemptions",
		fieldVariant: "input",
		placeholder: "eg: 10",
	},
	currency: {
		name: "currency",
		label: "Currency",
		fieldVariant: "select",
		placeholder: "Select Currency",
		options: [
			{
				label: "USD",
				value: CURRENCY.USD,
			},
		],
	},
	redeem_by: {
		name: "redeem_by",
		label: "Redeem By",
		fieldVariant: "input",
		placeholder: "eg: 10",
	},
};

export const promotionCodeFormFieldsConfig: Record<keyof TPromotionCodeInput, FormFieldConfig<TPromotionCodeInput>> = {
	code: {
		name: "code",
		label: "Promotion Code",
		fieldVariant: "input",
		placeholder: "eg: ABC123",
		inputProps: {
			type: "text",
		},
	},
	expires_at: {
		name: "expires_at",
		label: "Expires At",
		fieldVariant: "date",
		placeholder: "eg: 2023-01-01",
	},
	max_redemptions: {
		name: "max_redemptions",
		label: "Max Redemptions",
		fieldVariant: "input",
		placeholder: "eg: 10",
	},
};
