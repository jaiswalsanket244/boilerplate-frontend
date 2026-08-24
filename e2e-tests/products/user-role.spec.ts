import { test, expect, Page, Locator } from "@playwright/test";

/* -------------------- Before Each -------------------- */

test.beforeEach("test", async ({ page }: { page: Page }) => {
	await page.goto("https://boilerplate.byldd.com/signin");

	const loginEmail = "productpage97@gmail.com";
	const loginPassword = "Vaishnavi@1706";
	await page.getByRole("textbox", { name: "Email" }).fill(loginEmail);

	await page.getByRole("textbox", { name: "Password" }).fill(loginPassword);

	await page.getByTestId("signin-btn").click();

	await page.getByTestId("sidebar-menu-item-products").click();
});

test("Search products ", async ({ page }: { page: Page }) => {
	const searchBox: Locator = page.getByTestId("search-box");
	const productTitle: Locator = page.getByTestId("product-title");

	const expectProductVisible = async (text: string): Promise<void> => {
		await expect(productTitle.getByText(text, { exact: false })).toBeVisible();
	};
	await searchBox.fill("");

	await searchBox.fill("11");
	await expectProductVisible("Product-11");

	await searchBox.fill("");
	await searchBox.fill("        ");
	await expect(page.getByText("No Data", { exact: true })).toBeVisible();

	await searchBox.fill("");
	await searchBox.fill("random products name ");
	await expect(page.getByText("No Data", { exact: true })).toBeVisible();
});
