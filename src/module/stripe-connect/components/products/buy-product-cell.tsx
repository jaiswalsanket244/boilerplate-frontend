import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { useRecentlyChangedRows } from "@/hooks/use-recently-changed-rows";
import { useStripeConnectAPI } from "@/module/stripe-connect/hooks/useStripeConnect";
import type { ProductInfo } from "@/module/stripe-connect/types";
import { useQueryClient } from "@tanstack/react-query";
import type { Row } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { IoBagHandleOutline } from "react-icons/io5";

const BuyProductCell = ({ row }: { row: Row<ProductInfo> }) => {
	const queryClient = useQueryClient();
	const router = useRouter();

	const { usePostPaymentIntentMutation } = useStripeConnectAPI();

	const { mutateAsync } = usePostPaymentIntentMutation;
	const { addRow } = useRecentlyChangedRows();

	const getClientSecret = async (productId: string) => {
		const { clientSecret } = await mutateAsync(productId);
		return clientSecret;
	};

	const handleBuy = async (product: ProductInfo) => {
		try {
			const clientSecret = await getClientSecret(product._id);
			// client-secret is stored in reach-query's cache.
			queryClient.setQueryData(["stripeConnectClientSecret"], clientSecret);
			router.push(routes.stripeConnect.payment(product._id));
			addRow("created", row.id);
		} catch (error) {
			addRow("errors", row.id);
		}
	};
	return (
		<div className="flex w-full items-center justify-center">
			<Button
				variant="outline"
				className="size-10 border-none p-0 text-gray-600 shadow-none [&_svg]:size-5"
				onClick={() => void handleBuy(row.original)}
			>
				<IoBagHandleOutline className="size-5" />
			</Button>
		</div>
	);
};

export default BuyProductCell;
