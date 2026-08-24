"use client";

import { Button } from "@/components/ui/button";
import OrSeparation from "@/module/auth/components/or-separation";
import { useSocialAuth } from "@/module/auth/hooks/useSocialAuth";
import { SOCIAL_OAUTH_METHOD } from "@/module/auth/types";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

export function SocialAuth() {
	const { socialSignIn } = useSocialAuth();

	return (
		<div className="px-3">
			<OrSeparation title="OR" isCenter />

			<div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
				<Button
					variant="outline"
					size="lg"
					className="font-inter"
					onClick={() => void socialSignIn(SOCIAL_OAUTH_METHOD.GOOGLE)}
				>
					<FcGoogle className="mr-2 h-6 w-6 [&_svg]:size-6" />
					Continue with Google
				</Button>

				<Button
					variant="outline"
					size="lg"
					className="font-inter"
					onClick={() => void socialSignIn(SOCIAL_OAUTH_METHOD.GITHUB)}
				>
					<FaGithub className="mr-2 h-6 w-6 [&_svg]:size-6" />
					Continue with Github
				</Button>
			</div>
		</div>
	);
}
