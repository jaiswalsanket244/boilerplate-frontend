"use client";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { routes } from "@/config/routes";
import { useRecentlyChangedRows } from "@/hooks/use-recently-changed-rows";
import DeleteCouponsAlert from "@/module/stripe-payment/components/coupons/delete-coupon-alert";
import { useStripePaymentApi } from "@/module/stripe-payment/hooks/useStripePaymentApi";
import type { ICoupon } from "@/module/stripe-payment/types";
import { useQueryClient } from "@tanstack/react-query";
import type { Row } from "@tanstack/react-table";
import { EllipsisVertical, Pencil, ScanBarcode, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CouponsActionsCell({ row }: { row: Row<ICoupon> }) {
	const queryClient = useQueryClient();
	const router = useRouter();

	const { useDeleteCouponMutation } = useStripePaymentApi();

	const deleteCouponMutation = useDeleteCouponMutation();

	const { addRow } = useRecentlyChangedRows();

	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const coupon = row.original;

	const handleEdit = () => {
		setIsMenuOpen(false);
		router.push(routes.stripePayment.coupons.edit(coupon.id));
	};

	const handleDelete = async () => {
		try {
			await deleteCouponMutation.mutateAsync(coupon.id);

			addRow("deleted", row.id);
			setTimeout(() => {
				void queryClient.invalidateQueries({
					predicate: (query) => query.queryKey.includes("stripe-payment-coupons"),
				});
			}, 1500);
		} catch (error) {
			addRow("errors", row.id);
		}
	};

	return (
		<>
			<DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
				<DropdownMenuTrigger asChild>
					<div className="flex w-full justify-center gap-2">
						<Button variant="ghost" className="h-8 w-8 p-0">
							<span className="sr-only">Open menu</span>
							<EllipsisVertical className="h-4 w-4" />
						</Button>
					</div>
				</DropdownMenuTrigger>

				<DropdownMenuContent align="end" className="text-sm">
					<DropdownMenuItem
						onClick={() => router.push(routes.stripePayment.coupons.promotionCodes(coupon.id))}
						className="cursor-pointer"
					>
						<ScanBarcode className="mr-2 h-4 w-4" />
						Promotion Codes
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => handleEdit()} className="cursor-pointer">
						<Pencil className="mr-2 h-4 w-4" />
						Edit Coupon
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => {
							setIsDeleteDialogOpen(true);
							setIsMenuOpen(false);
						}}
						className="cursor-pointer text-red-600"
					>
						<Trash2 className="mr-2 h-4 w-4" />
						Delete Coupon
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<DeleteCouponsAlert
				onConfirm={() => void handleDelete()}
				open={isDeleteDialogOpen}
				setOpen={setIsDeleteDialogOpen}
			/>
		</>
	);
}
