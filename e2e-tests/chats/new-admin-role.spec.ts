import { test, expect, Page } from "@playwright/test";
import path from "path";

test.beforeEach(async ({ page }: { page: Page }) => {
	await page.goto("https://boilerplate.byldd.com/signin");
	await page.getByRole("textbox", { name: "Email" }).click();
	await page.getByRole("textbox", { name: "Email" }).fill("vaishnavimahajan710@gmail.com");
	await page.getByRole("textbox", { name: "Password" }).click();
	await page.getByRole("textbox", { name: "Password" }).fill("Vaishnavi@1706");
	await page.getByRole("textbox", { name: "Password" }).press("Enter");
	await page.getByTestId("signin-btn").click();
	await page.getByRole("link", { name: "Chat" }).click();
	await expect(page.getByRole("button", { name: "AI Assistant" })).toBeVisible();
});

test("verify - admin create chat with one ", async ({ page }: { page: Page }) => {
	await page.getByTestId("create-channel-trigger").click();
	await page.getByTestId("create-direct-chat").click();
	await page.getByRole("textbox", { name: "Search users by name..." }).click();
	await page.getByRole("textbox", { name: "Search users by name..." }).fill("Diwakar Mishra");
	await page.getByRole("textbox", { name: "Search users by name..." }).press("Enter");
	const dialog = page.getByRole("dialog");
	await dialog.getByText("Diwakar Mishra", { exact: true }).click();
	await page.getByTestId("channel-diwakar-mishra").first().click();
	await page.getByRole("textbox", { name: "Type a message..." }).click();
	await page.getByTestId("chat-message-input").click();
	await page.getByTestId("chat-message-input").fill("hi Diwakar mishra");
	await page.getByTestId("send-message-button").click();

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

	//copy message
	await page.getByRole("img", { name: "copy" }).first().click();
	await page.getByRole("textbox", { name: "Type a message..." }).click();
	await page.keyboard.press("Control+V");
	await page.getByTestId("send-message-button").click();

	//Delete message
	await page.getByTestId("delete-message-button").last().click();
	await expect(page.getByText("This message was deleted", { exact: true }).last()).toBeVisible();
});

test("verify - admin create group chat ", async ({ page }: { page: Page }) => {
	//create group and send message
	await page.getByTestId("create-channel-trigger").click();
	await page.getByTestId("create-group-chat").click();
	await page.getByRole("textbox", { name: "Group Name" }).click();
	await page.getByRole("textbox", { name: "Group Name" }).fill("group name 2026");
	await page.getByText("Aaisha Vishnoi").click();
	await page.getByText("Abhishek Shinde").click();
	await page.getByRole("textbox", { name: "Search users by name" }).click();
	await page.getByRole("textbox", { name: "Search users by name" }).fill("vaishnavi byldd");
	await page.getByText("vaishnaviByldd mahajan", { exact: true }).first().click();
	await page.getByRole("button", { name: "Create Group" }).click();
	await page.getByTestId("channel-group-name-2026").first().click();
	await page.getByRole("textbox", { name: "Type a message..." }).click();
	const msg1 = `Hello group member-${Date.now()}`;
	await page.getByTestId("chat-message-input").fill(msg1);
	await page.getByTestId("send-message-button").click();
	await expect(page.getByTestId("message-text-inner-wrapper").getByText(msg1)).toBeVisible();

	// show group detail and change group name

	await test.step("verify - show group detail", async () => {
		await page.getByTestId("create-channel-trigger").click();
		await page.getByTestId("create-group-chat").click();
		await page.getByRole("textbox", { name: "Group Name" }).click();
		const uniqueName = `Group-${Date.now()}`;
		await page.getByRole("textbox", { name: "Group Name" }).fill(uniqueName);
		await page.getByRole("textbox", { name: "Search users by name" }).click();
		await page.getByRole("textbox", { name: "Search users by name" }).fill("Jaggik Mukherjee");
		await page.locator('p:has-text("Jaggik Mukherjee")').click();
		await page.getByRole("textbox", { name: "Search users by name" }).click();
		await page.getByRole("textbox", { name: "Search users by name" }).fill("Jaggik Muk");
		await page.getByRole("textbox", { name: "Search users by name" }).press("ControlOrMeta+a");
		await page.getByRole("textbox", { name: "Search users by name" }).fill("abhishek shinde");
		await page.getByText("Abhishek Shinde", { exact: true }).nth(0).click();
		await page.getByRole("button", { name: "Create Group" }).click({ force: true });
		await page.getByRole("heading", { name: "group name" }).first().click();
		await page.getByRole("textbox", { name: "Type a message..." }).click();
		const msg0 = `Hello Everyone -${Date.now()}`;
		await page.getByTestId("chat-message-input").fill(msg0);
		await page.getByTestId("send-message-button").click();
		await expect(page.getByTestId("message-text-inner-wrapper").getByText(msg0)).toBeVisible();

		//Edit group name
		await page.getByTestId("more-options-button").click();
		await page.getByTestId("show-details-button").click();
		await page.getByRole("heading", { name: "group name" }).getByRole("button").click();
		await page.getByRole("textbox", { name: "Enter Group Name" }).click();
		await page.getByRole("textbox", { name: "Enter Group Name" }).fill("updated" + uniqueName);
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
		await expect(page.getByText("Abhishek Shinde,")).toBeVisible();
	});

	await test.step("verify- e2e group chat ", async () => {
		await page.getByTestId("create-channel-trigger").click();
		await page.getByTestId("create-group-chat").click();
		await page.getByRole("textbox", { name: "Group Name" }).click();
		const uniqueName1 = `group-with-user-e2e-${Date.now()}`;
		await page.getByRole("textbox", { name: "Group Name" }).fill(uniqueName1);
		await page.getByText("Aaisha Vishnoi", { exact: true }).nth(0).click();
		await page.getByText("Abhishek Shinde", { exact: true }).nth(0).click();
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
		await expect(page.getByTestId("unread-messages-separator")).toBeVisible();
		await page.getByRole("textbox", { name: "Type a message..." }).click();
		const msg3 = `Hello Admin How are you-${Date.now()}`;
		await page.getByTestId("chat-message-input").fill(msg3);
		await page.getByTestId("send-message-button").click();
		await expect(page.getByTestId("message-text-inner-wrapper").getByText(msg3)).toBeVisible();
	});
});

