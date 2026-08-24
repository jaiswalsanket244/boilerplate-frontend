import { type ProductFormInput } from "@/module/product/utils/form-utils";
import { ApiResponse } from "@/types/api-response";
import { PaginatedResponse } from "@/types/pagination";
import type { Dispatch, SetStateAction } from "react";

export interface IProduct {
	_id: string;
	title: string;
	description: string;
	price: number;
	costPrice: number;
	retailPrice: number;
	salePrice: number;
	companyRef: string;
}

// ------------------
// react-query types
// ------------------
export type GetAllProductResponseType = {
	success: boolean;
	message: string;
	data: [{ items: ProductResponseType[]; total: number; page: number; pageSize: number }];
	errors: object;
};

export interface IProductListResponse extends ApiResponse<PaginatedResponse<IProduct>> {}

export interface ICreateProductResponse {
	success: boolean;
	message: string;
	data: ProductResponseType;
	errors: object;
}

export type GetOneProductResponseType = {
	success: boolean;
	message: string;
	data: ProductResponseType;
	errors: object;
};
export type ProductResponseType = {
	_id: string;
	title: string;
	description: string;
	price: number;
	costPrice: number;
	retailPrice: number;
	salePrice: number;
	companyRef: string;
};

// ----------------
// component types
// ----------------
export type CreateEditProductType = {
	id?: string;
	product?: ProductFormInput;
};

export type TProductIds = { created: string[]; updated: string[]; deleted: string[] };

export interface ProductDialogProps {
	id?: string;
	open: boolean;
	onOpenChange: (value: boolean) => void;
	product?: ProductFormInput;
	setProductIds?: Dispatch<SetStateAction<TProductIds>>;
	refetchProducts: () => void;
}

export interface IDeleteProductAlertProps {
	onDeleteProduct: () => Promise<void>;
	productId: string;
}

export interface ProductTableRowProps {
	product: IProduct;
	rowClassName: string;
	onEdit: () => void;
	onDelete: () => Promise<void>;
}

export interface ProductsTableProps {
	products: IProduct[] | undefined;
	isSuccess: boolean;
	onEdit: (product: ProductFormInput) => void;
	onDelete: (id: string) => Promise<void>;
}

export interface FormFieldProps {
	label: string;
	error?: { message?: string };
	children: React.ReactNode;
	testId: string;
	required?: boolean;
}
