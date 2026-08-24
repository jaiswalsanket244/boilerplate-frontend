import { test, expect, Page } from "@playwright/test";

/* -------------------- Before Each -------------------- */

test.beforeEach(async ({ page }: { page: Page }) => {
	await page.goto("https://boilerplate.byldd.com/signin");

	const loginEmail = "vaishnavim2k22@gmail.com";
	const loginPassword = "Vaishnavi@1706";
	await page.getByRole("textbox", { name: "Email" }).fill(loginEmail);

	await page.getByRole("textbox", { name: "Password" }).fill(loginPassword);

	await page.getByTestId("signin-btn").click();

	await page.getByTestId("sidebar-menu-item-products").click();
});

test("POSITIVE TEST - Add Product Scenarios", async ({ page }: { page: Page }) => {
	await test.step("Add product with only mandatory fields", async () => {
		await page.getByTestId("add-product-button").click();
		await expect(page.getByRole("heading", { name: "Create Product" })).toBeVisible();

		await page.getByTestId("title-input").fill("Test Product Mandatory");
		await page.getByTestId("description-input").fill("This is test product description");
		await page.getByTestId("price-input").fill("1000");

		await page.getByTestId("submit-button").click();
		await expect(
			page.getByTestId("product-title").getByText("Test Product Mandatory", { exact: true }).first()
		).toBeVisible();
	});

	await test.step("verify - add product with all fields", async () => {
		await page.getByTestId("add-product-button").click();
		await expect(page.getByRole("heading", { name: "Create Product" })).toBeVisible();
		await page.getByTestId("title-input").fill("Test Product All Fields");
		await page.getByTestId("description-input").fill("This is test product description");
		await page.getByTestId("price-input").fill("1000");
		await page.getByTestId("cost-price-input").fill("800");
		await page.getByTestId("retail-price-input").fill("1200");
		await page.getByTestId("sale-price-input").fill("900");
		await page.getByTestId("submit-button").click();
		await expect(
			page.getByTestId("product-title").getByText("Test Product All Fields", { exact: true }).first()
		).toBeVisible();
	});

	await test.step("verify - cancel adding product btn", async () => {
		await page.getByTestId("add-product-button").click();

		await page.getByRole("button", { name: "Cancel" }).click();

		await expect(page).toHaveURL(/products/);
	});

	await test.step("verify - add product without title", async () => {
		await page.getByTestId("add-product-button").click();
		await expect(page.getByRole("heading", { name: "Create Product" })).toBeVisible();

		await page.getByTestId("description-input").fill("This is test product description");
		await page.getByTestId("price-input").fill("1000");

		await page.getByTestId("submit-button").click();
		await expect(page.getByTestId("title-field-error-icon")).toBeVisible();
		await page.getByRole("button", { name: "Cancel" }).click();
	});

	await test.step("verify - add product without description", async () => {
		await page.getByTestId("add-product-button").click();
		await expect(page.getByRole("heading", { name: "Create Product" })).toBeVisible();
		await page.getByTestId("title-input").fill("Product-11");
		await page.getByTestId("price-input").fill("1000");

		await page.getByTestId("submit-button").click();
		await expect(page.getByTestId("description-field-error-icon")).toBeVisible();
		await page.getByTestId("cancel-button").click();
	});
	await test.step("verify - add product without price", async () => {
		await page.getByTestId("add-product-button").click();

		await expect(page.getByRole("heading", { name: "Create Product" })).toBeVisible();

		await page.getByTestId("title-input").fill("qqqqqqqqq");
		await page.getByTestId("description-input").click();
		await page.getByTestId("description-input").fill("This is test product description");

		await page.getByTestId("submit-button").click();
		await expect(page.getByTestId("price-field-error-icon")).toBeVisible();
	});

	//Code will uncomment after gubs fixes.

	// await test.step('verify - add product with decimal value in price field', async () => {
	//   await page.getByTestId('add-product-button').click();
	//   await expect(page.getByRole('heading', { name: 'Create Product' })).toBeVisible();

	//   await page.getByTestId('title-input').fill('PRODUCT');
	//   await page.getByTestId('description-input').fill('This is test product description');
	//   await page.getByTestId('price-input').fill('1.2000');

	//   await page.getByTestId('submit-button').click();
	//   await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();
	// });
});
// test('add products - negative scenario' ,async ({ page }:{page:Page}) => {

//   await test.step('verify - add product with special characters in title', async () => {
//     await page.getByTestId('add-product-button').click();
//     await expect(page.getByRole('heading', { name: 'Create Product' })).toBeVisible();