test("verify - search name", async ({ page }: { page: Page }) => {
	//single user--
	await page.getByTestId("channel-search-input").click();
	await page.getByTestId("channel-search-input").fill("diwakar mishra");
	await expect(page.getByRole("button", { name: "Diwakar Mishra Channel •" })).toBeVisible();
	await page.getByTestId("channel-search-input").click();
	await page.getByTestId("channel-search-input").fill("diW");
	await expect(page.getByRole("button", { name: "Diwakar Mishra Channel •" })).toBeVisible();
	//group name --
	await page.getByTestId("channel-search-input").click();
	await page.getByTestId("channel-search-input").fill("group-with-user-e2e-1768073798249");
	await expect(page.getByRole("button", { name: "group-with-user-e2e-" })).toBeVisible();
});

test("verify - AI asistant", async ({ page }: { page: Page }) => {
	await test.step("verify - admin enter propmt", async () => {
		await page.getByRole("button", { name: "AI Assistant" }).click();
		await page.getByRole("tab", { name: "Chat" }).click();
		await page.getByTestId("chat-message-input").click();
		await page.getByTestId("chat-message-input").fill("give me short information from file");
		await page.getByTestId("send-message-button").click();
		await expect(page.getByText("give me short information from file")).toBeVisible();

		//below code will uncomment when bug fixex
		//edit prompt
		// await page.getByRole('button', { name: 'edit' }).click();
		// await page.getByTestId('edit-message-input"').fill('Updated prompt ');
		// await page.getByRole('button', { name: 'Send' }).click();
		// await expect(page.getByText('Updated prompt')).toBeVisible();
	});

	//below code will uncomment when bug fixex
	// await test.step('upload file after prompt',async()=>{
	//         await page.getByRole('button', { name: 'AI Assistant' }).click();
	//         const uploadFilePath = path.join(process.cwd(), 'e2e-tests/chats/sample.txt');
	//         await page.locator('input[type="file"][accept]').setInputFiles(uploadFilePath);
	//         // Provide message text (required by app logic)
	//         await page.getByTestId('chat-message-input').fill('I am upload file check it');
	//         // Assert correct signal: Send button enabled
	//         const sendBtn = page.getByTestId('send-message-button');
	//         await expect(sendBtn).toBeEnabled();
	//         await sendBtn.click();
	//         // Final proof: message rendered
	//         await expect(page.getByTestId('message-text-inner-wrapper').getByText('I am upload file check it').last()).toBeVisible();
	// });

	await test.step("verify -admin upload Permanant file", async () => {
		await page.getByRole("button", { name: "AI Assistant" }).click();
		await page.getByRole("tab", { name: "Permanent Files" }).click();
		await page.getByTestId("upload-files-button").click();
		const uploadFilePath = path.join(process.cwd(), "e2e-tests/chats/sample.txt");
		const fileInput = page.getByTestId("upload-dropzone-input");
		await fileInput.setInputFiles(uploadFilePath);
		//below code will change when bug fixex
		//replace with close btn like - X
		await page.getByRole("dialog").getByTestId("cancel-upload").click();
		await expect(page.locator("p").filter({ hasText: "sample.txt" }).first()).toBeVisible();
	});

	await test.step("verify - remove selected file from Permanant files ", async () => {
		await page.getByRole("button", { name: "AI Assistant" }).click();
		await page.getByRole("tab", { name: "Permanent Files" }).click();
		await page.getByTestId("upload-files-button").click();
		const uploadFilePath = path.join(process.cwd(), "e2e-tests/chats/sample.txt");
		const fileInput = page.getByTestId("upload-dropzone-input");
		await fileInput.setInputFiles(uploadFilePath);

		//below code will change when bug fixex
		//replace with close btn LIKE-X
		await page.getByRole("dialog").getByTestId("cancel-upload").click();
		await page.getByRole("checkbox").last().click();
		await expect(page.getByTestId("remove-selected-files")).toBeEnabled();
	});
	await test.step("verify - remove all files form permanant files", async () => {
		await page.getByRole("button", { name: "AI Assistant" }).click();
		await page.getByRole("tab", { name: "Permanent Files" }).click();
		await page.reload();
		await page.getByRole("tab", { name: "Permanent Files" }).click();
		await page.getByTestId("select-all").click();
		await expect(page.getByTestId("remove-selected-files")).toBeEnabled();
		await page.getByTestId("remove-selected-files").click();
		await expect(page.getByText("No files uploaded yet", { exact: true })).toBeVisible();
	});

	await test.step("verify - Show chat history", async () => {
		await page.getByRole("button", { name: "AI Assistant" }).click();
		await page.getByRole("tab", { name: "Chat" }).click();
		await page.getByTestId("chat-message-input").click();
		await page.getByTestId("chat-message-input").fill("hii");
		await page.getByTestId("send-message-button").click();
		await expect(page.getByText("hii").last()).toBeVisible();
		await page.getByTestId("chat-options-dropdown").click();
		await page.getByTestId("toggle-chat-history").click();
		await page.getByRole("button", { name: "New Chat" }).first().click();
		await expect(page.getByRole("heading", { name: "Chat History" })).toBeVisible();
	});
});

