import { apiClient } from "@/lib/api";
import { type SOCIAL_OAUTH_METHOD } from "@/module/auth/types";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const useSocialAuth = () => {
	const router = useRouter();

	const [isSignupFailed, setIsSignupFailed] = useState<boolean>(false);

	async function getOAuthUrl(provider: SOCIAL_OAUTH_METHOD) {
		const { data } = await apiClient.get<{
			data: {
				redirectUrl: string;
			};
		}>(`auth/url/oauth?provider=${provider}`);

		return data.data.redirectUrl;
	}

	const socialSignIn = async (provider: SOCIAL_OAUTH_METHOD) => {
		try {
			const redirectUrl = await getOAuthUrl(provider);

			router.push(redirectUrl);
		} catch {
			setIsSignupFailed(true);
		}
	};

	return { socialSignIn, isSignupFailed };
};
