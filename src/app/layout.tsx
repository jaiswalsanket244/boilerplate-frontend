import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { cn } from "@/lib/utils/class-names";
import Provider from "@/components/providers/query-client-provider";
import { Lato, Inter } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import OneSignalProvider from "@/components/providers/one-signal";
import Script from "next/script";

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
						{children}
						<OneSignalProvider />
					</ThemeProvider>
				</Provider>

				<Script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" strategy="beforeInteractive" />
			</body>
		</html>
	);
}
