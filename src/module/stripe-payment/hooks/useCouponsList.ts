import { useStripePaymentApi } from "@/module/stripe-payment/hooks/useStripePaymentApi";
import { useState } from "react";

export function useStripeCoupons(limit = 15) {
	const { useCouponListQuery } = useStripePaymentApi();

	const [pageStack, setPageStack] = useState<string[]>([]); // stack of cursors (IDs)
	const [cursor, setCursor] = useState<{ starting_after?: string; ending_before?: string }>({});
	const [pageIndex, setPageIndex] = useState(0);

	const { data, ...rest } = useCouponListQuery({
		limit,
		startingAfter: cursor.starting_after,
		endingBefore: cursor.ending_before,
		page: pageIndex,
	});

	const coupons = data?.data || [];
	const hasMore = data?.has_more || false;

	const goNext = () => {
		if (!hasMore || coupons.length === 0) return;

		const lastId = coupons[coupons.length - 1]?.id;
		if (!lastId) return;
		setPageStack((prev) => [...prev, lastId]);
		setCursor({ starting_after: lastId });
		setPageIndex((i) => i + 1);
	};

	const goPrev = () => {
		if (pageStack.length === 0) return;

		const prevId = pageStack[pageStack.length - 2]; // previous page's last item
		const newStack = [...pageStack];
		newStack.pop(); // remove current page

		setPageStack(newStack);
		setCursor(prevId ? { ending_before: prevId } : {});
		setPageIndex((i) => Math.max(0, i - 1));
	};

	const disablePrev = pageIndex === 0; // no previous pages
	const disableNext = !hasMore && pageIndex >= pageStack.length - 1;

	return {
		coupons,
		hasMore,
		goNext,
		goPrev,
		disableNext,
		disablePrev,
		pageIndex,
		...rest,
	};
}
