"use client";

import { env } from "@/env.mjs";
import { useEffect } from "react";
import OneSignal from "react-onesignal";

export default function OneSignalProvider() {
	useEffect(() => {
		async function initOneSignal() {
			try {
				await OneSignal.init({
					appId: env.NEXT_PUBLIC_ONE_SIGNAL_APP_ID,
					allowLocalhostAsSecureOrigin: true,
				});
			} catch (error) {
				console.error("Error initializing OneSignal:", error);
			}
		}

		void initOneSignal();
	}, []);

	return null;
}
