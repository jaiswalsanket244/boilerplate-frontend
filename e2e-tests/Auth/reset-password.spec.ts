import { test, expect, Page } from "@playwright/test";

test.describe("Reset Password Flow", () => {
	const userEmail = "vaishnavi@byldd.com";

	// -------------------- Positive Test --------------------
	test("- valid Path ui flow", async ({ page }: { page: Page }) => {
		await page.goto("https://boilerplate.byldd.com/signin");

		await test.step("Navigate to Reset Password page", async () => {
			await page.getByRole("link", { name: "Reset Password" }).click();
		});

		let apiCalled = false;

		// Mock Reset Password API before triggering
		await page.route("**/api/auth/reset-password", (route) => {
			apiCalled = true;
			route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({ message: "Password reset successful" }),
			});
		});

		await test.step(" Forgot Password", async () => {
			await page.getByRole("textbox", { name: "Email Address" }).fill(userEmail);
			await page.getByRole("button", { name: "Forgot Password" }).click();

			await expect(
				page.getByText("Email sent successfully! Please check your email for further instructions.", { exact: true })
			).toBeVisible();
		});

		// Navigate to Reset Password page with mock token but token is expire it just check UI Flow
		const mockToken = "mocked-token";
		await page.goto(`https://boilerplate.byldd.com/reset-password?email=${userEmail}&token=${mockToken}`);

		await test.step("Fill new password form", async () => {
			await page.getByLabel("Password", { exact: true }).fill("NewPassword@123");
			await page.getByRole("textbox", { name: "Confirm Password" }).fill("NewPassword@123");
			await page.getByRole("button", { name: "Reset Password" }).click();
		});

		// Verify API was called
		expect(apiCalled).toBeTruthy();
	});

	// -------------------- Negative Test - Expired Token --------------------
	test("Expired Token", async ({ page }: { page: Page }) => {
		await page.route("**/api/auth/reset-password", (route) =>
			route.fulfill({
				status: 403,
				contentType: "application/json",
				body: JSON.stringify({ message: "Token expired" }),
			})
		);

		await page.goto(`https://boilerplate.byldd.com/reset-password?email=${userEmail}&token=expired-token`);

		await page.getByLabel("Password", { exact: true }).fill("NewPassword@123");
		await page.getByRole("textbox", { name: "Confirm Password" }).fill("NewPassword@123");
		await page.getByRole("button", { name: "Reset Password" }).click();
		// Assert expired token message
		await expect(page.getByText("jwt malformed", { exact: true })).toBeVisible();
	});

	// -------------------- Negative Test - Invalid Token --------------------
	test("- Invalid Token", async ({ page }: { page: Page }) => {
		await page.route("**/api/auth/reset-password", (route) =>
			route.fulfill({
				status: 401,
				contentType: "application/json",
				body: JSON.stringify({ message: "Invalid token" }),
			})
		);

		await page.goto(`https://boilerplate.byldd.com/reset-password?email=${userEmail}&token=invalid-token`);

		await page.getByLabel("Password", { exact: true }).fill("NewPassword@123");
		await page.getByRole("textbox", { name: "Confirm Password" }).fill("NewPassword@123");
		await page.getByRole("button", { name: "Reset Password" }).click();
		// Assert invalid token message
		await expect(page.getByText("jwt malformed")).toBeVisible();
	});
});

// test("verify Reset password -Non existing email", async ({ page }) => {
// 	await page.goto("https://boilerplate.byldd.com/signin");
// 	await page.getByRole("link", { name: "Reset Password" }).click();

// 	await page.getByRole("textbox", { name: "Email Address" }).fill("vaishnavi1234@byldd.com");
// 	await page.getByRole("button", { name: "Forgot Password" }).click();
// 	await expect(page.getByText("User not found", { exact: true })).toBeVisible();
// });
