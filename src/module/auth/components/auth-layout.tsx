"use client";

import Image from "next/image";
import Link from "next/link";
import { SocialAuth } from "@/module/auth/components/social-auth";
import type { IAuthFooterProps, IAuthLayoutProps } from "@/module/auth/types";
import { authFooterConfig } from "@/module/auth/utils/constants";

export default function AuthLayout({ children, type, showSocialAuth }: IAuthLayoutProps) {
	return (
		<div className="bg-background min-h-screen px-5 py-6 lg:px-12 lg:py-8">
			<div className="grid h-[calc(100vh-64px)] grid-cols-1 gap-10 lg:grid-cols-2">
				<div className="flex-center b-black-100 rounded-[20px]">
					<div className="min-h-[580x] w-full px-8 py-6">
						{children}

						{showSocialAuth && <SocialAuth />}

						{type && <AuthFooter {...authFooterConfig[type]} />}
					</div>
				</div>

				<div className="b-black-100 flex-center rounded-[20px] py-6 pl-8">
					<Image src="/assets/png/auth-bg.png" alt="Reset Password Thumbnail" width={631} height={577} />
				</div>
			</div>
		</div>
	);
}

export function AuthFooter({ text, linkText, href }: IAuthFooterProps) {
	return (
		<div className="text-txt-primary-800 mt-4 flex items-center justify-center gap-1 font-medium">
			<span>{text}</span>
			<Link href={href} className="hover:text-blue font-semibold underline underline-offset-1 transition-colors">
				{linkText}
			</Link>
		</div>
	);
}
