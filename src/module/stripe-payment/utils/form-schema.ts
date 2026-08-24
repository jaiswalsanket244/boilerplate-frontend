import z from "zod";
import { DURATION } from "@/module/stripe-payment/types";

export const productFormSchema = z.object({
	title: z.string().min(1, { message: "This field is required" }),
	price: z
		.string()
		.min(1, { message: "This field is required" })
		.refine((value) => !isNaN(parseFloat(value)) && isFinite(Number(value)), {
			message: "Price must be a valid number",
		})
		.transform((value) => parseFloat(value)),
});

export const couponSchema = z.object({
	name: z.string().min(1, { message: "This field is required" }),
	duration: z.enum([DURATION.FOREVER, DURATION.ONCE, DURATION.REPEATING]),
	duration_in_months: z
		.string()
		.optional()
		.transform((val) => (val ? Number(val) : undefined)),
	amount_off: z
		.string()
		.optional()
		.transform((val) => (val ? Number(val) * 100 : undefined)), // multiply by 100 to convert to cents.
	currency: z.string().optional(),
	max_redemptions: z
		.string()
		.optional()
		.transform((val) => (val ? Number(val) : undefined)),
	percent_off: z
		.string()
		.optional()
		.transform((val) => (val ? Number(val) : undefined)),
	redeem_by: z
		.string()
		.optional()
		.transform((val) => (val ? Math.floor(new Date(val).getTime() / 1000) : undefined)), // Convert to Unix timestamp
});

export const promotionCodeSchema = z.object({
	code: z.string().min(1, { message: "This field is required" }),
	expires_at: z.date().transform((val) => (val ? Math.floor(new Date(val).getTime() / 1000) : undefined)), // Convert to Unix timestamp
	max_redemptions: z
		.string()
		.optional()
		.refine((val) => !val || (!isNaN(Number(val)) && isFinite(Number(val))), {
			message: "Max Redemptions must be a valid number",
		})
		.transform((val) => (val ? Number(val) : undefined)),
});
