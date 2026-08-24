import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import type { IProduct } from "@/module/stripe-payment/types";
import type { Row } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { IoBagHandleOutline } from "react-icons/io5";

const BuyProductCell = ({ row }: { row: Row<IProduct> }) => {
	const router = useRouter();

	const handleBuy = (product: IProduct) => {
		router.push(routes.stripePayment.checkout(product._id));
	};
	return (
		<div className="flex w-full items-center justify-center">
			<Button
				variant="outline"
				className="text-txt-primary-600 size-10 border-none p-0 shadow-none [&_svg]:size-5"
				onClick={() => void handleBuy(row.original)}
			>
				<IoBagHandleOutline className="size-5" />
			</Button>
		</div>
	);
};

export default BuyProductCell;
