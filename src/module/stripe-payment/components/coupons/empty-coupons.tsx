import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { routes } from "@/config/routes";
import Image from "next/image";

export function EmptyCoupons() {
	const router = useRouter();

	return (
		<Empty className="">
			<EmptyHeader>
				<EmptyMedia>
					<Image src={"/assets/png/no-coupons.png"} alt="no coupons" width={200} height={200} />
				</EmptyMedia>
				<EmptyTitle>No Coupons to show</EmptyTitle>
				<EmptyDescription>Create a Coupon</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				<Button onClick={() => router.push(routes.stripePayment.coupons.create)}>
					<PlusIcon /> Create new coupon
				</Button>
			</EmptyContent>
		</Empty>
	);
}
