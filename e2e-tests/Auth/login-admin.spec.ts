import { test, expect } from "@playwright/test";

const LOGIN_URL = "https://boilerplate.byldd.com/signin";

const VALID_EMAIL = "vaishnavim2k22@gmail.com";
const VALID_PASSWORD = "Vaishnavi@1706";
const INVALID_PASSWORD = "vaishnavi@1706";

test.beforeEach(async ({ page }) => {
	await page.goto(LOGIN_URL);
});

/* -------------------- VALID LOGIN -------------------- */
test("Login with valid data", async ({ page }) => {
	await page.getByRole("textbox", { name: "Email" }).fill(VALID_EMAIL);
	await page.getByRole("textbox", { name: "Password" }).fill(VALID_PASSWORD);

	await page.getByTestId("signin-btn").click();
	await expect(page.getByRole("heading", { name: "User Growth and Activity" })).toBeVisible();
});

/* -------------------- WRONG EMAIL -------------------- */
test("Login with wrong email", async ({ page }) => {
	await page.goto("https://boilerplate.byldd.com/signin");
	await page.getByRole("textbox", { name: "Email" }).click();
	await page.getByRole("textbox", { name: "Email" }).fill("example@gmail.com");
	await page.getByRole("textbox", { name: "Password" }).click();
	await page.getByRole("textbox", { name: "Password" }).fill("vaishnavi@1706");
	await page.getByTestId("signin-btn").click();
	await expect(page.getByText("User not found! Please check")).toBeVisible();
});

/* -------------------- EMPTY FIELDS -------------------- */
test("Login with empty fields", async ({ page }) => {
	const signInButton = page.getByRole("button", { name: "Sign In" });

	await test.step("Email & Password empty", async () => {
		await page.getByRole("textbox", { name: "Email" }).fill("");
		await page.getByRole("textbox", { name: "Password" }).fill("");
		await expect(signInButton).toBeDisabled();
	});

	await test.step("Email empty, Password filled", async () => {
		await page.getByRole("textbox", { name: "Email" }).fill("");
		await page.getByRole("textbox", { name: "Password" }).fill(INVALID_PASSWORD);
		await expect(signInButton).toBeDisabled();
	});

	await test.step("Password empty, Email filled", async () => {
		await page.getByRole("textbox", { name: "Email" }).fill(VALID_EMAIL);
		await page.getByRole("textbox", { name: "Password" }).fill("");
		await expect(signInButton).toBeDisabled();
	});
});

/* -------------------- INVALID EMAIL FORMATS -------------------- */
const invalidEmails: string[] = [
	"test@",
	"@gmail.com",
	"testgmail.com",
	"test@gmail..com",
	"test@@gmail.com",
	"test@gmail...com",
	".test@gmail.com",
];

for (const email of invalidEmails) {
	test(`Login with invalid email: ${email}`, async ({ page }) => {
		await test.step(`Enter invalid email: ${email}`, async () => {
			await page.getByRole("textbox", { name: "Email" }).fill(email);
			await page.getByRole("textbox", { name: "Password" }).fill(INVALID_PASSWORD);
		});

		await test.step("Verify Sign In button is disabled", async () => {
			await expect(page.getByRole("button", { name: "Sign In" })).toBeDisabled();
		});
	});
}

test("verify login with otp", async ({ page }) => {
	await page.getByRole("link", { name: "Sign In with OTP" }).click();
	await page.getByRole("textbox", { name: "Email Address" }).click();
	await page.getByRole("textbox", { name: "Email Address" }).fill("bylddtestv1@gmail.com");
	await page.getByTestId("send-otp-button").click();
	await page.getByTestId("input-otp").click();
	await page.getByTestId("input-otp").fill("1234");
	await page.getByRole("button", { name: "Sign In" }).click();
	await expect(page.getByRole("heading", { name: "User Growth and Activity" })).toBeVisible();
});
