import type { IProduct } from "@/module/product/types";

export let mockProducts: IProduct[] = [
	{
		_id: "1",
		companyRef: "comp1",
		title: "Product 1",
		description: "Description 1",
		price: 100,
		costPrice: 50,
		retailPrice: 120,
		salePrice: 90,
	},
	{
		_id: "2",
		companyRef: "comp1",
		title: "Product 2",
		description: "Description 2",
		price: 200,
		costPrice: 100,
		retailPrice: 220,
		salePrice: 180,
	},
	{
		_id: "3",
		title: "Product 3",
		description: "Description 3",
		companyRef: "comp1",
		price: 300,
		costPrice: 150,
		retailPrice: 320,
		salePrice: 270,
	},
];

export const setMockedProducts = (data: IProduct[]) => {
	mockProducts = data;
};
