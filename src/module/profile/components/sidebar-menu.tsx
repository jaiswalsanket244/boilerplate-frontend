"use client";
import type { MenuItem } from "@/module/profile/types";
import { COOKIES } from "@/types";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";
import { clearCookies, setCookies } from "@/lib/utils/cookies";
import { shouldUseImpersonatedMenu, useProfileAPI } from "@/module/profile/hooks/useProfile";
import { isRouteActive, isSubMenuActive } from "@/module/profile/utils/menu-items";
import { useMenuStore } from "@/stores/menu-store";

const AppSidebarMenu: React.FC<{ className?: string }> = () => {
	const { useGetUserData } = useProfileAPI();
	const { data: userData } = useGetUserData();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const { menuItems, defaultRedirectUrl, setMenuForUser } = useMenuStore();

	const companyRefInQuery = searchParams.get("companyRef");
	const isSuperAdminPath = pathname.startsWith("/super-admin");

	if (isSuperAdminPath) {
		clearCookies([COOKIES.COMPANY_REF, COOKIES.IS_ADMIN_PATH]);
	}

	if (companyRefInQuery) {
		setCookies({
			[COOKIES.COMPANY_REF]: companyRefInQuery,
			[COOKIES.IS_ADMIN_PATH]: "true",
		});
	}

	const isPasswordRotationLocked = userData?.isPasswordExpired;

	const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, href?: string) => {
		if (!isPasswordRotationLocked) return;
		if (href && isRouteActive(pathname, href)) return;
		e.preventDefault();
		e.stopPropagation();
	};

	useEffect(() => {
		if (userData) {
			setMenuForUser(userData, shouldUseImpersonatedMenu(userData));
		}
	}, [pathname, userData]);

	const renderSubMenu = (item: MenuItem) => {
		const isOpen = isSubMenuActive(pathname, item.subItems);

		return (
			<Collapsible key={item.name} defaultOpen={isOpen}>
				<SidebarMenuItem>
					<CollapsibleTrigger asChild>
						<SidebarMenuButton
							className={cn(
								"flex w-full items-center justify-between gap-3 rounded-lg px-4 py-3",
								isOpen && "bg-sidebar-accent text-sidebar-accent-foreground"
							)}
							data-testid={`sidebar-menu-item-${item.name.split(" ").join("-").toLowerCase()}`}
						>
							<div className="flex items-center gap-3">
								{item.Icon}
								<span>{item.name}</span>
							</div>
							<ChevronDown
								className={cn(
									"h-4 w-4 transition-transform",
									!isOpen && "group-data-[state=closed]/collapsible:rotate-180"
								)}
							/>
						</SidebarMenuButton>
					</CollapsibleTrigger>

					<CollapsibleContent>
						<SidebarMenuSub className="mt-1 ml-6 space-y-1">
							{item.subItems
								?.filter((sub) => !sub.hidden)
								.map((sub) => (
									<SidebarMenuSubItem key={sub.name}>
										<SidebarMenuSubButton
											asChild
											className={cn(
												"hover:bg-sidebar-accent hover:text-sidebar-accent-foreground [&>svg]:text-txt-primary flex items-center gap-3 rounded-lg px-4 py-2 text-sm",
												isRouteActive(pathname, sub.href) &&
													"bg-primary text-primary-foreground [&>svg]:text-primary-foreground"
											)}
										>
											<Link
												href={sub.href}
												onClick={(e) => handleNavigation(e, sub.href)}
												aria-disabled={isPasswordRotationLocked}
												tabIndex={isPasswordRotationLocked ? -1 : 0}
												className={cn(isPasswordRotationLocked && "pointer-events-none cursor-not-allowed opacity-60")}
												data-testid={`sidebar-submenu-item-${sub.name.split(" ").join("-").toLowerCase()}`}
											>
												{sub.Icon}
												<span>{sub.name}</span>
											</Link>
										</SidebarMenuSubButton>
									</SidebarMenuSubItem>
								))}
						</SidebarMenuSub>
					</CollapsibleContent>
				</SidebarMenuItem>
			</Collapsible>
		);
	};

	const renderSingleMenu = (item: MenuItem) => (
		<SidebarMenuItem key={item.name}>
			<SidebarMenuButton
				asChild
				className={cn(
					"relative flex w-full items-center gap-3 rounded-lg px-4 py-3",
					isRouteActive(pathname, item.href) ? "bg-primary text-primary-foreground" : "hover:bg-sidebar-accent"
				)}
			>
				<Link
					href={item.href}
					onClick={(e) => handleNavigation(e, item.href)}
					aria-disabled={isPasswordRotationLocked}
					tabIndex={isPasswordRotationLocked ? -1 : 0}
					className={cn(isPasswordRotationLocked && "pointer-events-none cursor-not-allowed opacity-60")}
					data-testid={`sidebar-menu-item-${item.name.split(" ").join("-").toLowerCase()}`}
				>
					{item.Icon}
					<span>{item.name}</span>
					{!isRouteActive(pathname, item.href) &&
						item.href === routes.settings.changePassword &&
						userData?.passwordExpiryDaysLeft && (
							<span className="animate-glow absolute top-2 right-2 size-2 rounded-2xl bg-red-500"></span>
						)}
				</Link>
			</SidebarMenuButton>
		</SidebarMenuItem>
	);

	return (
		<Sidebar className="w-64 border-r">
			<SidebarHeader>
				<div className="sticky top-0 z-40 px-6 pt-5 pb-5">
					<Link
						href={defaultRedirectUrl || ""}
						onClick={(e) => handleNavigation(e, defaultRedirectUrl)}
						aria-disabled={isPasswordRotationLocked}
						tabIndex={isPasswordRotationLocked ? -1 : 0}
						className={cn(isPasswordRotationLocked && "pointer-events-none cursor-not-allowed opacity-60")}
					>
						<Image src="/assets/svg/logo.svg" width={105} height={42} alt="logo" />
					</Link>
				</div>
			</SidebarHeader>

			<SidebarContent className="px-4 py-6">
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu className="space-y-2">
							{menuItems
								.filter((item) => !item.hidden)
								.map((item) => (item.subItems ? renderSubMenu(item) : renderSingleMenu(item)))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
};

export default AppSidebarMenu;
