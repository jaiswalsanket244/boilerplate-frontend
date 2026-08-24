import type { FormFieldConfig } from "@/components/common/form/types";
import type { CreateProductType } from "@/module/stripe-connect/types";

const titleFieldConfig: FormFieldConfig<CreateProductType> = {
	name: "title",
	label: "Product Title",
	fieldVariant: "input",
	placeholder: "eg: T-shirt",
	inputProps: {
		type: "text",
	},
};
const priceFieldConfig: FormFieldConfig<CreateProductType> = {
	name: "price",
	label: "Price",
	fieldVariant: "input",
	placeholder: "eg: 100",
};

export const productFormFieldsConfig = {
	title: titleFieldConfig,
	price: priceFieldConfig,
};
