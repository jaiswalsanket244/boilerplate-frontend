import type { Metadata, Viewport } from "next";

import "@/styles/globals.css";

import { Inter, Lato } from "next/font/google";
import Script from "next/script";

import MaintenanceBanner from "@/components/common/maintenance-banner/maintenance-banner";
import OneSignalProvider from "@/components/providers/one-signal";
import Provider from "@/components/providers/query-client-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils/class-names";

const lato = Lato({
	subsets: ["latin"],
	variable: "--font-lato",
	weight: ["100", "300", "400", "700", "900"],
});

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
	weight: ["100", "300", "400", "700", "900"],
});

export const metadata: Metadata = {
	title: "Boilerplate",
	description: "Next Boilerplate app",
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
};

export default function RootLayout({ children }: ChildProps) {
	return (
		<html lang="en" className={cn(lato.variable, inter.variable)}>
			<body>
				<Provider>
					<ThemeProvider attribute="class" defaultTheme="system" enableSystem={false} disableTransitionOnChange>
						<MaintenanceBanner />
						{children}
						<OneSignalProvider />
					</ThemeProvider>
				</Provider>

				<Script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" strategy="beforeInteractive" />
			</body>
		</html>
	);
}