//     await page.getByTestId('title-input').fill('@#$%&Test Product1');
//     await page.getByTestId('description-input').fill('This is test product description');
//     await page.getByTestId('price-input').fill('1000');

//     await page.getByTestId('submit-button').click();
//     await expect(page.locator("Special character in title not allow")).toBeVisible();
//   });

//    await test.step('verify - add product with negative price value', async () => {
//    await page.getByTestId('add-product-button').click();
//     await expect(page.getByRole('heading', { name: 'Create Product' })).toBeVisible();

//     await page.getByTestId('title-input').fill('Test Product1');
//     await page.getByTestId('description-input').fill('This is test product description');
//     await page.getByTestId('price-input').fill('-1000');

//     await page.getByTestId('submit-button').click();
//     await expect(page.getByText('Price must be a positive number')).toBeVisible();
//   });
//

//  await test.step('verify - add product with zero price value', async () => {
//     await page.getByTestId('add-product-button').click();
//     await expect(page.getByRole('heading', { name: 'Create Product' })).toBeVisible();

//     await page.getByTestId('title-input').fill('Test Product1');
//     await page.getByTestId('description-input').fill('This is test product description');
//     await page.getByTestId('price-input').fill('000');

//     await page.getByTestId('submit-button').click();
//     await expect(page.getByText('Price must be a positive number')).toBeVisible();
//   });
// await test.step('Invalid: cost price > sale & retail price', async () => {
//    await page.getByTestId('add-product-button').click();
//     await expect(page.getByRole('heading', { name: 'Create Product' })).toBeVisible();

//     await page.getByTestId('title-input').fill('Test Product1');
//     await page.getByTestId('description-input').fill('This is test product description');
//     await page.getByTestId('price-input').fill('100');
//     await page.getByTestId('cost-price-input').fill('800');
//     await page.getByTestId('retail-price-input').fill('100');
//     await page.getByTestId('sale-price-input').fill('100');

//     await page.getByTestId('submit-button').click();
//     await expect(page.locator("cost price, is more than sale and retail price not allowd")).toBeVisible();
//   });

// await test.step('Add product only space  in title , description', async () => {
//    await page.getByTestId('add-product-button').click();

//     await page.getByTestId('title-input').fill('    ');
//     await page.getByTestId('description-input').fill('   ');
//     await page.getByTestId('price-input').fill('100');

//     await page.getByTestId('submit-button').click();
//     await expect(page.locator("only space in title and description not allowed")).toBeVisible();
//   });

// await test.step('verify - Add product with emoji in title', async () => {
//   await page.getByTestId('add-product-button').click();

//     await page.getByTestId('title-input').fill('Mobile 📱');
//     await page.getByTestId('description-input').fill('Desc');
//     await page.getByTestId('price-input').fill('100');

//     await page.getByTestId('submit-button').click();
//     await expect(page.locator("emoji are not allow in title field")).toBeVisible();
//   });

// await test.step('verify - duplicate products should not allow', async () => {
//     await page.getByTestId('add-product-button').click();
//     await page.getByTestId('title-input').fill('Mobile 📱');
//     await page.getByTestId('description-input').fill('Desc');
//     await page.getByTestId('price-input').fill('100');

//     await page.getByTestId('submit-button').click();
//     await expect(page.locator("Duplicate product should not allowed")).toBeVisible();
//   });

// });

