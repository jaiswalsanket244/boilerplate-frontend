import react from "@vitejs/plugin-react";
import path from "path";
import magicalSvg from "vite-plugin-magical-svg";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [
		react(),
		tsconfigPaths(),
		magicalSvg({
			target: "react",
		}),
	],
	test: {
		environment: "jsdom",
		env: {
			SKIP_ENV_VALIDATION: "true",
		},
		globals: true,
		setupFiles: ["./src/tests/vitest.setup.ts"],
		deps: {},
		include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
