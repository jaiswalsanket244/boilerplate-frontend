"use client";

import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import CouponsTable from "@/module/stripe-payment/components/coupons/coupons-table";
import { EmptyCoupons } from "@/module/stripe-payment/components/coupons/empty-coupons";
import { useStripeCoupons } from "@/module/stripe-payment/hooks/useCouponsList";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";

const CouponsList = () => {
	const router = useRouter();

	const { coupons, goNext, goPrev, disableNext, disablePrev, isPending } = useStripeCoupons();

	const redirectToCreateCouponPage = () => router.push(routes.stripePayment.coupons.create);

	if (isPending) return <div className="flex h-[80vh] items-center justify-center text-lg">Loading...</div>;

	return (
		<div className="w-full">
			<div className="mb-5 flex w-full justify-between">
				<h1 className="text-2xl">Coupons</h1>
				<Button onClick={redirectToCreateCouponPage}>
					<PlusIcon className="mr-1 h-4 w-4" />
					Add Coupon
				</Button>
			</div>

			{!coupons?.length && <EmptyCoupons />}
			{coupons?.length > 0 && (
				<>
					<CouponsTable data={coupons} />
					<div className="mt-8 flex justify-end gap-2">
						<Button onClick={() => goPrev()} disabled={disablePrev} variant={"ghost"} className="bg-muted">
							Previous
						</Button>
						<Button onClick={() => goNext()} disabled={disableNext} variant={"ghost"} className="bg-muted">
							Next
						</Button>
					</div>
				</>
			)}
		</div>
	);
};

export default CouponsList;
