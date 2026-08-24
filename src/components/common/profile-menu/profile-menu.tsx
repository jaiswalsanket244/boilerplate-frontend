"use client";

import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { clearCookies } from "@/lib/utils/cookies";
import { useAuthAPI } from "@/module/auth/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useState } from "react";

// NOTE: Profile dropdown needs to be implemented here. For now it just contains a `sign-out` button.
export default function ProfileMenu() {
	const router = useRouter();
	const { useLogoutMutation } = useAuthAPI();
	const [isFailed, setIsFailed] = useState(false);

	const handleSignOut = async () => {
		try {
			await useLogoutMutation.mutateAsync();

			clearCookies();
			router.replace(routes.auth.signIn);
		} catch {
			setIsFailed(true);

			setTimeout(() => {
				setIsFailed(false);
			}, 3000);
		}
	};

	return (
		<>
			{!isFailed && (
				<Button className="rounded-md" onClick={() => void handleSignOut()} disabled={useLogoutMutation.isPending}>
					{useLogoutMutation.isPending ? "Signing Out..." : "Sign Out"}
				</Button>
			)}

			{isFailed && (
				<div className="animate-fade-in border-error bg-error/10 text-error flex h-9 shrink-0 items-center rounded-sm border p-2 font-bold">
					Logout Failed
				</div>
			)}
		</>
	);
}
