import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./e2e-tests",
	fullyParallel: true,

	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,

	workers: process.env.CI ? 1 : undefined,

	reporter: "html",

	use: {
		headless: false, // Ensure visible window
		viewport: null, // Prevent fixed viewport override
		launchOptions: {
			args: ["--start-maximized"], // Start browser maximized
		},
		screenshot: "only-on-failure",
		video: "retain-on-failure",
		trace: "on-first-retry",
	},

	// Global timeouts
	timeout: 60_000,
	expect: {
		timeout: 15_000,
	},

	projects: [
		{
			name: "chromium",
			use: {
				...devices["Desktop Chrome"],
			},
		},
	],
});