test(" edit products ", async ({ page }: { page: Page }) => {
	await test.step("verify - edit product valid Title update", async () => {
		const productRow = page.locator("tr", { hasText: "Updated Test Product Title" }).first();

		const editButton = page.locator('[data-testid^="edit-button-"]').first();
		await editButton.click();
		await page.getByTestId("title-input").fill("Updated Test Product Title");
		await page.getByTestId("cost-price-input").fill("900");
		await page.getByTestId("retail-price-input").fill("1300");
		await page.getByTestId("sale-price-input").fill("950");
		await page.getByTestId("submit-button").click();

		await expect(page.getByRole("heading", { name: "Products" })).toBeVisible();
	});

	await test.step("verify - edit product valid description update", async () => {
		const productRow = page.locator("tr", { hasText: "Updated Test Product Title" }).first();

		const editButton = productRow.locator('[data-testid^="edit-button-"]');
		await editButton.first().click();

		await page.getByTestId("description-input").fill("Updated product description");

		await page.getByTestId("cost-price-input").fill("900");
		await page.getByTestId("retail-price-input").fill("1300");
		await page.getByTestId("sale-price-input").fill("950");

		await page.getByTestId("submit-button").click();

		await expect(page.getByRole("heading", { name: "Products" })).toBeVisible({ timeout: 10000 });
	});

	await test.step("verify - edit product valid price ", async () => {
		const productRow1 = page.locator("tr", { hasText: "Updated Test Product Title" }).first();

		const editButton = productRow1.locator('[data-testid^="edit-button-"]');
		await editButton.first().click();
		await expect(page.getByTestId("price-input")).toBeVisible({ timeout: 5000 });
		await page.getByTestId("price-input").fill("1500");
		await page.getByTestId("cost-price-input").fill("1000");
		await page.getByTestId("retail-price-input").fill("1600");
		await page.getByTestId("sale-price-input").fill("1200");

		await page.getByRole("button", { name: "Submit" }).click();
		await expect(page.getByRole("heading", { name: "Products" })).toBeVisible({ timeout: 10000 });
	});

	await test.step("verify - edit product without title", async () => {
		const productRow2 = page.locator("tr", { hasText: "Test Product All Fields" }).first();
		const editButton = productRow2.locator('[data-testid^="edit-button-"]').first();
		await editButton.click();
		await expect(page.getByTestId("price-input")).toBeVisible({ timeout: 5000 });
		await page.getByTestId("title-input").fill("");
		await page.getByTestId("cost-price-input").fill("1000");
		await page.getByTestId("retail-price-input").fill("1600");
		await page.getByTestId("sale-price-input").fill("1200");
		await page.getByRole("button", { name: "Submit" }).click();
		await expect(page.getByTestId("title-field-error-icon")).toBeVisible();
		await page.getByTestId("cancel-button").click();
	});

	await test.step("verify - edit product without description", async () => {
		const productRow3 = page.locator("tr", { hasText: "Updated Test Product Title" }).first();
		const editButton = productRow3.locator('[data-testid^="edit-button-"]');
		await editButton.first().click();
		await page.getByTestId("description-input").fill("");
		await page.getByTestId("cost-price-input").fill("1000");
		await page.getByTestId("retail-price-input").fill("1600");
		await page.getByTestId("sale-price-input").fill("1200");

		await page.getByRole("button", { name: "Submit" }).click();
		await expect(page.getByTestId("description-field-error-icon")).toBeVisible();
		await page.getByTestId("cancel-button").click();
	});

	await test.step("verify - edit product without price", async () => {
		const productRow4 = page.locator("tr", { hasText: "Updated Test Product Title" }).first();
		const editButton = productRow4.locator('[data-testid^="edit-button-"]');
		await editButton.first().click();
		await expect(page.getByTestId("price-input")).toBeVisible({ timeout: 5000 });
		await page.getByTestId("price-input").fill("");
		await page.getByTestId("cost-price-input").fill("1000");
		await page.getByTestId("retail-price-input").fill("1600");
		await page.getByTestId("sale-price-input").fill("1200");
		await page.getByRole("button", { name: "Submit" }).click();
		await expect(page.getByTestId("price-field-error-icon")).toBeVisible();
		await page.getByTestId("cancel-button").click();
	});

	await test.step("verify - cancle edit btn", async () => {
		const productRow5 = page.locator("tbody  tr", { hasText: "Updated Test Product Title" }).first();
		const editButton = productRow5.locator('[data-testid^="edit-button-"]');
		await editButton.first().click();
		await page.getByTestId("cancel-button").click();
		await expect(page.getByRole("heading", { name: "Products" })).toBeVisible({ timeout: 60000 });
	});

	/*  Below code will uncomment when bug fix.

	 await test.step('edit product - decimal value in price', async () => {

		await page.getByTestId('description-input').fill('This is test product description');
		await page.getByTestId('price-input').fill('1.2000');
		await page.getByRole('button', { name: 'Submit' }).click();

	  });

	await test.step('edit prodcut - Negative price', async () => {
	 const productRow = page.locator('tr', { hasText: 'Updated Test Product Title' }).first(); 
	 const editButton = productRow.locator('[data-testid^="edit-button-"]');
	   await editButton.first().click();
	  await expect(page.getByTestId('price-input')).toBeVisible({ timeout: 5000 });
	  await page.getByTestId('price-input').fill('-1500');
	  await page.getByTestId('cost-price-input').fill('1000');
	  await page.getByTestId('retail-price-input').fill('1600');
	  await page.getByTestId('sale-price-input').fill('1200');
	  await page.getByRole('button', { name: 'Submit' }).click();
	  await expect(page.locator("negative price is not allow")).toBeVisible({ timeout: 10000 });
	}
	await test.step('edit product - zero price', async () => {
	const productRow = page.locator('tr', { hasText: 'Updated Test Product Title' }).first();
	 const editButton = productRow.locator('[data-testid^="edit-button-"]');
	  await editButton.first().click();
	  await expect(page.getByTestId('price-input')).toBeVisible({ timeout: 5000 });
	  await page.getByTestId('price-input').fill('0');
	  await page.getByTestId('cost-price-input').fill('1000');
	  await page.getByTestId('retail-price-input').fill('1600');
	  await page.getByTestId('sale-price-input').fill('1200');
  
	  await page.getByRole('button', { name: 'Submit' }).click();
	  await expect(page.locator("price must be greater than zero")).toBeVisible({ timeout: 10000 });
	});
	await test.step('edit product - special characters in title', async () => {
  
	});
	await test.step('edit product - cost price > sale & retail price', async () => {
	  const productRow = page.locator('tr', { hasText: 'Updated Test Product Title' }).first();
	  const editButton = productRow.locator('[data-testid^="edit-button-"]');
	  await editButton.first().click();
	  await expect(page.getByTestId('price-input')).toBeVisible({ timeout: 5000 });
	  await page.getByTestId('price-input').fill('1500');
	  await page.getByTestId('cost-price-input').fill('1000');
	  await page.getByTestId('retail-price-input').fill('600');
	  await page.getByTestId('sale-price-input').fill('1200');
	  await page.getByRole('button', { name: 'Submit' }).click();
	  await expect(page.locator("cost price must be less than retail and sale price")).toBeVisible({ timeout: 10000 });
	});
    
	 await test.step('edit product- enter decimal value in price field', async () => {
	 const productRow = page.locator('tr', { hasText: 'Updated Test Product Title' }).first();
	 const editButton = productRow.locator('[data-testid^="edit-button-"]');
	  await editButton.first().click();
	  await expect(page.getByTestId('price-input')).toBeVisible({ timeout: 5000 });
	  await page.getByTestId('price-input').fill('1500.5');
	  await page.getByTestId('cost-price-input').fill('1000');
	  await page.getByTestId('retail-price-input').fill('1600');
	  await page.getByTestId('sale-price-input').fill('1200');
	  await page.getByRole('button', { name: 'Submit' }).click();
	  await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible({ timeout: 10000 });

  });
  */
});

