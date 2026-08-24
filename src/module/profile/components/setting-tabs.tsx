"use client";

import { routes } from "@/config/routes";
import { cn } from "@/lib/utils/class-names";
import type { SettingsTabsProps } from "@/module/profile/types/index";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { useProfileAPI } from "@/module/profile/hooks/useProfile";
import { useMenuStore } from "@/stores/menu-store";

const SettingsTabs: React.FC<SettingsTabsProps> = ({ className }) => {
	const pathname = usePathname();

	const { useGetUserData } = useProfileAPI();
	const { data: userData } = useGetUserData();
	const { settingsMenuItems } = useMenuStore();

	const isPasswordExpired = userData?.isPasswordExpired;

	return (
		<div
			className={cn(
				"flex min-w-[265px] shrink-0 flex-row flex-wrap gap-2 space-y-2 border-r px-3 md:flex-col md:border-none",
				className
			)}
		>
			{settingsMenuItems.map(({ name, href, Icon }) => {
				const isActive = pathname === href;
				const isDisabled = isPasswordExpired && href !== routes.settings.changePassword;

				return (
					<Link
						key={name}
						href={href}
						aria-current={isActive ? "page" : undefined}
						className={cn(
							"text-txt-primary relative m-0 flex items-center gap-3 rounded-xl border px-3 py-3 text-sm transition-colors md:border-none",
							isActive ? "bg-muted font-bold" : "hover:bg-muted/50",
							isDisabled ? "pointer-events-none cursor-not-allowed opacity-50" : ""
						)}
					>
						{Icon}
						<span>{name}</span>
						{href === routes.settings.changePassword && userData?.passwordExpiryDaysLeft && (
							<span className="animate-glow absolute top-2 right-2 size-2 rounded-2xl bg-red-500"></span>
						)}
					</Link>
				);
			})}
		</div>
	);
};

export default SettingsTabs;
