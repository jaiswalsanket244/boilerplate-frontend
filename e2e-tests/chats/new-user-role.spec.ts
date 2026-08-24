import { test, expect, Page } from "@playwright/test";
import path from "path";
import { waitFor } from "@testing-library/react";
import { wait } from "@testing-library/user-event/dist/cjs/utils/index.js";

test.beforeEach("login user", async ({ page }: { page: Page }) => {
	await page.goto("https://boilerplate.byldd.com/signin");
	await page.getByRole("textbox", { name: "Email" }).click();
	await page.getByRole("textbox", { name: "Email" }).fill("mahajanvaishnavi1706@gmail.com");
	await page.getByRole("textbox", { name: "Password" }).click();
	await page.getByRole("textbox", { name: "Password" }).fill("Vaishnavi@1706");
	await page.getByTestId("signin-btn").click();
	await page.getByRole("link", { name: "Chat" }).click();
});

test("verify- user can create chat with one ", async ({ page }: { page: Page }) => {
	await test.step("User-create chat ", async () => {
		await page.getByTestId("create-channel-trigger").click();
		await page.getByTestId("create-direct-chat").click();
		await page.getByRole("textbox", { name: "Search users by name..." }).click();
		await page.getByRole("textbox", { name: "Search users by name..." }).fill("Cora Gallegos");
		await page.getByRole("textbox", { name: "Search users by name..." }).press("Enter");
		const dialog = page.getByRole("dialog");
		await dialog.locator('p:has-text("Cora Gallegos")').click();
		await page.getByTestId("channel-cora-gallegos").first().click();
		await page.getByRole("textbox", { name: "Type a message..." }).click();
		await page.getByTestId("chat-message-input").click();
		await page.getByTestId("chat-message-input").fill("hi Cora Gallegos");
		await page.getByTestId("send-message-button").click();
		await expect(page.getByText("hi Cora Gallegos", { exact: true }).last()).toBeVisible();

		// Edit message
		await page.getByTestId("edit-message-button").last().click();
		const msg = `Test message ${Date.now()}`;
		await page.getByRole("textbox", { name: "Message Content" }).fill(msg + "Upadated message neww");
		await page.getByRole("button", { name: "Save Changes" }).click();
		await expect(
			page
				.getByTestId("message-text-inner-wrapper")
				.getByText(msg + "Upadated message neww")
				.last()
		).toBeVisible();

		//Cancle Edit msg
		await page.getByTestId("edit-message-button").last().click();
		await page.getByRole("button", { name: "Cancel" }).click();

		//copy message
		await page.getByRole("img", { name: "copy" }).first().click();
		await page.getByRole("textbox", { name: "Type a message..." }).click();
		await page.keyboard.press("Control+V");
		await page.getByTestId("send-message-button").click();

		//Delete message
		await page.getByTestId("delete-message-button").last().click();
		await expect(page.getByText("This message was deleted", { exact: true }).last()).toBeVisible();
	});

	await test.step("verify - e2e chat between with group member ", async () => {
		//create group--
		await page.getByTestId("create-channel-trigger").click();
		await page.getByTestId("create-group-chat").click();
		await page.getByRole("textbox", { name: "Group Name" }).click();
		const uniqueName1 = `chat-with-user-e2e-${Date.now()}`;
		await page.getByRole("textbox", { name: "Group Name" }).fill(uniqueName1);
		await page.getByText("Aaisha Vishnoi", { exact: true }).first().click();
		await page.getByRole("textbox", { name: "Search users by name" }).click();
		await page.getByRole("textbox", { name: "Search users by name" }).fill("vaishnavi byldd");
		await page.getByText("vaishnaviByldd mahajan", { exact: true }).first().click();
		await page.getByRole("button", { name: "Create Group" }).click();
		await page
			.getByTestId("channel-" + uniqueName1)
			.first()
			.click();

		//send msg-- to members
		await page.getByRole("textbox", { name: "Type a message..." }).click();
		const msg2 = `Hello Vaishnavi byldd-${Date.now()}`;
		await page.getByTestId("chat-message-input").fill(msg2);
		await page.getByTestId("send-message-button").click();
		await expect(page.getByTestId("message-text-inner-wrapper").getByText(msg2)).toBeVisible();

		//sigh out --
		await page.getByRole("button", { name: "Sign Out" }).click();
		await page.getByRole("textbox", { name: "Email" }).click();
		await page.getByRole("textbox", { name: "Email" }).fill("vaishnavi@byldd.com");
		await page.getByRole("textbox", { name: "Password" }).click();
		await page.getByRole("textbox", { name: "Password" }).fill("Vaishnavi@1706");
		await page.getByTestId("signin-btn").click();
		await page.getByRole("link", { name: "chat Chat" }).click();
		await page.reload({ waitUntil: "load" });
		await page.getByRole("link", { name: "chat Chat" }).click();
		await page.getByRole("heading", { name: "group-with-user-e2e-" }).nth(0).click();

		await page.getByRole("textbox", { name: "Type a message..." }).click();
		const msg3 = `Hello VaishnavuByldd How are you-${Date.now()}`;
		await page.getByTestId("chat-message-input").fill(msg3);
		await page.getByTestId("send-message-button").click();
		await expect(page.getByTestId("message-text-inner-wrapper").getByText(msg3)).toBeVisible();
	});
});
test("verify - Group chat between users", async ({ page }: { page: Page }) => {
	//Create group--
	await test.step("create group ", async () => {
		await page.getByTestId("create-channel-trigger").click();
		await page.getByTestId("create-group-chat").click();
		await page.getByRole("textbox", { name: "Group Name" }).click();
		const uniqueName1 = `group-new-batch${Date.now()}`;
		await page.getByRole("textbox", { name: "Group Name" }).fill(uniqueName1);
		await expect(page.getByText("Add Members", { exact: true })).toBeVisible();
		await page.locator('p:has-text("Abhishek Shinde")').nth(0).click();
		await page.getByRole("textbox", { name: "Search users by name" }).click();
		await page.getByRole("textbox", { name: "Search users by name" }).fill("vaishnavi byldd");
		await page.getByText("vaishnaviByldd mahajan", { exact: true }).first().click();
		await page.getByRole("button", { name: "Create Group" }).click();
		await page
			.getByTestId("channel-" + uniqueName1)
			.first()
			.click();
		await page.getByRole("textbox", { name: "Type a message..." }).click();
		const msg2 = `Hello Vaishnavi byldd-${Date.now()}`;
		await page.getByTestId("chat-message-input").fill(msg2);
		await page.getByTestId("send-message-button").click();
		await expect(page.getByTestId("message-text-inner-wrapper").getByText(msg2)).toBeVisible();

		//group member give reply --

		await page.getByRole("button", { name: "Sign Out" }).click();
		await page.getByRole("textbox", { name: "Email" }).click();
		await page.getByRole("textbox", { name: "Email" }).fill("vaishnavi@byldd.com");
		await page.getByRole("textbox", { name: "Password" }).click();
		await page.getByRole("textbox", { name: "Password" }).fill("Vaishnavi@1706");
		await page.getByTestId("signin-btn").click();
		await page.getByRole("link", { name: "chat Chat" }).click();
		await page.reload({ waitUntil: "load" });
		await page.getByRole("link", { name: "chat Chat" }).click();
		await page.getByRole("heading", { name: "group-with-user-e2e-" }).nth(0).click();

		await page.getByRole("textbox", { name: "Type a message..." }).click();
		const msg3 = `Hello Admin How are you-${Date.now()}`;
		await page.getByTestId("chat-message-input").fill(msg3);
		await page.getByTestId("send-message-button").click();
		await expect(page.getByTestId("message-text-inner-wrapper").getByText(msg3)).toBeVisible();
	});

	await test.step("veriy group chat -Show detail", async () => {
		//Create group
		await page.getByTestId("create-channel-trigger").click();
		await page.getByTestId("create-group-chat").click();
		await page.getByRole("textbox", { name: "Group Name" }).click();
		const uniqueName = `Group-${Date.now()}`;
		await page.getByRole("textbox", { name: "Group Name" }).fill(uniqueName);
		await page.getByRole("textbox", { name: "Search users by name" }).click();
		await page.getByRole("textbox", { name: "Search users by name" }).fill("z");
		await page.locator("p").filter({ hasText: "Razil Shaikh" }).first().click();
		await page.getByRole("textbox", { name: "Search users by name" }).click();
		await page.getByRole("textbox", { name: "Search users by name" }).fill("Jaggik Muk");
		await page.getByRole("textbox", { name: "Search users by name" }).press("ControlOrMeta+a");
		await page.getByRole("textbox", { name: "Search users by name" }).fill("abhishek shinde");
		const dialog = page.getByRole("dialog");
		await dialog.locator('p:has-text("Abhishek Shinde")').click();
		await page.getByRole("button", { name: "Create Group" }).click({ force: true });

		await page.locator("p").filter({ hasText: "No messages yet" }).first().click();
		await page.getByRole("textbox", { name: "Type a message..." }).click();
		const msg0 = `Hello Everyone -${Date.now()}`;
		await page.getByTestId("chat-message-input").fill(msg0);
		await page.getByTestId("send-message-button").click();
		await expect(page.getByTestId("message-text-inner-wrapper").getByText(msg0)).toBeVisible();

		//Edit group name
		await page.getByTestId("more-options-button").click();
		await page.getByTestId("show-details-button").click();
		await page.getByTestId("rename-group-button").click();
		await page.getByRole("textbox", { name: "Enter Group Name" }).click();
		await page.getByRole("textbox", { name: "Enter Group Name" }).fill("Updated" + uniqueName);
		await page.getByRole("button", { name: "Confirm" }).click();
		await expect(
			page.locator("#str-chat__channel").getByRole("heading", { name: "updated" + uniqueName })
		).toBeVisible();

		//Add member
		await page.getByTestId("more-options-button").click();
		await page.getByTestId("show-details-button").click();
		await page.getByTestId("add-member-button").click();
		await page.getByRole("textbox", { name: "Search users by name" }).click();
		await page.getByRole("textbox", { name: "Search users by name" }).fill("Arjun Dangi");
		await page.getByText("Arjun Dangi", { exact: true }).first().click();
		await page.getByRole("textbox", { name: "Type a message..." }).click();
		const msg2 = `Hello new member-${Date.now()}`;
		await page.getByTestId("chat-message-input").fill(msg2);
		await page.getByTestId("send-message-button").click();
		await expect(page.getByTestId("message-text-inner-wrapper").getByText(msg2)).toBeVisible();

		//Remove member
		await page.getByTestId("more-options-button").click();
		await page.getByTestId("show-details-button").click();
		await page.getByTestId("remove-member-button").first().click();
		await page.getByTestId("remove-member-button").nth(2).click();
		await page.getByRole("button", { name: "Close" }).click();
	});
});

