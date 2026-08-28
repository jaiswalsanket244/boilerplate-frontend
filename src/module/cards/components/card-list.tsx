"use client";

import { useCardsAPI } from "@/module/cards/hooks/useCards";
import type { CardDetailsType } from "@/module/cards/types";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { MESSAGE_STATUS } from "@/types";
import { StatusMessage } from "@/components/common/status-message/status-message";

export default function CardList() {
	const { useGetCardsQuery, useSetDefaultCardMutation } = useCardsAPI();
	const { data, isLoading, isError, refetch } = useGetCardsQuery();
	const setDefaultCardMutation = useSetDefaultCardMutation();

	const [updatingCardId, setUpdatingCardId] = useState<string | null>(null);
	const [status, setStatus] = useState<{ type: MESSAGE_STATUS; message: string } | null>(null);

	if (isLoading) return <p>Loading cards...</p>;
	if (isError) return <p>Could not fetch cards</p>;

	const cards: CardDetailsType[] = data?.cards ?? [];
	const defaultCardId: string | null = data?.defaultPaymentMethodId ?? null;

	const handleSetDefault = (paymentMethodId: string, checked: boolean) => {
		setUpdatingCardId(paymentMethodId);
		setStatus({ type: MESSAGE_STATUS.INFO, message: "Updating default card..." });

		setDefaultCardMutation.mutate(checked ? paymentMethodId : null, {
			onSuccess: () => {
				void refetch();
				setStatus({
					type: MESSAGE_STATUS.SUCCESS,
					message: checked ? "Default card updated successfully!" : "Default card removed successfully.",
				});
			},
			onError: () => {
				setStatus({ type: MESSAGE_STATUS.ERROR, message: "Failed to update default card." });
			},
			onSettled: () => {
				setUpdatingCardId(null);
				setTimeout(() => setStatus(null), 3000);
			},
		});
	};

	return (
		<div className="space-y-4">
			<h2 className="text-xl font-semibold">Saved Cards</h2>

			{/* Inline status message */}
			{status && <StatusMessage type={status.type} message={status.message} />}

			{/* Cards list */}
			{cards.length === 0 ? (
				<p className="text-gray-500">No cards saved yet.</p>
			) : (
				<ul className="space-y-3">
					{cards.map((card: CardDetailsType) => (
						<li
							key={card.id}
							className={`flex items-center justify-between rounded-lg border p-4 shadow-xs ${
								updatingCardId === card.id ? "opacity-60" : ""
							}`}
						>
							<div>
								<p className="font-medium capitalize">{card.card.brand}</p>
								<p className="text-sm text-gray-500">**** **** **** {card.card.last4}</p>
								<p className="text-xs text-gray-400">
									Expires {card.card.exp_month}/{card.card.exp_year}
								</p>
							</div>
							<Switch
								checked={card.id === defaultCardId}
								disabled={updatingCardId === card.id}
								onCheckedChange={(checked) => handleSetDefault(card.id, checked)}
							/>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
