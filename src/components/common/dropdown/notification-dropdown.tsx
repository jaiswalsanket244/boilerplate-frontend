"use client";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { getUserCookies } from "@/lib/utils/cookies";
import { useCompanyAPI } from "@/module/company/hooks/useCompany";
import { useProfileAPI } from "@/module/profile/hooks/useProfile";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { type JSX, type RefObject } from "react";

function NotificationsList() {
	const queryClient = useQueryClient();

	const { useGetUserData, useNotifications, useMarkAllAsRead, useMarkAsRead } = useProfileAPI();
	const { useGetOneCompanyData } = useCompanyAPI();

	const markAllAsRead = useMarkAllAsRead();
	const markAsRead = useMarkAsRead();
	const { data: user } = useGetUserData();
	const userId = user?._id;
	let { data: notifications } = useNotifications(userId as string);

	// below values are used to load content dynamically when super-admin visits admin route
	const { companyRef, isAdminPath } = getUserCookies();
	const { data: companyData } = useGetOneCompanyData(companyRef, user?.roles);
	const { data: adminNotifications } = useNotifications(companyData?.userRef._id as string);

	if (isAdminPath) {
		notifications = adminNotifications;
	}
	const handleMarkAllAsRead = () => {
		markAllAsRead.mutate(undefined, {
			onSuccess: () => {
				void queryClient.invalidateQueries({
					predicate: (query) => query.queryKey.includes("notifications"),
				});
			},
		});
	};

	const handleMarkAsRead = (id: string) => {
		markAsRead.mutate(id, {
			onSuccess: () => {
				void queryClient.invalidateQueries({
					predicate: (query) => query.queryKey.includes("notifications"),
				});
			},
		});
	};

	return (
		<>
			<div className="relative flex max-h-[70vh] w-full max-w-sm min-w-80 flex-col overflow-hidden rtl:text-right">
				<div className="mb-3 flex items-center justify-between gap-5">
					<h5 className="text-txt-primary text-base font-semibold">Notifications</h5>
					<div className="flex items-center space-x-1">
						<Button
							onClick={handleMarkAllAsRead}
							variant={"plain"}
							disabled={markAllAsRead.isPending}
							className="text-txt-primary text-sm leading-none font-medium underline underline-offset-2"
						>
							Mark all as read
						</Button>
					</div>
				</div>

				{notifications && notifications.length > 0 ? (
					<ul className="flex flex-1 flex-col overflow-y-auto pr-2">
						{notifications.map((item) => (
							<li
								key={item._id}
								className={cn(
									"border-border font-lato flex w-full border-spacing-1 items-center justify-between gap-x-5 border-b p-3 pb-2"
								)}
							>
								<div className="flex flex-1 flex-col gap-y-2">
									<h6 className="text-txt-primary-900 font-semibold">{item.title}</h6>
									<p className="text-txt-secondary-800 max-w-48 sm:max-w-72">{item.message}</p>
								</div>
								{item.redirectUrl && (
									<Link
										href={item.redirectUrl}
										onClick={() => handleMarkAsRead(item._id)}
										className="bg-accent text-accent-foreground hover:bg-accent/50 shrink-0 rounded-3xl px-5 py-2 transition-colors"
									>
										View
									</Link>
								)}
							</li>
						))}
					</ul>
				) : (
					<p className="text-center text-base font-medium">No notifications available!</p>
				)}
			</div>
		</>
	);
}

export default function NotificationDropdown({
	children,
}: {
	children: JSX.Element & { ref?: RefObject<string | null> };
}) {
	const isMobile = useIsMobile();
	return (
		<Popover>
			<PopoverTrigger asChild>{children}</PopoverTrigger>
			<PopoverContent side="bottom" align={isMobile ? "center" : "end"} className="w-auto">
				<NotificationsList />
			</PopoverContent>
		</Popover>
	);
}
