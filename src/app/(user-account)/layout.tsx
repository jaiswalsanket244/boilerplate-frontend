"use client";

import RouteGuard from "@/components/providers/route-guard";
import { SocketProvider } from "@/components/providers/socket-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";
import CheckActiveStatus from "@/lib/utils/check-active-user";
import Header from "@/module/profile/components/header";
import SidebarMenu from "@/module/profile/components/sidebar-menu";
import { usePathname } from "next/navigation";
import { Suspense } from "react";

const pathnamesWithoutPadding = [routes.chat, routes.queries];

const shouldAddPadding = (pathname: string) => {
	return !pathnamesWithoutPadding.includes(pathname) && !pathname.includes("settings");
};

export default function Layout({ children }: ChildProps) {
	const pathname = usePathname();

	return (
		<SocketProvider>
			<SidebarProvider>
				<CheckActiveStatus />
				<Suspense>
					<SidebarMenu />
				</Suspense>
				<SidebarInset className="min-w-0">
					<Header />
					<RouteGuard>
						<main className={cn("flex grow flex-col", shouldAddPadding(pathname) && "p-4 md:p-6 lg:p-8")}>
							{children}
						</main>
					</RouteGuard>
				</SidebarInset>
			</SidebarProvider>
		</SocketProvider>
	);
}
