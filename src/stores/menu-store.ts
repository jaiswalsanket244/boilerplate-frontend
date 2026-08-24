"use client";

import { create } from "zustand";
import type { MenuItem } from "@/module/profile/types";
import { buildMenuForUser } from "@/module/profile/utils/menu-permissions";
import type { IUser } from "@/types";
import type { PERMISSIONS } from "@/types/permission";

type GeneratedMenuState = {
	menuItems: MenuItem[];
	settingsMenuItems: MenuItem[];
	defaultRedirectUrl: string;
	permissions: PERMISSIONS[];
	role: string | null;
};

type MenuStore = GeneratedMenuState & {
	setMenuForUser: (user: Pick<IUser, "permissions" | "roles">, isSuperAdminPath?: boolean) => GeneratedMenuState;
	resetMenu: () => void;
};

const initialState: GeneratedMenuState = {
	menuItems: [],
	settingsMenuItems: [],
	defaultRedirectUrl: "",
	permissions: [],
	role: null,
};

export const useMenuStore = create<MenuStore>((set) => ({
	...initialState,
	setMenuForUser: (user: Pick<IUser, "permissions" | "roles">, isImpersonatting = false) => {
		const generatedState = buildMenuForUser(user, isImpersonatting);
		set(generatedState);

		return generatedState;
	},
	resetMenu: () => set(initialState),
}));
