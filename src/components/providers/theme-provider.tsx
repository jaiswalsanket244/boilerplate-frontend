"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { THEMES } from "@/types";

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
	return (
		<NextThemesProvider {...props} themes={Object.values(THEMES)}>
			{children}
		</NextThemesProvider>
	);
}
