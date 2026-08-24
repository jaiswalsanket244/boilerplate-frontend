import { z } from "zod";

export function defaultValues(product?: ProductFormInput) {
	return {
		title: product?.title ?? "",
		description: product?.description ?? "",
		price: product?.price ?? undefined,
		costPrice: product?.costPrice ?? undefined,
		retailPrice: product?.retailPrice ?? undefined,
		salePrice: product?.salePrice ?? undefined,
	};
}
// Required price schema - must be a valid positive number
const requiredPriceSchema = z.preprocess(
	(value) => {
		if (value === "" || value === null || value === undefined) return undefined;
		const numberValue = typeof value === "string" ? Number(value) : value;
		return Number.isNaN(numberValue) ? undefined : numberValue;
	},
	z
		.number({
			invalid_type_error: "Price must be a number",
			required_error: "Price is required",
		})
		.max(1000000, { message: "Price must be at most 1 million" })
		.positive({ message: "Price must be greater than 0" })
);

// Optional price schema - can be empty/null
const optionalPriceSchema = z.preprocess(
	(value) => {
		if (value === "" || value === null || value === undefined) return undefined;
		const numberValue = typeof value === "string" ? Number(value) : value;
		return Number.isNaN(numberValue) ? undefined : numberValue;
	},
	z
		.number({
			invalid_type_error: "Price must be a number",
		})
		.positive({ message: "Price must be greater than 0" })
		.nullable()
		.optional()
);

const titleRegex = /^[a-zA-Z0-9\s,.\-]+$/;

export const productFormSchema = z
	.object({
		_id: z.string().optional(),
		title: z
			.string()
			.min(1, { message: "This field is required" })
			.max(100, { message: "Title must be at most 100 characters" })
			.refine((value) => titleRegex.test(value.trim()), {
				message: "Title can contain only letters, numbers, spaces, commas, and dots",
			})
			.refine((value) => /[a-zA-Z]/.test(value), {
				message: "Title must contain at least one letter",
			}),

		description: z
			.string()
			.min(1, { message: "This field is required" })
			.max(500, { message: "Description must be at most 500 characters" })
			.refine((value) => value.trim().length > 0, {
				message: "Description cannot be empty",
			}),
		productImages: z.array(z.string().optional()).optional(),
		// Required price - cannot be empty or null
		price: requiredPriceSchema,
		// Optional prices - can be empty or null
		costPrice: optionalPriceSchema,
		retailPrice: optionalPriceSchema,
		salePrice: optionalPriceSchema,
		companyRef: z.string().optional().nullable(),
	})
	.superRefine((data, ctx) => {
		const { costPrice, salePrice, retailPrice } = data;

		const isNumber = (v: unknown): v is number => typeof v === "number" && !Number.isNaN(v);

		if (isNumber(costPrice) && isNumber(retailPrice)) {
			if (costPrice > retailPrice) {
				ctx.addIssue({
					path: ["costPrice"],
					code: z.ZodIssueCode.custom,
					message: "Cost price cannot be greater than retail price",
				});
			}
		}

		if (isNumber(costPrice) && isNumber(salePrice)) {
			if (costPrice > salePrice) {
				ctx.addIssue({
					path: ["salePrice"],
					code: z.ZodIssueCode.custom,
					message: "Sale price cannot be less than cost price",
				});
			}
		}

		if (isNumber(salePrice) && isNumber(retailPrice)) {
			if (salePrice > retailPrice) {
				ctx.addIssue({
					path: ["salePrice"],
					code: z.ZodIssueCode.custom,
					message: "Sale price cannot be greater than retail price",
				});
			}
		}
	});
export type ProductFormInput = z.infer<typeof productFormSchema>;
