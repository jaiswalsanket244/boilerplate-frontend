"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { IoMdArrowRoundBack } from "react-icons/io";

import { FormInputWrapper } from "@/components/common/form/form-input-wrapper";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { routes } from "@/config/routes";
import { useStatusMessage } from "@/hooks/use-status-message";
import { useStripePaymentApi } from "@/module/stripe-payment/hooks/useStripePaymentApi";
import { DISCOUNT_TYPE, DURATION, type ICoupon, type TCreateCouponInput } from "@/module/stripe-payment/types";
import { couponFormFieldsConfig } from "@/module/stripe-payment/utils/form-configs";
import { couponSchema } from "@/module/stripe-payment/utils/form-schema";
import { getCouponDefaultValues } from "@/module/stripe-payment/utils/helpers";
import { MESSAGE_STATUS } from "@/types";

export default function CreateCoupon({ isEditMode = false, coupon }: { isEditMode?: boolean; coupon?: ICoupon }) {
	const router = useRouter();
	const queryClient = useQueryClient();

	const { useCreateCouponMutation, useEditCouponMutation } = useStripePaymentApi();
	const { statusMessage, setStatusMessage } = useStatusMessage();

	const [discountType, setDiscountType] = useState<DISCOUNT_TYPE.AMOUNT | DISCOUNT_TYPE.PERCENT | "">(
		coupon?.amount_off ? DISCOUNT_TYPE.AMOUNT : coupon?.percent_off ? DISCOUNT_TYPE.PERCENT : ""
	);
	const [discountTypeError, setDiscountTypeError] = useState("");

	const form = useForm<TCreateCouponInput>({
		defaultValues: getCouponDefaultValues(coupon),
		resolver: zodResolver(couponSchema),
	});
	const { register, handleSubmit, watch, setError, unregister, reset, getValues } = form;

	const duration = watch("duration");

	const createCoupon = useCreateCouponMutation();
	const editCoupon = useEditCouponMutation();

	const showTempMessage = (type: MESSAGE_STATUS, message: string) => {
		setStatusMessage({ type, message });
		setTimeout(() => setStatusMessage({ type: null, message: "" }), 3000);
	};

	const handleDiscountTypeChange = (value: DISCOUNT_TYPE.AMOUNT | DISCOUNT_TYPE.PERCENT | "") => {
		setDiscountType(value);
		setDiscountTypeError("");
	};

	const handleCreate: SubmitHandler<TCreateCouponInput> = (data) => {
		createCoupon.mutate(data, {
			onSuccess: () => {
				showTempMessage(MESSAGE_STATUS.SUCCESS, "Coupon created successfully.");
				reset();
				setDiscountType("");
			},
			onError: (error) =>
				showTempMessage(
					MESSAGE_STATUS.ERROR,
					error?.response?.data?.message ?? "Failed to create coupon. Please try again."
				),
		});
	};

	const handleEdit = (data: TCreateCouponInput) => {
		if (!data.name) {
			setError("name", { message: "Coupon name is required." });
			return;
		}

		if (data.name === coupon?.name) return;

		editCoupon.mutate(
			{ id: coupon?.id ?? "", payload: { name: data.name } },
			{
				onSuccess: () => {
					void queryClient.invalidateQueries({
						predicate: (query) => query.queryKey.includes("stripe-payment-coupons"),
					});
					showTempMessage(MESSAGE_STATUS.SUCCESS, "Coupon updated successfully.");
				},
				onError: (error) =>
					showTempMessage(
						MESSAGE_STATUS.ERROR,
						error?.response?.data?.message ?? "Failed to update coupon. Please try again."
					),
			}
		);
	};

	const onSubmit: SubmitHandler<TCreateCouponInput> = (data) => {
		if (!discountType) {
			setDiscountTypeError("Please select a discount type.");
			return;
		}

		if (duration === DURATION.REPEATING && !data.duration_in_months) {
			setError("duration_in_months", { message: "Duration in months is required." });
			return;
		}

		if (discountType === DISCOUNT_TYPE.AMOUNT && !data.amount_off) {
			setError("amount_off", { message: "Amount Off is required." });
			return;
		}

		if (discountType === DISCOUNT_TYPE.PERCENT && !data.percent_off) {
			setError("percent_off", { message: "Percent Off is required." });
			return;
		}

		isEditMode ? handleEdit(data) : handleCreate(data);
	};

	useEffect(() => {
		// Clean up irrelevant fields based on discount type
		if (discountType === DISCOUNT_TYPE.PERCENT) {
			unregister("amount_off");
			unregister("currency");
		} else if (discountType === DISCOUNT_TYPE.AMOUNT) {
			unregister("percent_off");
		}
	}, [discountType, unregister]);

	useEffect(() => {
		if (duration === DURATION.REPEATING) register("duration_in_months");
		else unregister("duration_in_months");
	}, [duration, register, unregister]);

	// -----------------------------------
	// 🧱 UI Sections
	// -----------------------------------

	const DiscountTypeField = () => (
		<div className="space-y-1">
			<Label htmlFor="discount_type" className="mt-3 mb-1 text-sm">
				Discount Type
			</Label>
			<Select
				disabled={isEditMode}
				value={discountType}
				onValueChange={(val) => handleDiscountTypeChange(val as DISCOUNT_TYPE)}
			>
				<SelectTrigger>
					<SelectValue placeholder="Select Discount Type" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value={DISCOUNT_TYPE.PERCENT}>Percentage</SelectItem>
					<SelectItem value={DISCOUNT_TYPE.AMOUNT}>Amount</SelectItem>
				</SelectContent>
			</Select>
			{discountTypeError && <p className="text-red">{discountTypeError}</p>}
		</div>
	);

	const DiscountDetails = () => {
		if (!discountType) return null;

		return (
			<div className="space-y-1 border-l-2 pl-10">
				{discountType === DISCOUNT_TYPE.PERCENT ? (
					<FormInputWrapper form={form} fieldConfig={couponFormFieldsConfig.percent_off} disabled={isEditMode} />
				) : (
					<>
						<FormInputWrapper form={form} fieldConfig={couponFormFieldsConfig.amount_off} disabled={isEditMode} />
						<FormInputWrapper form={form} fieldConfig={couponFormFieldsConfig.currency} disabled={isEditMode} />
					</>
				)}
			</div>
		);
	};

	const OptionalDetails = () => (
		<div className="bg-muted mt-auto w-[40%] rounded p-4">
			<h4 className="mb-3 text-center text-base">Optional Details</h4>
			<FieldGroup>
				<FormInputWrapper form={form} fieldConfig={couponFormFieldsConfig.max_redemptions} disabled={isEditMode} />
				<FormInputWrapper form={form} fieldConfig={couponFormFieldsConfig.redeem_by} disabled={isEditMode} />
			</FieldGroup>
		</div>
	);

	return (
		<div>
			<h1 className="mb-3 text-center text-2xl">
				{isEditMode ? "Edit Coupon" : "Create Coupon"}{" "}
				{isEditMode && <span className="text-txt-tertiary-800 text-sm font-normal">(Only name can be edited)</span>}
			</h1>

			<div className="m-auto flex w-[70%] justify-center gap-4">
				<form
					onSubmit={(event) => void handleSubmit(onSubmit)(event)}
					onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
					className="w-full"
				>
					<div className="flex w-full gap-4">
						<FieldGroup className="w-[60%] gap-4">
							<FormInputWrapper form={form} fieldConfig={couponFormFieldsConfig.name} />
							<FormInputWrapper form={form} fieldConfig={couponFormFieldsConfig.duration} disabled={isEditMode} />

							{duration === DURATION.REPEATING && (
								<FormInputWrapper
									form={form}
									fieldConfig={couponFormFieldsConfig.duration_in_months}
									wrapperClassName="border-l-2 pl-10"
									disabled={isEditMode}
								/>
							)}

							<DiscountTypeField />
							<DiscountDetails />
						</FieldGroup>

						<OptionalDetails />
					</div>

					<div className="mt-8 flex justify-end gap-2">
						<Button onClick={() => router.push(routes.stripePayment.coupons.list)} variant="outline">
							<IoMdArrowRoundBack /> Back
						</Button>

						{!isEditMode ? (
							<Button type="submit" disabled={createCoupon.isPending}>
								{createCoupon.isPending ? "Creating..." : "Create Coupon"}
							</Button>
						) : (
							<Button
								type="button"
								onClick={() => void handleEdit(getValues())}
								variant="outline"
								disabled={editCoupon.isPending}
							>
								{editCoupon.isPending ? "Editing..." : "Edit Coupon"}
							</Button>
						)}
					</div>

					{statusMessage.message && (
						<p
							className={`my-2 text-right text-base ${
								statusMessage.type === MESSAGE_STATUS.SUCCESS ? "text-success" : "text-error"
							}`}
						>
							{statusMessage.message}
						</p>
					)}
				</form>
			</div>
		</div>
	);
}
