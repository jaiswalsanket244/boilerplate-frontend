"use client";

import { FormInputWrapper } from "@/components/common/form/form-input-wrapper";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { FieldGroup } from "@/components/ui/field";
import { useStripePaymentApi } from "@/module/stripe-payment/hooks/useStripePaymentApi";
import type { TPromotionCodeInput } from "@/module/stripe-payment/types";
import { promotionCodeFormFieldsConfig } from "@/module/stripe-payment/utils/form-configs";
import { promotionCodeSchema } from "@/module/stripe-payment/utils/form-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";

const CreatePromotionCodeDialog = ({ couponId }: { couponId: string }) => {
	const queryClient = useQueryClient();
	const { useCreatePromotionCodeMutation } = useStripePaymentApi();

	const createPromotionCodeMutation = useCreatePromotionCodeMutation();
	const [isOpen, setIsOpen] = useState(false);

	const form = useForm<TPromotionCodeInput>({
		defaultValues: {
			code: "",
		},
		resolver: zodResolver(promotionCodeSchema),
	});

	const onSubmit = (data: TPromotionCodeInput) => {
		createPromotionCodeMutation.mutate(
			{
				code: data.code,
				expires_at: data.expires_at,
				coupon: couponId,
				max_redemptions: data.max_redemptions,
			},
			{
				onSuccess: () => {
					void queryClient.invalidateQueries({
						predicate: (query) => query.queryKey.includes("stripe-payment-promotion-codes"),
					});
					form.reset();
					setIsOpen(false);
				},
			}
		);
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button>Create Promotion Code</Button>
			</DialogTrigger>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create Promotion Code</DialogTitle>
				</DialogHeader>
				<form onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}>
					<FieldGroup className="gap-4">
						<FormInputWrapper form={form} fieldConfig={promotionCodeFormFieldsConfig.code} />
						<FormInputWrapper form={form} fieldConfig={promotionCodeFormFieldsConfig.expires_at} />
						<FormInputWrapper form={form} fieldConfig={promotionCodeFormFieldsConfig.max_redemptions} />
					</FieldGroup>

					<Button type="submit" className="mt-5 w-full ">
						{createPromotionCodeMutation.isPending ? "Creating..." : "Create Promotion Code"}
					</Button>

					{createPromotionCodeMutation.error?.response?.data.message && (
						<p className="mt-2 text-red-500">{createPromotionCodeMutation.error.response.data.message}</p>
					)}
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default CreatePromotionCodeDialog;
