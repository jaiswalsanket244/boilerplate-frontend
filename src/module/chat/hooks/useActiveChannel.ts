"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useChatContext } from "stream-chat-react";
import { useCallback, useEffect, useMemo } from "react";
import { useAppChatContext } from "@/module/chat/contexts/chat-context";
import { CHAT_MODULE_SEARCH_PARAMS, CHAT_PAGE_ACTIVE_VIEW } from "@/module/chat/types";

export const useActiveChannel = () => {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const { client, setActiveChannel } = useChatContext();

	const channelId = useMemo(() => searchParams.get(CHAT_MODULE_SEARCH_PARAMS.CHANNEL_ID), [searchParams]);

	/**
	 * Set the active channel in Stream client and context
	 */
	const setActiveChannelByParam = useCallback(
		async (newChannelId: string) => {
			if (!client || !setActiveChannel) return;

			try {
				const channel = client.channel("messaging", newChannelId);

				await channel.watch({ presence: true });

				setActiveChannel(channel);
			} catch (err) {
				console.error("[useActiveChannel] Failed to set active channel:", err);
			}
		},
		[client, setActiveChannel]
	);

	/**
	 * Update the URL search params with new active channel id
	 */
	const setActiveChannelSearchParam = useCallback(
		(newChannelId: string | null) => {
			const params = new URLSearchParams(searchParams.toString());

			if (newChannelId) {
				params.set(CHAT_MODULE_SEARCH_PARAMS.CHANNEL_ID, newChannelId);
			} else {
				params.delete(CHAT_MODULE_SEARCH_PARAMS.CHANNEL_ID);
			}

			router.replace(`${pathname}?${params.toString()}`, { scroll: false });
		},
		[router, pathname, searchParams]
	);

	return {
		activeChannelId: channelId,
		setActiveChannelByParam,
		setActiveChannelSearchParam,
	};
};

export const useSetActiveChannelOnPageLoad = () => {
	const { setActiveView } = useAppChatContext();
	const { client, setActiveChannel } = useChatContext();

	const { activeChannelId } = useActiveChannel();

	useEffect(() => {
		if (!activeChannelId || !client || !setActiveChannel) return;

		const timer = setTimeout(() => {
			const channel = client.channel("messaging", activeChannelId);

			channel
				.watch({ presence: true })
				.then(() => {
					setActiveChannel?.(channel);
					setActiveView(CHAT_PAGE_ACTIVE_VIEW.MESSAGING);
				})
				.catch((err) => {
					console.error("[useActiveChannel] Failed to watch channel:", err);
				});
		}, 300);

		return () => {
			clearTimeout(timer);
		};
	}, [activeChannelId, client, setActiveChannel, setActiveView]);
};
