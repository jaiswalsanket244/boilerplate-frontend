"use client";

import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";

import { StatusMessage } from "@/components/common/status-message/status-message";
import { Switch } from "@/components/ui/switch";
import { useCardsAPI } from "@/module/cards/hooks/useCards";
import type { CardDetailsType, WalletType } from "@/module/cards/types";
import { MESSAGE_STATUS } from "@/types";

const getWalletLabel = (wallet: WalletType): string => {
	switch (wallet.type) {
		case "google_pay":
			return "Google Pay";
		case "apple_pay":
			return "Apple Pay";
		default:
			return "Wallet";
	}
};

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
					{cards.map((card: CardDetailsType) => {
						const wallet = card.card.wallet;
						// Wallet cards expose the tokenized device number in `last4`; the real
						// funding card's digits live in `wallet.dynamic_last4`.
						const displayLast4 = wallet?.dynamic_last4 ?? card.card.last4;

						return (
							<li
								key={card.id}
								className={`flex items-center justify-between rounded-lg border p-4 shadow-xs ${
									updatingCardId === card.id ? "opacity-60" : ""
								}`}
							>
								<div>
									<div className="flex items-center gap-2">
										<p className="font-medium capitalize">{card.card.brand}</p>
										{wallet && (
											<span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
												{getWalletLabel(wallet)}
											</span>
										)}
									</div>
									<p className="text-sm text-gray-500">**** **** **** {displayLast4}</p>
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
						);
					})}
				</ul>
			)}
		</div>
	);
}
