"use client";

import { routes } from "@/config/routes";
import { clearSessionStorage, getSessionStorage } from "@/lib/utils/session-storage";
import { useAuthAPI } from "@/module/auth/hooks/useAuth";
import { type ISocialCallbackHandlerProps } from "@/module/auth/types";
import { useMenuStore } from "@/stores/menu-store";
import { SESSION_STORAGE_KEYS } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Shared component to handle social authentication callbacks
 * @param provider - The social auth provider (FACEBOOK, GOOGLE, LINKEDIN, MICROSOFT, APPLE)
 * @param handleOnSuccess - Optional callback function to execute on successful authentication
 * @param handleOnError - Optional callback function to execute on authentication error
 */
export function SocialCallbackHandler({ provider, handleOnSuccess, handleOnError }: ISocialCallbackHandlerProps) {
	const { useSocialRegisterMutation } = useAuthAPI();
	const router = useRouter();

	const socialRegisterMutation = useSocialRegisterMutation();

	async function handleCallback() {
		const searchParams = new URLSearchParams(window.location.search);
		const code = searchParams.get("code");
		const inviteToken = getSessionStorage<string>(SESSION_STORAGE_KEYS.INVITE_TOKEN) || undefined;

		if (!code) {
			handleOnError?.(new Error("No authorization code found"));
			return;
		}

		socialRegisterMutation.mutate(
			{ code, provider, inviteToken },
			{
				onSuccess: () => {
					clearSessionStorage(SESSION_STORAGE_KEYS.INVITE_TOKEN);
					const redirectRoute = useMenuStore.getState().defaultRedirectUrl || routes.dashboard;

					handleOnSuccess?.();
					router.replace(redirectRoute);
				},
				onError: (error) => {
					handleOnError?.(error);
				},
			}
		);
	}

	useEffect(() => {
		void handleCallback();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="text-center">
				<h1 className="text-xl font-semibold">Completing authentication...</h1>
				<p className="text-txt-secondary-900 mt-2">This window will close automatically.</p>
			</div>
		</div>
	);
}
