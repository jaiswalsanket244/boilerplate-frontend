import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	/**
	 * Specify your server-side environment variables schema here. This way you can ensure the app
	 * isn't built with invalid env vars.
	 */
	server: {},

	/**
	 * Specify your client-side environment variables schema here. This way you can ensure the app
	 * isn't built with invalid env vars. To expose them to the client, prefix them with
	 * `NEXT_PUBLIC_`.
	 */
	client: {
		NEXT_PUBLIC_API_URL: z.string().url(),
		NEXT_PUBLIC_STRIPE_KEY: z.string(),
		NEXT_PUBLIC_STREAM_API_KEY: z.string(),
		NEXT_PUBLIC_WSS_ENDPOINT: z.string().url(),
		NEXT_PUBLIC_ONE_SIGNAL_APP_ID: z.string(),
	},

	/**
	 * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
	 * middlewares) or client-side so we need to destruct manually.
	 */
	runtimeEnv: {
		NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
		NEXT_PUBLIC_STRIPE_KEY: process.env.NEXT_PUBLIC_STRIPE_KEY,

		NEXT_PUBLIC_STREAM_API_KEY: process.env.NEXT_PUBLIC_STREAM_API_KEY,
		NEXT_PUBLIC_WSS_ENDPOINT: process.env.NEXT_PUBLIC_WSS_ENDPOINT,
		NEXT_PUBLIC_ONE_SIGNAL_APP_ID: process.env.NEXT_PUBLIC_ONE_SIGNAL_APP_ID,
	},
	/**
	 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
	 * This is especially useful for Docker builds.
	 */
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
