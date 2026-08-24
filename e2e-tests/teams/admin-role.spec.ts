import { test, expect, Page } from "@playwright/test";
import path from "path";

test.beforeEach("login ", async ({ page }) => {
	await page.goto("https://boilerplate.byldd.com/signin");
	await test.step("Login with valid credentials", async () => {
		await page.getByRole("textbox", { name: "Email" }).fill("vaishnavim2k22@gmail.com");
		await page.getByRole("textbox", { name: "Password" }).fill("Vaishnavi@1706");
		await page.getByRole("button", { name: "Sign In" }).click();
	});
});

//Below update with assertion with UI Validation - when brwser validation removed and custom validation added
test("Invite User - Email validation", async ({ page }) => {
	const emails: { value: string; valid: boolean }[] = [
		{ value: "invalid-email", valid: false },
		{ value: "bylddtest5@gmail.com", valid: true },
		{ value: "11111", valid: false },
		{ value: "usergmail", valid: false },
		{ value: "person.name@sub.domain.com", valid: true },
		{ value: "user@gmail..com", valid: false },
		{ value: "username@gmail.,,com", valid: false },
		//{ value: ' ', valid: false }, uncomment when validation add for this input
		{ value: "user$$$$@.gamil.com", valid: false },
		{ value: "@gmail.com", valid: false },
		{ value: "user@@@@@gmail.com", valid: false },
		//{ value: "-++++user@mgail.com", valid: false },
	];

	for (const emailData of emails) {
		await page.getByRole("link", { name: "Teams" }).click();
		const inviteBtn = page.getByRole("button", { name: "Invite User(s)" });
		await inviteBtn.first().click();

		const emailInput = page.getByTestId("email-input-1");

		const firstName = page.getByTestId("first-name-input-1");
		const lastName = page.getByTestId("last-name-input-1");

		await emailInput.fill(emailData.value);
		await firstName.fill(`user${Date.now()}@gmail.com`);
		await lastName.fill("User");
		await page.getByRole("button", { name: "Invite User(s)" }).click();

		if (!emailData.valid) {
			const isValid = await emailInput.evaluate((el) => (el as HTMLInputElement).checkValidity());
			expect(isValid).toBe(false);

			await page.getByRole("button", { name: "Cancel" }).click();
		} else {
			await expect(page.getByRole("heading", { name: "Invitation(s) Sent Successfully!" })).toBeVisible({
				timeout: 10000,
			});
			await page.getByRole("button", { name: "Close" }).click();
			await page.getByRole("tab", { name: "Invited " }).click();
			await page.getByTestId("table-row-0").getByText(`user${Date.now()}@gmail.com`, { exact: true });
		}
	}
});
test("Sent invite by excel file ", async ({ page }) => {
	await page.getByTestId("sidebar-menu-item-teams").click();
	await page.getByRole("button", { name: "Invite User(s)" }).click();
	await page.getByRole("tab", { name: "Import from Excel" }).click();
	const uploadFilePath = path.join(process.cwd(), "e2e-tests/teams/team-invite-file-format.xlsx");
	await page.locator('input[type="file"]').setInputFiles(uploadFilePath);
	await page.getByRole("dialog").getByRole("button", { name: "Invite User(s)" }).click();
	await expect(page.getByRole("heading", { name: "Invitation(s) Sent Successfully!" })).toBeVisible();
	await page.getByRole("button", { name: "Close" }).click();
	await page.getByRole("tab", { name: "Invited " }).click();
	await page.getByTestId("table-row-0").getByText("Raj Kumar", { exact: true });
});

test("sort and filter btn", async ({ page }) => {
	await test.step("filter-admin", async () => {
		await page.getByRole("link", { name: "Teams" }).click();
		await page.getByTestId("filter-control-trigger").click();
		await page.getByRole("checkbox", { name: "ADMIN" }).click();
		await page.getByRole("button", { name: "Apply Filters" }).click();
		await expect(page.getByText("ADMIN", { exact: true })).toBeVisible();
	});
	//will uncomment when bug fixes
	// await test.step("filter-user", async () => {
	// 	await page.getByRole("link", { name: "Teams" }).click();
	// 	await page.getByTestId('filter-control-trigger').click();
	// 	await page.locator("#roles-USER").click();
	// 	await page.getByRole("button", { name: "Apply Filters" }).click();

	// 	await expect(page.getByTestId('table-row-0').getByText('USER', { exact: true })).toBeVisible();
	// });
});

