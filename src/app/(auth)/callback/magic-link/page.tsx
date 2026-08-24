"use client";
import { useAuthAPI } from "@/module/auth/hooks/useAuth";
import { useMenuStore } from "@/stores/menu-store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MagicLogin() {
	const { useVerifyMagicLinkMutation } = useAuthAPI();
	const router = useRouter();

	useEffect(() => {
		const handleCallback = () => {
			try {
				const searchParams = new URLSearchParams(window.location.search);
				const code = searchParams.get("code");
				if (!code) {
					console.error("code not found");
					return;
				}
				useVerifyMagicLinkMutation.mutate(code, {
					onSuccess: () => {
						router.push(useMenuStore.getState().defaultRedirectUrl);
					},
					onError: () => {
						window.close();
					},
				});
			} catch {
				window.close();
			}
		};

		void handleCallback();
	}, []);

	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="text-center">
				<h1 className="text-xl font-semibold">Verifying the link</h1>
				<p className="text-txt-secondary-900 mt-2">Please wait...</p>
			</div>
		</div>
	);
}
