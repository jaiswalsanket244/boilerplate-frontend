"use client";

import { SocialCallbackHandler } from "@/module/auth/components/social-callback-handler";
import { SOCIAL_OAUTH_METHOD } from "@/module/auth/types";

export default function AuthCallback() {
	return <SocialCallbackHandler provider={SOCIAL_OAUTH_METHOD.GITHUB} />;
}