test("verify - actions feature", async ({ page }) => {
	//Below code will uncomment when view details feature fixed with add edit btn for admin role and , no need of remove user btn.

	// await test.step("verify - veiw details feature", async () => {
	// 	await test.step("Open Sign In page", async () => {
	// 		await page.goto("https://boilerplate.byldd.com");
	// 	});

	// 	await test.step("Login with valid credentials", async () => {
	// 		await page.getByRole("textbox", { name: "Email" }).fill("bylddtestv6@gmail.com");
	// 		await page.getByRole("textbox", { name: "Password" }).fill("Vaishnavi@1706");
	// 		await page.getByRole("button", { name: "Sign In" }).click();
	// 	});

	// 	await page.getByRole("link", { name: "Teams" }).click();
	// 	await page.getByTestId("table-row-0").getByRole("button", { name: "Open menu" }).click();
	// 	await page.getByTestId("view-details-menu-item").click();
	// 	await expect(page).toHaveURL(/\/admin\/user-details\/[a-f0-9]{24}$/);
	// 	await page.getByRole("button", { name: "Remove User" }).click();
	// 	await expect(page.getByText("DELETED", { exact: true })).toBeVisible();
	// 	await page.getByRole("button", { name: "Mark as Active" }).click();
	// 	await expect(page.getByText("ACTIVE", { exact: true })).toBeVisible();
	// 	await page.getByRole("button", { name: "Sign Out" }).click();
	// });

	await test.step("verify - set user as in-active", async () => {
		await page.getByTestId("sidebar-menu-item-teams").click();
		//set user as in-active

		await page.getByTestId("table-row-1").getByTestId("action-cell-button").click();
		await page.getByRole("menu").getByTestId("change-status-menu-item").click();
		await expect(page.getByText("INACTIVE", { exact: true })).toBeVisible();
		await page.locator('button:has-text("In-active ")').click();
		await expect(page.getByText("INACTIVE", { exact: true })).toBeVisible();

		//sigh out and try to  login as in-active user
		await page.getByRole("button", { name: "Sign Out" }).click();
		await page.getByRole("textbox", { name: "Email" }).click();
		await page.getByRole("textbox", { name: "Email" }).fill("kalpeshpatil9766@gmail.com");
		await page.getByRole("textbox", { name: "Password" }).click();
		await page.getByRole("textbox", { name: "Password" }).fill("Vaishnavi@1706");
		await page.getByTestId("signin-btn").click();
		await expect(page.getByText("Your account is disabled")).toBeVisible();

		//login as admin and activate user
		await page.getByRole("textbox", { name: "Email" }).fill("");
		await page.getByRole("textbox", { name: "Email" }).fill("vaishnavim2k22@gmail.com");
		await page.getByRole("textbox", { name: "Password" }).fill("");
		await page.getByRole("textbox", { name: "Password" }).fill("Vaishnavi@1706");
		await page.getByTestId("signin-btn").click();

		//activate user
		await page.getByTestId("sidebar-menu-item-teams").click();
		await expect(page.getByText("INACTIVE")).toBeVisible();
		await page.getByTestId("table-row-1").getByTestId("action-cell-button").click();
		await page.getByRole("menu").getByTestId("activate-user-menu-item").click();
		await expect(page.getByTestId("table-row-1").getByText("ACTIVE")).toBeVisible();

		//sigh out and try to  login as activated user
		await page.getByRole("button", { name: "Sign Out" }).click();
		await page.getByRole("textbox", { name: "Email" }).click();
		await page.getByRole("textbox", { name: "Email" }).fill("kalpeshpatil9766@gmail.com");
		await page.getByRole("textbox", { name: "Password" }).click();
		await page.getByRole("textbox", { name: "Password" }).fill("Vaishnavi@1706");
		await page.getByTestId("signin-btn").click();
		await expect(page.getByRole("heading", { name: "This is User dashboard" })).toBeVisible();
	});

	/*
//Below code will be uncomment when issue fixed in change role feature(remove change role functionality )
	below code will uncomment when change role can be reverse again to original role
		await test.step('verify - change role feature', async () => {
			//create new account for changing role - when admin clikcs on change role
			await page.goto("https://boilerplate.byldd.com/signin");
			await page.getByRole('link', { name: 'Sign Up' }).click();
			await page.getByRole('textbox', { name: 'First Name' }).click();
			await page.getByRole('textbox', { name: 'First Name' }).fill('vaishnavi');
			await page.getByRole('textbox', { name: 'Last Name' }).click();
			await page.getByRole('textbox', { name: 'Last Name' }).fill('mahajan');
			await page.getByRole('textbox', { name: 'Email' }).click();
			const email = `bylddtest${Date.now()}@gmail.com`;
			await page.getByRole('textbox', { name: 'Email' }).fill(email);
			await page.getByTestId('signup-button').click();
			await page.getByTestId('input-otp').click();
			await page.getByTestId('input-otp').fill('1234');
			await page.getByRole('button', { name: 'Verify Email' }).click();
			await page.getByRole('textbox', { name: 'Password', exact: true }).fill('Vaishnavi@1706');
			await page.getByRole('textbox', { name: 'Confirm Password' }).fill('Vaishnavi@1706');
			await page.getByRole('button', { name: 'Finish Sign Up' }).click();
			await expect(page.getByRole('heading', { name: 'User Growth and Activity' })).toBeVisible();
			await page.getByTestId('sidebar-menu-item-teams').click();
			await page.getByTestId('action-cell-button').click();
			await page.getByTestId('change-role-menu-item').click();
			await page.getByRole('button', { name: 'Sign Out' }).click();

			//login as user beacuse role is changed 	
			await page.getByRole('textbox', { name: 'Email' }).click();
			await page.getByRole('textbox', { name: 'Email' }).fill(email);
			await page.getByRole('textbox', { name: 'Password' }).click();
			await page.getByRole('textbox', { name: 'Password' }).fill('Vaishnavi@1706');
			await page.getByTestId('signin-btn').click();
			await expect(page.getByRole('heading', { name: 'This is User dashboard' })).toBeVisible();
		});

*/
	//uncomment when functionality added
	// await test.step('verify- impersonate user feature', async () => {
	// 	await page.goto("https://boilerplate.byldd.com/signin");
	// 	await page.getByRole('textbox', { name: 'Email' }).click();
	// 	await page.getByRole('textbox', { name: 'Email' }).fill(' bylddtestv11@gmail.com');
	// 	await page.getByRole('textbox', { name: 'Password' }).click();
	// 	await page.getByRole('textbox', { name: 'Password' }).fill('Vaishnavi@1706');
	// 	await page.getByTestId('signin-btn').click();
	// 	await page.getByTestId('sidebar-menu-item-teams').click();
	//     await page.getByTestId('action-cell-button').click();
	//     await page.getByTestId('impersonate-user-menu-item').click();
	// });
});
