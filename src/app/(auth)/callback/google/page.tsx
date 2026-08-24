"use client";

import { SocialCallbackHandler } from "@/module/auth/components/social-callback-handler";
import { SOCIAL_OAUTH_METHOD } from "@/module/auth/types";

// This page is used to handle the callback URL during the Social-Sign's OAuth flow.
export default function AuthCallback() {
	return <SocialCallbackHandler provider={SOCIAL_OAUTH_METHOD.GOOGLE} />;
}