test("verify - delete product ", async ({ page }: { page: Page }) => {
	await page.getByTestId("add-product-button").click();
	await expect(page.getByRole("heading", { name: "Create Product" })).toBeVisible();

	await page.getByTestId("title-input").fill("Add then delete products");
	await page.getByTestId("description-input").fill("This is test product description");
	await page.getByTestId("price-input").fill("1000");

	await page.getByRole("button", { name: "Submit" }).click();

	const productName = "Add then delete products";
	const productRow = page.locator('[data-testid^="product-row-"]').filter({ hasText: productName }).first();
	await expect(productRow).toBeVisible();
	await productRow.locator('[data-testid^="delete-button-"]').click();
	await page.getByRole("button", { name: "Confirm" }).click();
	await expect(page.getByRole("heading", { name: "Products" })).toBeVisible({ timeout: 10000 });
	await page.getByRole("textbox", { name: "Search products here" }).fill("Add then delete products");
	await expect(page.getByText("No Data", { exact: true })).toBeVisible();
});

test("Search ", async ({ page }: { page: Page }) => {
	await test.step("verify - search with full name of product", async () => {
		await page.getByTestId("search-box").fill("Updated Test Product Title");
		await expect(
			page.locator('[data-testid^="product-row-"]').filter({ hasText: "Updated Test Product Title" }).first()
		).toBeVisible();
	});

	await test.step("verify - search partial name", async () => {
		await page.getByRole("textbox", { name: "Search products here" }).fill("Updated Test");
		await expect(
			page.locator('[data-testid^="product-row-"]').filter({ hasText: "Updated Test Product Title" }).first()
		).toBeVisible();
	});

	await test.step("verify - empty search box", async () => {
		await page.getByRole("textbox", { name: "Search products here" }).fill("           ");
		await expect(page.getByText("No Data", { exact: true })).toBeVisible();
	});
});
