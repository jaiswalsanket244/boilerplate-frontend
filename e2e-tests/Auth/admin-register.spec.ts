import { test, expect, Page } from "@playwright/test";

/* -------------------- Hooks -------------------- */

test.beforeEach(async ({ page }: { page: Page }) => {
	await page.goto("https://boilerplate.byldd.com/signin");
	await page.getByRole("link", { name: "Sign Up" }).click();
});

/* -------------------- Positive Test -------------------- */

test("Register with valid data", async ({ page }: { page: Page }) => {
	const email: string = `user${Date.now()}@test.com`;

	await test.step("Mock OTP request API", async () => {
		await page.route("**/api/auth/signup/otp/request", async (route) => {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({ otp: "1234", message: "OTP sent" }),
			});
		});
	});

	await test.step("Mock OTP verification API", async () => {
		await page.route("**/api/auth/signup/otp/verify", async (route) => {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({
					success: true,
					message: "OTP verified successfully",
				}),
			});
		});
	});

	await page.getByRole("textbox", { name: "First Name" }).fill("Vaishnavi");
	await page.getByRole("textbox", { name: "Last Name" }).fill("Mahajan");
	await page.getByRole("textbox", { name: "Email" }).fill(email);

	await page.getByRole("button", { name: "Verify Email" }).click();
	await page.getByTestId("input-otp").fill("1234");
	await page.getByRole("button", { name: "Verify Email" }).click();

	await page.locator("#password").fill("Vaishnavi@1234");
	await page.locator("#confirmPassword").fill("Vaishnavi@1234");
	await page.getByRole("button", { name: "Finish Sign Up" }).click();
});

/* -------------------- First Name Validations -------------------- */

test("Verify first name is mandatory", async ({ page }: { page: Page }) => {
	await page.getByLabel("First Name").fill("");
	await page.getByLabel("Last Name").fill("Test");
	await page.getByLabel("Email").fill("test@mail.com");

	await expect(page.getByTestId("signup-button")).toBeDisabled();
});

/*
test('Verify first name does not allow numbers', async ({ page }: { page: Page }) => {
  await page.getByLabel('First Name').fill('12345');
  await page.getByLabel('Last Name').fill('Test');
  await page.getByLabel('Email').fill('test@mail.com');

  await expect(
    page.getByRole('button', { name: 'Verify Email' })).toBeDisabled();

  await expect(
    page.getByText('First name should not contain numbers')
  ).toBeVisible();
});

test('Verify first name does not allow special characters', async ({ page }: { page: Page }) => {
  await page.getByLabel('First Name').fill('@#$%vaishnavi');
  await page.getByLabel('Last Name').fill('Test');
  await page.getByLabel('Email').fill('test@mail.com');

  await expect(
    page.getByRole('button', { name: 'Verify Email' })
  ).toBeDisabled();

  await expect(
    page.getByText('First name should not contain special characters')
  ).toBeVisible();
});

test('Verify first name does not allow spaces', async ({ page }: { page: Page }) => {
  await page.getByLabel('First Name').fill('   ');
  await page.getByLabel('Last Name').fill('Test');
  await page.getByLabel('Email').fill('test@mail.com');

  await expect(
    page.getByRole('button', { name: 'Verify Email' })
  ).toBeDisabled();

  await expect(
    page.getByText('First name cannot be empty or spaces')
  ).toBeVisible();
});


test('Verify last name minimum length not allowed', async ({ page }: { page: Page }) => {
  const firstName = page.getByRole('textbox', { name: 'First Name' });
  const lastName = page.getByRole('textbox', { name: 'Last Name' });
  const email = page.getByRole('textbox', { name: 'Email' });
  const button = page.getByRole('button', { name: 'Verify Email' });

  await firstName.fill('John');
  await email.fill('john@gmail.com');
  await lastName.fill('A');

  await expect(button).toBeDisabled();
});

test('Verify last name maximum length not allowed', async ({ page }: { page: Page }) => {
  await page.getByLabel('First Name').fill('Test');
  await page
    .getByLabel('Last Name')
    .fill('ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZ');
  await page.getByLabel('Email').fill('test@mail.com');

  await expect(
    page.getByRole('button', { name: 'Verify Email' })
  ).toBeDisabled();
});
*/
/* -------------------- Email Validations -------------------- */

test("Verify invalid email formats are not allowed", async ({ page }: { page: Page }) => {
	const emailField = page.getByRole("textbox", { name: "Email" });
	const button = page.getByRole("button", { name: "Verify Email" });

	await page.getByLabel("First Name").fill("Vaishnavi");
	await page.getByLabel("Last Name").fill("Mahajan");

	const invalidEmails: string[] = [
		"test@",
		"@gmail.com",
		"testgmail.com",
		"test@com",
		"test@@gmail.com",
		"test@gmail..com",
		".test@gmail.com",
		"test.@gmail.com",
		"test#gmail.com",
		"test@gmail!.com",
		"test@gmail,com",
	];

	for (const email of invalidEmails) {
		await emailField.fill(email);
		await expect(button).toBeDisabled();
	}
});

/* -------------------- Duplicate Email -------------------- */

test("Verify duplicate email is not allowed", async ({ page }: { page: Page }) => {
	await page.getByLabel("First Name").fill("Vaishnavi");
	await page.getByLabel("Last Name").fill("Mahajan");
	await page.getByLabel("Email").fill("vaishnavi@byldd.com");

	await page.getByRole("button", { name: "Verify Email" }).click();

	await expect(page.getByText("User already exists with this email", { exact: true })).toBeVisible();
});
