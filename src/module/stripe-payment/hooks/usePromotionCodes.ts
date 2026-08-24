import { useStripePaymentApi } from "@/module/stripe-payment/hooks/useStripePaymentApi";
import { useState } from "react";

export function usePromotionCodes(couponId: string) {
	const { usePromotionCodesQuery } = useStripePaymentApi();

	const [pageStack, setPageStack] = useState<string[]>([]); // stack of cursors (IDs)
	const [cursor, setCursor] = useState<{ starting_after?: string; ending_before?: string }>({});
	const [page, setPage] = useState(1);

	const { data, ...rest } = usePromotionCodesQuery({
		limit: 15,
		startingAfter: cursor.starting_after,
		endingBefore: cursor.ending_before,
		page,
		couponId,
	});

	const codes = data?.data || [];
	const hasMore = data?.has_more || false;

	const goNext = () => {
		if (!hasMore || codes.length === 0) return;

		const lastId = codes[codes.length - 1]?.id;
		if (!lastId) return;
		setPageStack((prev) => [...prev, lastId]);
		setCursor({ starting_after: lastId });
		setPage((i) => i + 1);
	};

	const goPrev = () => {
		if (pageStack.length === 0) return;

		const prevId = pageStack[pageStack.length - 2]; // previous page's last item
		const newStack = [...pageStack];
		newStack.pop(); // remove current page

		setPageStack(newStack);
		setCursor(prevId ? { ending_before: prevId } : {});
		setPage((i) => Math.max(1, i - 1));
	};

	const disablePrev = page === 1; // no previous pages
	const disableNext = !hasMore && page >= pageStack.length - 1;

	return {
		promotionCodes: codes,
		hasMore,
		goNext,
		goPrev,
		disableNext,
		disablePrev,
		page,
		...rest,
	};
}