//below code will uncomment when bug fixex
/*
// test('delete chat ',async({page}:{page:Page})=>{
// await page.getByTestId('create-channel-trigger').click();
// await page.getByTestId('create-direct-chat').click();
// await page.getByRole('textbox', { name: 'Search users by name...' }).click();
// await page.getByRole('textbox', { name: 'Search users by name...' }).fill('Gay Cooper');
// await page.getByRole('textbox', { name: 'Search users by name...' }).press('Enter');
// const dialog = page.getByRole('dialog');
// await dialog.locator('p:has-text("Gay Cooper")').click();
// await page.getByTestId('channel-gay-cooper').first().click();
// await page.getByRole('textbox', { name: 'Type a message...' }).click();
// // await page.getByTestId('chat-message-input').click();
// await page.getByTestId('chat-message-input').fill('hi Gay Cooper');
// await page.getByTestId('send-message-button').click();
// await expect(page.getByTestId('message-text-inner-wrapper').getByText('hi Gay Cooper').last()).toBeVisible();
// await page.getByTestId('more-options-button').click();
// await page.getByTestId('clear-chat-button').click();
// await page.getByRole('heading', { name: 'Confirmation Required' }).click();
// await page.getByRole('button', { name: 'Clear' }).click();
// });

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

test('verify - notification' ,async({page}:{page:Page})=>{
await page.getByRole('button', { name: 'Notification' }).click();
await page.getByRole('link', { name: 'View' }).first().click();
await expect(page.getByRole('heading', { name: 'This page could not be found.' })).toBeVisible();
})
*/
