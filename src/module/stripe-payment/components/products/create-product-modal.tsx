"use client";

import { FormInputWrapper } from "@/components/common/form/form-input-wrapper";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useStatusMessage } from "@/hooks/use-status-message";
import { cn } from "@/lib/utils";
import { useStripePaymentApi } from "@/module/stripe-payment/hooks/useStripePaymentApi";
import type { TCreateProductInput, ProductModalProps } from "@/module/stripe-payment/types";
import { productFormFieldsConfig } from "@/module/stripe-payment/utils/form-configs";
import { productFormSchema } from "@/module/stripe-payment/utils/form-schema";
import { MESSAGE_STATUS } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

export default function ProductModal({ open, setOpen, product, mode = "create" }: ProductModalProps) {
	const queryClient = useQueryClient();
	const { useCreateProductMutation, useEditProductMutation } = useStripePaymentApi();

	const updateMutation = useEditProductMutation();
	const createMutation = useCreateProductMutation();

	const isEditMode = mode === "edit" || !!product;

	const { statusMessage, setStatusMessage } = useStatusMessage();

	const form = useForm<TCreateProductInput>({
		resolver: zodResolver(productFormSchema),
		defaultValues: { title: "", price: undefined },
	});

	useEffect(() => {
		if (product && isEditMode) {
			form.reset({ title: product.title, price: product.price });
		} else {
			form.reset({ title: "", price: undefined });
		}
	}, [product, isEditMode, form]);

	const handleEdit = async (data: TCreateProductInput) => {
		if (!product) return;
		try {
			await updateMutation.mutateAsync({ id: product._id, ...data });
			setStatusMessage({
				type: MESSAGE_STATUS.SUCCESS,
				message:
					"The product has been updated successfully!. This product will now be available for the users to view and purchase.",
			});
			setTimeout(() => {
				void queryClient.invalidateQueries({
					predicate: (query) => query.queryKey.includes("stripe-payment-products"),
				});
			}, 5000);
		} catch {
			setStatusMessage({ type: MESSAGE_STATUS.FAILED, message: "Failed to update product. Please try again." });
		}
	};

	const handleCreate = async (data: TCreateProductInput) => {
		try {
			await createMutation.mutateAsync(data);
			setStatusMessage({
				type: MESSAGE_STATUS.SUCCESS,
				message: "This product will now be available for the users to view and purchase.!",
			});
			await queryClient.invalidateQueries({
				predicate: (query) => query.queryKey.includes("stripe-payment-products"),
			});
		} catch {
			setStatusMessage({ type: MESSAGE_STATUS.FAILED, message: "Failed to create product. Please try again." });
		}
	};

	const handleSubmit = async (data: TCreateProductInput) => {
		setStatusMessage({ type: null, message: "" });

		if (isEditMode && product) {
			await handleEdit(data);
		} else {
			await handleCreate(data);
		}
	};

	const handleCancel = () => {
		setOpen(false);
		form.reset();
		setStatusMessage({ type: null, message: "" });
	};

	const handleRetry = () => setStatusMessage({ type: null, message: "" });

	const handleOpenChange = (newOpen: boolean) => {
		setOpen(newOpen);
		if (!newOpen) {
			form.reset();
			setStatusMessage({ type: null, message: "" });
		}
	};

	const isLoading = createMutation.isPending || updateMutation.isPending;

	const getDialogTitle = () => {
		switch (statusMessage.type) {
			case MESSAGE_STATUS.SUCCESS:
				return isEditMode ? "Product updated successfully" : "Product created successfully";
			case MESSAGE_STATUS.ERROR:
				return isEditMode ? "Failed to update product" : "Failed to create product";
			default:
				return isEditMode ? "Edit Product" : "Add Product";
		}
	};

	const getSubmitButtonText = () => {
		if (isEditMode && updateMutation.isPending) {
			return "Updating...";
		}
		if (isEditMode) {
			return "Update";
		}
		if (createMutation.isPending) {
			return "Creating...";
		}
		return "Create";
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="font-lato">
				<DialogHeader>
					<DialogTitle>{getDialogTitle()}</DialogTitle>
				</DialogHeader>
				{statusMessage.message && (
					<DialogDescription
						className={cn(
							"mt-2 text-base",
							statusMessage.type === MESSAGE_STATUS.SUCCESS ? "text-primary" : "",
							statusMessage.type === MESSAGE_STATUS.ERROR ? "text-error" : ""
						)}
					>
						{statusMessage.message}
					</DialogDescription>
				)}

				{statusMessage.type === null && (
					<form onSubmit={(e) => void form.handleSubmit(handleSubmit)(e)} className="space-y-4">
						<FormInputWrapper form={form} fieldConfig={productFormFieldsConfig.title} />
						<FormInputWrapper form={form} fieldConfig={productFormFieldsConfig.price} />

						<DialogFooter className="gap-2">
							<Button type="button" onClick={handleCancel} variant="outline" className="w-1/2" disabled={isLoading}>
								Cancel
							</Button>
							<Button type="submit" className="w-1/2" disabled={isLoading}>
								{getSubmitButtonText()}
							</Button>
						</DialogFooter>
					</form>
				)}

				{statusMessage.type === MESSAGE_STATUS.SUCCESS && (
					<div className="mt-4 flex w-full flex-col items-end justify-end gap-2 sm:flex-row">
						<Button type="button" onClick={handleCancel} className="order-1 w-full sm:order-2 sm:w-auto">
							Close
						</Button>
					</div>
				)}

				{statusMessage.type === MESSAGE_STATUS.ERROR && (
					<div className="mt-4 flex w-full flex-col items-end justify-end gap-2 sm:flex-row">
						<Button
							type="button"
							onClick={handleRetry}
							variant="outline"
							className="order-2 w-full sm:order-1 sm:w-auto"
						>
							Try Again
						</Button>
						<Button type="button" onClick={handleCancel} className="order-1 w-full sm:order-2 sm:w-auto">
							Close
						</Button>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