test("verify - Search box ", async ({ page }: { page: Page }) => {
	//Search with full name
	await page.getByTestId("channel-search-input").click();
	await page.getByTestId("channel-search-input").fill("Cora Gallegos");
	await expect(page.getByTestId("channel-cora-gallegos")).toBeVisible();

	//Search with partial name
	await page.getByTestId("channel-search-input").click();
	await page.getByTestId("channel-search-input").fill("Cora ");
	await expect(page.getByTestId("channel-cora-gallegos")).toBeVisible();
});

test("verify - file upload functionality-user send file to other user ", async ({ page }) => {
	await page.getByTestId("create-channel-trigger").click();
	await page.getByTestId("create-direct-chat").click();
	await page.getByRole("textbox", { name: "Search users by name..." }).fill("Sunil Byldd");
	await page.getByRole("dialog").locator('p:has-text("Sunil Byldd")').first().click();

	await page.getByTestId("channel-sunil-byldd").last().click();

	const uploadFilePath = path.join(process.cwd(), "e2e-tests/chats/sample.txt");
	await page.locator('input[type="file"][accept]').setInputFiles(uploadFilePath);

	await page.getByTestId("chat-message-input").fill("I am upload file check it");

	const sendBtn = page.getByTestId("send-message-button");
	await expect(sendBtn).toBeEnabled();
	await sendBtn.click();

	await expect(
		page.getByTestId("message-text-inner-wrapper").getByText("I am upload file check it").last()
	).toBeVisible();
});

