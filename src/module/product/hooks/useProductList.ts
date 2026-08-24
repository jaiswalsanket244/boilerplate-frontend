import { useRecentlyChangedRows } from "@/hooks/use-recently-changed-rows";
import { useProductAPI } from "@/module/product/hooks/useProducts";
import { type ProductFormInput } from "@/module/product/utils/form-utils";
import { useMemo, useState } from "react";
import debounce from "lodash/debounce";

interface UseProductOperationsProps {
	companyRef: string;
	searchValue: string;
}

export function useProductOperations({ companyRef, searchValue }: UseProductOperationsProps) {
	const { useDeleteProductMutation, useGetAllProductsQuery } = useProductAPI();
	const { mutateAsync: deleteProduct } = useDeleteProductMutation();

	const { addRow } = useRecentlyChangedRows();

	const [selectedProduct, setSelectedProduct] = useState<ProductFormInput | undefined>(undefined);
	const [dialogOpen, setDialogOpen] = useState<boolean>(false);
	const [page, setPage] = useState<number>(1);

	const {
		data: productsData,
		isSuccess,
		refetch: refetchProducts,
	} = useGetAllProductsQuery({ searchValue, companyRef, page });

	const handleDeleteProduct = async (id: string) => {
		await deleteProduct({ id, companyRef });
		addRow("deleted", id);

		await refetchProducts();
	};

	const handleOpenCreateDialog = () => {
		setSelectedProduct(undefined);
		setDialogOpen(true);
	};

	const handleOpenEditDialog = (product: ProductFormInput) => {
		setSelectedProduct(product);
		setDialogOpen(true);
	};

	const handleCloseDialog = (value: boolean) => {
		setDialogOpen(value);
		if (!value) {
			setSelectedProduct(undefined);
		}
	};

	return {
		products: productsData?.data,
		pagination: productsData?.pagination,
		productsData,
		isSuccess,
		refetchProducts,
		selectedProduct,
		dialogOpen,
		handleDeleteProduct,
		handleOpenCreateDialog,
		handleOpenEditDialog,
		handleCloseDialog,
		setPage,
	};
}

export function useProductSearch() {
	const [value, setValue] = useState<string>("");
	const [searchValue, setSearchValue] = useState<string>("");

	const debouncedSetSearchValue = useMemo(
		() =>
			debounce((value: string) => {
				setSearchValue(value);
			}, 300),
		[]
	);

	const handleInputChange = (value: string) => {
		setValue(value);
		debouncedSetSearchValue(value);
	};

	return {
		value,
		debouncedValue: searchValue,
		handleInputChange,
	};
}
