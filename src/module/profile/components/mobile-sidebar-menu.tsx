"use client";

import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";
import { cn } from "@/lib/utils/class-names";
import { getUserCookies } from "@/lib/utils/cookies";
import SidebarMenu from "@/module/profile/components/sidebar-menu";
import type { Props } from "@/module/profile/types";
import { Suspense } from "react";

export default function MobileMenuDrawer({ isOpen, handleClose }: Props) {
	const { userType } = getUserCookies();

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
			<DialogOverlay className="fixed inset-0 z-50 bg-black/50" />
			<DialogContent
				className={cn(
					"fixed top-1/2 left-0 z-50 h-screen w-[280px] rounded-none border-none bg-white p-4 shadow-lg transition-transform duration-300",
					isOpen ? "translate-x-0" : "-translate-x-full"
				)}
			>
				<Suspense>
					<SidebarMenu className="w-full!" />
				</Suspense>
			</DialogContent>
		</Dialog>
	);
}