//below code will uncomment when bug fixex
/*
test('Delete/Clear char ', async ({ page }: { page: Page }) => {
    await test.step('Delete chat', async () => {

        await page.getByTestId('create-channel-trigger').click();
        await page.getByTestId('create-direct-chat').click();
        await page.getByRole('textbox', { name: 'Search users by name...' }).click();
        await page.getByRole('textbox', { name: 'Search users by name...' }).click();
        await page.getByRole('textbox', { name: 'Search users by name...' }).fill('Cupidatat nostrum ');
        await page.getByText('Cupidatat nostrum fa Aut').click();
        await expect(page.getByRole('heading', { name: 'Cupidatat nostrum fa Aut' })).toBeVisible();
        await page.getByRole('heading', { name: 'Cupidatat nostrum fa Aut' }).click();
        await expect(page.getByTestId('channel-cupidatat-nostrum-fa-aut-consequatur-inv').getByRole('heading', { name: 'Cupidatat nostrum fa Aut' })).toBeVisible();
        await page.getByTestId('chat-message-input').click();
        await page.getByTestId('chat-message-input').fill('hello');
        await page.getByTestId('send-message-button').click();
        await page.getByTestId('more-options-button').click();
        await page.getByTestId('delete-chat-button').click();
        await page.getByRole('button', { name: 'Delete' }).click();
        await expect(page.getByText('Select a channel from the')).toBeVisible();
         await page.getByTestId('channel-search-input').click();
        await page.getByTestId('channel-search-input').fill('Cupidatat nostrum fa');
        await expect(page.getByText('No channels found', { exact: true })).toBeVisible();
    });

    await test.step('Clear chat ',async()=>{


    await page.getByTestId('create-channel-trigger').click();
    await page.getByTestId('create-direct-chat').click();
    await page.getByRole('textbox', { name: 'Search users by name...' }).click();
    await page.getByRole('textbox', { name: 'Search users by name...' }).fill('cupidatat nostrum');
    await page.getByText('Cupidatat nostrum fa Aut').click();
     await expect(page.getByTestId('channel-cupidatat-nostrum-fa-aut-consequatur-inv').getByRole('heading', { name: 'Cupidatat nostrum fa Aut' })).toBeVisible();
    await page.getByTestId('chat-message-input').click();
    await page.getByTestId('chat-message-input').fill('hiii');
    await page.getByTestId('send-message-button').click();
    await page.getByTestId('more-options-button').click();
    await page.getByTestId('clear-chat-button').click();
    await page.getByRole('heading', { name: 'Confirmation Required' }).click();
    await page.getByRole('button', { name: 'Clear' }).click();
    await expect(page.getByText('Select a channel from the')).toBeVisible();
    await page.getByTestId('channel-search-input').click();
    await page.getByTestId('channel-search-input').fill('Cupidatat nostrum fa');
    await expect(page.getByText('No channels found', { exact: true })).toBeVisible();
    
    });

});

test('AI Asistant', async ({ page }: { page: Page }) => {
    await test.step('enter prompt to AI Asistant',async()=>{
        await page.getByRole('button', { name: 'AI Assistant' }).click();
        await page.getByTestId('chat-message-input').click();
        await page.getByTestId('chat-message-input').fill('give me short summary of file');
        await page.getByTestId('send-message-button').click();
        await expect(page.getByTestId('message-text-inner-wrapper').getByText('give me short summary of file').last()).toBeVisible();

    });
    
    await test.step('user upload file in ai asistant chat ', async () => {
        await page.getByRole('button', { name: 'AI Assistant' }).click();
        const uploadFilePath = path.join(process.cwd(), 'e2e-tests/chats/sample.txt');
        await page.getByTestId('attach-file').setInputFiles(uploadFilePath);
        await page.getByTestId('chat-message-input').fill('Give short summary from above file ');
        const sendBtn = page.getByTestId('send-message-button');
        await expect(sendBtn).toBeEnabled();
        await sendBtn.click();
        await expect(page.getByTestId('message-text-inner-wrapper').getByText('Give short summary from above file ').last()).toBeVisible();

    });

    await test.step('chat history',async()=>{
    await page.getByRole('button', { name: 'AI Assistant' }).click();
    await page.getByTestId('chat-options-dropdown').click();
    await page.getByRole('menuitem', { name: 'Show Chat History' }).click();
    await expect(page.getByRole('heading', { name: 'Chat History' })).toBeVisible();

    });
    await test.step('add permanat file', async () => {
        await page.getByRole('button', { name: 'AI Assistant' }).click();
        await page.getByRole('tab', { name: 'Permanent Files' }).click();
        await page.getByText('Browse', { exact: true }).click();
        const filePath = path.join(process.cwd(),'e2e-tests/chats/sample.txt');
        await page.getByText('Browse', { exact: true }).setInputFiles(filePath);
    });

    await test.step('remove selected file',async()=>{
        await page.getByRole('button', { name: 'AI Assistant' }).click();
        await page.getByRole('tab', { name: 'Permanent Files' }).click();
        page.getByTestId('remove-selected-files')
    });

});

test('verify - notification' ,async({page}:{page:Page})=>{
await page.getByRole('button', { name: 'Notification' }).click();
await page.getByRole('link', { name: 'View' }).first().click();
await expect(page.getByRole('heading', { name: 'This page could not be found.' })).toBeVisible();
})
*/
