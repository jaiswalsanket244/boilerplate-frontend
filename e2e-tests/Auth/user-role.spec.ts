import { test, expect, request, Page } from "@playwright/test";
import { PagesRouteModule } from "next/dist/server/route-modules/pages/module.compiled";

test.beforeEach("url", async ({ page }: { page: Page }) => {
	await page.goto("https://boilerplate.byldd.com/signin");
});

const invaidemail: string[] = [
	"test@",
	"@gmail.com",
	"testgmail.com",
	"test@gmail..com",
	"test@@gmail.com",
	"test@gmail...com",
	".test@gmail.com",
];

for (const email of invaidemail) {
	test(`Login with invalid email: ${email}`, async ({ page }: { page: Page }) => {
		await test.step(`Enter invalid email: ${email}`, async () => {
			// await page.goto('https://boilerplate.byldd.com/signin');
			await page.getByRole("textbox", { name: "Email" }).fill(email);
			await page.getByRole("textbox", { name: "Password" }).fill("Vaishnavi@1706");
		});

		await test.step("Verify Sign In button is disabled", async () => {
			await expect(page.getByRole("button", { name: "Sign In" })).toBeDisabled();
		});
	});
}

const invalidPass: string[] = ["vaishnavi", "Vaishnavi@1223", "123455", "@@@@@@@@@@", "vaishnavi@1706"];
for (const password of invalidPass) {
	test(`Login with invalid password : ${password}`, async ({ page }: { page: Page }) => {
		await test.step(`Enter invalid email: ${password}`, async () => {
			//await page.goto('https://boilerplate.byldd.com/signin');
			await page.getByRole("textbox", { name: "Email" }).fill("mahajanvaishnavi1706@gmail.com");
			await page.getByRole("textbox", { name: "Password" }).fill(password);
			await page.getByRole("button", { name: "Sign In" }).click();
			await expect(page.getByText("Invalid credentials", { exact: true })).toBeVisible();
		});
	});
}

// API Test cases Start
test("verify - Admin send invitation to user via email", async ({ page }) => {
	await test.step("sent invitation by admin", async () => {
		await page.getByRole("textbox", { name: "Email" }).fill("vaishnavim2k22@gmail.com");
		await page.getByRole("textbox", { name: "Password" }).fill("Vaishnavi@1706");
		await page.getByRole("button", { name: "Sign In" }).click();
		await page.locator("span").filter({ hasText: "Teams" }).first().click();
		const username = `Test User ${Date.now()}`; // unique username
		const userEmail = `testuser_${Date.now()}@mail.com`; // unique email
		await page.getByRole("button", { name: "Invite User(s)" }).click();
		await page.locator("input[type='email']").first().fill(userEmail);
		await page.getByRole("textbox").nth(1).fill(username);
		await page.getByRole("textbox").nth(2).fill("surname");
		const [inviteResponse] = await Promise.all([
			page.waitForResponse(
				(resp) =>
					resp.url().includes("https://api-bp.byldd.com/api/admin/invite-users/users") &&
					resp.request().method() === "POST"
			),

			await page.getByRole("button", { name: "Invite User(s)" }).click(),
		]);
		await expect(page.getByRole("heading", { name: "Invitation(s) Sent Successfully!" })).toBeVisible();
		expect(inviteResponse.status()).toBe(200);
		const responseBody = await inviteResponse.json();
		console.log("Invite API response:", responseBody);
		console.log(`User invited successfully:${userEmail}`);
		await page.getByTestId("dialog-close-button").click();

		await page.getByRole("button", { name: "Sign Out" }).click();
		await page.getByRole("textbox", { name: "Email" }).click();
		await page.getByRole("textbox", { name: "Email" }).fill("mahajanvaishnavi1706@gmail.com");
		await page.getByRole("textbox", { name: "Password" }).click();
		await page.getByRole("textbox", { name: "Password" }).fill("Vaishnavi@1706");
		await page.getByRole("button", { name: "Sign In" }).click();
		await expect(page.getByRole("heading", { name: "This is User dashboard" })).toBeVisible();
	});
});
test("verify - Magic link sent on email", async ({ page }: { page: Page }) => {
	await page.getByRole("link", { name: "Sign In with Magic Link" }).click();
	await page.getByRole("textbox", { name: "Email Address" }).click();
	await page.getByRole("textbox", { name: "Email Address" }).fill("mahajanvaishnavi1706@gmail.com");

	const [inviteResponse] = await Promise.all([
		page.waitForResponse(
			(resp) =>
				resp.url().includes("https://api-bp.byldd.com/api/auth/magic-link/request") &&
				resp.request().method() === "POST"
		),
		// Send Invitation button
		await page.getByRole("button", { name: "Get Magic Link" }).click(),
	]);
	await expect(page.getByText("Email sent successfully!")).toBeVisible();
	// Validate API response
	expect(inviteResponse.status()).toBe(200);

	const responseBody = await inviteResponse.json();
	console.log("Invite API response:", responseBody);
});
// API TEST CASE End

test("verify login with otp", async ({ page }) => {
	await page.getByRole("link", { name: "Sign In with OTP" }).click();
	await page.getByRole("textbox", { name: "Email Address" }).click();
	await page.getByRole("textbox", { name: "Email Address" }).fill("bylddtestv2@gmail.com");
	await page.getByTestId("send-otp-button").click();
	await page.getByTestId("input-otp").click();
	await page.getByTestId("input-otp").fill("1234");
	await page.getByRole("button", { name: "Sign In" }).click();
	await expect(page.getByRole("heading", { name: "This is User dashboard" })).toBeVisible();
});
