"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRecentlyChangedRows } from "@/hooks/use-recently-changed-rows";
import { getUserCookies } from "@/lib/utils/cookies";
import { useProductAPI } from "@/module/product/hooks/useProducts";
import { type FormFieldProps, type ProductDialogProps } from "@/module/product/types";
import { type ProductFormInput, defaultValues, productFormSchema } from "@/module/product/utils/form-utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { FaInfoCircle } from "react-icons/fa";

function FormFieldWithError({ label, error, children, testId, required }: FormFieldProps) {
	return (
		<div className="relative" data-testid={testId}>
			<Label className="mt-3 mb-1 text-sm font-bold">
				{label} {required && <span className="text-red-500">*</span>}
			</Label>
			{children}
			{error && (
				<div data-testid={`${testId}-error-icon`} className="mt-2 flex items-center gap-1 text-sm text-red-500">
					<FaInfoCircle />
					{error.message}
				</div>
			)}
		</div>
	);
}

export default function ProductDialog({ id, product, open, onOpenChange, refetchProducts }: ProductDialogProps) {
	const { useCreateProductMutation, useUpdateProductMutation } = useProductAPI();
	const { companyRef } = getUserCookies();

	const { mutateAsync: createProduct, isPending: isCreatingProduct } = useCreateProductMutation();
	const { mutateAsync: updateProduct, isPending: isUpdatingProduct } = useUpdateProductMutation();

	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const { addRow } = useRecentlyChangedRows();

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
		setValue,
	} = useForm<ProductFormInput>({
		defaultValues: defaultValues(product),
		mode: "onChange",
		resolver: zodResolver(productFormSchema),
	});

	useEffect(() => {
		if (product) {
			setValue("title", product.title);
			setValue("description", product.description);
			setValue("price", product.price);
			setValue("costPrice", product.costPrice);
			setValue("retailPrice", product.retailPrice);
			setValue("salePrice", product.salePrice);
		}
	}, [product, setValue]);

	const handleCreate = async (data: ProductFormInput) => {
		try {
			const res = await createProduct({ ...data, companyRef });

			addRow("created", res._id);
			refetchProducts();

			handleClose();
		} catch (error) {
			setErrorMessage("Product creation failed!");
		}
	};

	const handleUpdate = async (productId: string, data: ProductFormInput) => {
		try {
			if (!data.salePrice) data.salePrice = null;
			if (!data.costPrice) data.costPrice = null;
			if (!data.retailPrice) data.retailPrice = null;

			await updateProduct({ id: productId, data: { ...data, companyRef } });

			addRow("updated", productId);
			refetchProducts();

			handleClose();
		} catch (error) {
			setErrorMessage("Product update failed!");
		}
	};

	const onSubmit: SubmitHandler<ProductFormInput> = (data) => {
		if (id) {
			void handleUpdate(id, data);
			return;
		}
		void handleCreate(data);
	};

	const handleClose = () => {
		reset();
		setErrorMessage(null);
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]" data-testid="product-dialog">
				<DialogHeader>
					<DialogTitle data-testid="dialog-title">{id ? "Edit Product" : "Create Product"}</DialogTitle>
					<DialogDescription data-testid="dialog-description">
						{id ? "Update the product details below." : "Fill in the details to create a new product."}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={(event) => void handleSubmit(onSubmit)(event)} className="space-y-4" data-testid="product-form">
					<FormFieldWithError label="Title" error={errors.title} testId="title-field" required>
						<Input
							type="text"
							{...register("title")}
							className={errors.title ? "border-red" : ""}
							data-testid="title-input"
						/>
					</FormFieldWithError>

					<FormFieldWithError label="Description" error={errors.description} testId="description-field" required>
						<Textarea
							{...register("description")}
							className={errors.description ? "border-red" : ""}
							data-testid="description-input"
						/>
					</FormFieldWithError>

					<FormFieldWithError label="Price" error={errors.price} testId="price-field" required>
						<Input
							type="number"
							step="0.01"
							{...register("price")}
							className={errors.price ? "border-red" : ""}
							data-testid="price-input"
						/>
					</FormFieldWithError>

					<FormFieldWithError label="Cost Price" error={errors.costPrice} testId="cost-price-field" required>
						<Input
							type="number"
							step="0.01"
							{...register("costPrice")}
							className={errors.costPrice ? "border-red" : ""}
							data-testid="cost-price-input"
						/>
					</FormFieldWithError>

					<FormFieldWithError label="Retail Price" error={errors.retailPrice} testId="retail-price-field">
						<Input
							type="number"
							step="0.01"
							{...register("retailPrice")}
							className={errors.retailPrice ? "border-red" : ""}
							data-testid="retail-price-input"
						/>
					</FormFieldWithError>

					<FormFieldWithError label="Sale Price" error={errors.salePrice} testId="sale-price-field">
						<Input
							type="number"
							step="0.01"
							{...register("salePrice")}
							className={errors.salePrice ? "border-red" : ""}
							data-testid="sale-price-input"
						/>
					</FormFieldWithError>

					<div className="space-y-1">
						{errorMessage && (
							<div className="rounded-md text-right text-sm text-red-600" data-testid="error-message">
								{errorMessage}
							</div>
						)}
						<div className="flex justify-end gap-2 pt-4">
							<Button onClick={handleClose} variant="outline" type="button" data-testid="cancel-button">
								Cancel
							</Button>
							<Button type="submit" disabled={isCreatingProduct || isUpdatingProduct} data-testid="submit-button">
								{isCreatingProduct || isUpdatingProduct ? "Submitting..." : "Submit"}
							</Button>
						</div>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
