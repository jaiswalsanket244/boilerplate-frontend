"use client";

import NotificationDropdown from "@/components/common/dropdown/notification-dropdown";
import ProfileMenu from "@/components/common/profile-menu/profile-menu";
import { Button } from "@/components/ui/button";
import MobileMenuDrawer from "@/module/profile/components/mobile-sidebar-menu";
import { useEffect, useState } from "react";
import { FaRegBell } from "react-icons/fa";
import { RxHamburgerMenu } from "react-icons/rx";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { THEMES } from "@/types";
import { useProfileAPI } from "@/module/profile/hooks/useProfile";

function HeaderMenuRight() {
	const { useUnreadNotificationCount } = useProfileAPI();
	const { data } = useUnreadNotificationCount();

	return (
		<div className="ml-auto flex items-center gap-2">
			<ModeToggle />
			<NotificationDropdown>
				<div className="relative">
					{Number(data?.count) > 0 && (
						<span className="absolute top-0 right-1 z-10 flex size-5 translate-x-1/2 -translate-y-1/2 transform items-center justify-center rounded-full bg-red-500 text-[0.6rem] text-white">
							{data?.count}
						</span>
					)}
					<Button
						variant={"outline"}
						aria-label="Notification"
						className="relative flex h-[34px] w-[34px] items-center justify-center rounded-md p-2 shadow-sm transition-colors md:h-9 md:w-9"
					>
						<FaRegBell />
					</Button>
				</div>
			</NotificationDropdown>
			<ProfileMenu />
		</div>
	);
}

export default function Header() {
	const [drawerState, setDrawerState] = useState(false);

	return (
		<header className="border-b-border bg-background 3xl:px-8 4xl:px-10 sticky top-0 z-50 flex items-center border-b px-4 py-4 backdrop-blur-xl md:px-5 lg:px-6 2xl:py-5">
			<div className="flex w-full max-w-2xl items-center">
				<div className="block px-4 xl:hidden">
					<Button
						className="bg-primary flex h-8 w-[42px] items-center justify-center rounded-md text-white"
						onClick={() => setDrawerState(true)}
					>
						<RxHamburgerMenu size={21} className="text-white" />
					</Button>
				</div>
				<div className="px-4">
					<MobileMenuDrawer size="sm" placement="left" isOpen={drawerState} handleClose={() => setDrawerState(false)} />
				</div>
			</div>
			<HeaderMenuRight />
		</header>
	);
}

export function ModeToggle() {
	const { setTheme } = useTheme();

	const handleThemeChange = (theme: string) => {
		setTheme(theme);
		document.documentElement.setAttribute("data-theme", theme.includes("dark") ? "dark" : "light");
	};

	useEffect(() => {
		const currentTheme = localStorage.getItem("theme");
		document.documentElement.setAttribute("data-theme", currentTheme?.includes("dark") ? "dark" : "light");
	}, []);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="icon" className="rounded-md">
					<Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
					<Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
					<span className="sr-only">Toggle theme</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{Object.values(THEMES).map((theme) => {
					return (
						<DropdownMenuItem key={theme} onClick={() => handleThemeChange(theme)}>
							{theme.charAt(0).toUpperCase() + theme.slice(1).replace("-", " ")}
						</DropdownMenuItem>
					);
				})}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
