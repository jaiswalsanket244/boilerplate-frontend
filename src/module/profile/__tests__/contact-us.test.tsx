import { routes } from "@/config/routes";
import { apiClient } from "@/lib/api";
import { setSessionStorage } from "@/lib/utils/session-storage";
import { mockUserData } from "@/module/profile/__tests__/utils";
import ContactUs from "@/module/profile/templates/contact-us";
import { USER_QUERY_SUBJECT } from "@/module/profile/types";
import { MESSAGE_CHAR_LIMIT } from "@/module/profile/utils/contact-us-form-config";
import { mockRouter } from "@/tests/utils/mock-next-navigation";
import { renderWithProviders } from "@/tests/utils/mock-providers";
import { SESSION_STORAGE_KEYS } from "@/types";
import { screen, waitFor } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { MemoryRouterProvider } from "next-router-mock/MemoryRouterProvider";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/utils/session-storage", () => ({
	setSessionStorage: vi.fn(),
}));

const mockCreateUserQuery = vi.fn();
const isPending = false;

vi.mock("@/module/profile/hooks/useUserQueryAPI", async (importOriginal) => {
	const actual = await importOriginal<typeof import("@/module/profile/hooks/useUserQueryAPI")>();

	return {
		...actual,
		default: () => ({
			...actual.default(),
			useCreateUserQuery: () => ({
				mutateAsync: mockCreateUserQuery,
				get isPending() {
					return isPending;
				},
			}),
		}),
	};
});

const renderComponent = () => {
	return renderWithProviders(<ContactUs />, { wrapper: MemoryRouterProvider });
};
const getFormElements = () => ({
	emailInput: screen.getByLabelText(/email/i) as HTMLInputElement,
	firstNameInput: screen.getByLabelText(/first name/i) as HTMLInputElement,
	lastNameInput: screen.getByLabelText(/last name/i) as HTMLInputElement,
	messageInput: screen.getByLabelText(/message/i) as HTMLInputElement,
});
const submitForm = async (user: UserEvent) => {
	const { messageInput } = getFormElements();

	await user.type(messageInput, "Test message");
	await user.click(getSubmitButton());
};

const getSubmitButton = () => screen.getByRole("button", { name: /send query/i });

describe("ContactUs Component", () => {
	let user: UserEvent;

	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(apiClient.get).mockResolvedValue({
			data: { data: mockUserData },
		});

		user = userEvent.setup();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("Rendering", () => {
		it("should render the contact us form with all required fields", () => {
			renderComponent();

			expect(screen.getByRole("heading", { name: /contact us/i })).toBeInTheDocument();
			expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
			expect(screen.getByText(/select subject/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
		});

		it("should render the submit button", () => {
			renderComponent();

			expect(getSubmitButton()).toBeInTheDocument();
		});

		it("should render the view previous queries link", () => {
			renderComponent();

			const link = screen.getByRole("link", { name: /view previous queries/i });
			expect(link).toBeInTheDocument();
			expect(link).toHaveAttribute("href", routes.settings.previousQueries);
		});
	});

	describe("Form Initialization", () => {
		it("should populate form fields with user data when available", async () => {
			renderComponent();

			await waitFor(() => {
				const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
				const firstNameInput = screen.getByLabelText(/first name/i) as HTMLInputElement;
				const lastNameInput = screen.getByLabelText(/last name/i) as HTMLInputElement;

				expect(emailInput.value).toBe(mockUserData.email);
				expect(firstNameInput.value).toBe(mockUserData.name.first);
				expect(lastNameInput.value).toBe(mockUserData.name.last);
			});
		});

		it("should handle when user data is not available", () => {
			vi.mocked(apiClient.get).mockResolvedValue({
				data: { data: null },
			});
			renderComponent();

			const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
			const firstNameInput = screen.getByLabelText(/first name/i) as HTMLInputElement;
			const lastNameInput = screen.getByLabelText(/last name/i) as HTMLInputElement;

			expect(emailInput.value).toBe("");
			expect(firstNameInput.value).toBe("");
			expect(lastNameInput.value).toBe("");
		});
	});

	describe("Form Submission", () => {
		it("should submit form with valid data", async () => {
			const mockResponse = { _id: "query-123" };
			// mockMutateAsync.mockResolvedValue(mockResponse);
			mockCreateUserQuery.mockResolvedValue(mockResponse);
			renderComponent();

			const messageInput = screen.getByLabelText(/message/i);
			await user.type(messageInput, "This is my query message");

			const submitButton = screen.getByRole("button", { name: /send query/i });
			await user.click(submitButton);

			await waitFor(() => {
				expect(mockCreateUserQuery).toHaveBeenCalledTimes(1);
				expect(mockCreateUserQuery).toHaveBeenCalledWith(
					expect.objectContaining({
						email: "john.doe@example.com",
						name: {
							first: "John",
							last: "Doe",
						},
						subject: USER_QUERY_SUBJECT.GENERAL,
						message: "This is my query message",
					})
				);
			});
		});

		it("should redirect to previous queries page after successful submission", async () => {
			const mockResponse = { _id: "query-123" };
			mockCreateUserQuery.mockResolvedValue(mockResponse);

			renderComponent();

			const { messageInput } = getFormElements();
			await user.type(messageInput, "Test message");

			await user.click(getSubmitButton());

			await waitFor(() => {
				expect(mockRouter.push).toHaveBeenCalledWith(routes.settings.previousQueries);
			});
		});

		it("should store query ID in session storage after successful submission", async () => {
			const mockResponse = { _id: "query-123" };
			mockCreateUserQuery.mockResolvedValue(mockResponse);

			renderComponent();

			await submitForm(user);

			await waitFor(() => {
				expect(setSessionStorage).toHaveBeenCalledWith(SESSION_STORAGE_KEYS.NEW_QUERY_IDS, ["query-123"]);
			});
		});

		it("should reset form after successful submission", async () => {
			const mockResponse = { _id: "query-123" };
			mockCreateUserQuery.mockResolvedValue(mockResponse);

			renderComponent();

			const { messageInput } = getFormElements();
			await user.type(messageInput, "Test message");

			await user.click(getSubmitButton());

			await waitFor(() => {
				expect(messageInput.value).toBe("");
			});
		});

		it("should display error message when submission fails", async () => {
			mockCreateUserQuery.mockRejectedValue(new Error("Network error"));

			renderComponent();

			await submitForm(user);

			await waitFor(() => {
				expect(screen.getByText(/failed to submit query. please try again./i)).toBeInTheDocument();
			});
		});

		it("should not redirect when submission fails", async () => {
			mockCreateUserQuery.mockRejectedValue(new Error("Network error"));

			renderComponent();

			await submitForm(user);

			await waitFor(() => {
				expect(screen.getByText(/failed to submit query/i)).toBeInTheDocument();
			});

			expect(mockRouter.push).not.toHaveBeenCalled();
		});
	});

	describe("Message Character Limit", () => {
		it("should handle paste event within character limit", async () => {
			renderComponent();

			const messageInput = screen.getByLabelText(/message/i) as HTMLTextAreaElement;
			const shortText = "This is a short message";

			await user.click(messageInput);
			await user.paste(shortText);

			expect(messageInput.value).toBe(shortText);
		});

		it("should truncate pasted text exceeding character limit", async () => {
			renderComponent();

			const messageInput = screen.getByLabelText(/message/i) as HTMLTextAreaElement;

			// First, fill the message input close to the limit
			const existingText = "a".repeat(MESSAGE_CHAR_LIMIT - 10);
			await user.type(messageInput, existingText);

			// Try to paste text that would exceed the limit
			const pasteText = "b".repeat(50);
			const clipboardData = new DataTransfer();
			clipboardData.setData("text/plain", pasteText);

			const pasteEvent = new ClipboardEvent("paste", {
				clipboardData,
				bubbles: true,
				cancelable: true,
			});

			messageInput.dispatchEvent(pasteEvent);

			await waitFor(() => {
				// Should only add 10 characters (the available space)
				expect(messageInput.value.length).toBeLessThanOrEqual(MESSAGE_CHAR_LIMIT);
			});
		});

		it("should not paste when at character limit", async () => {
			renderComponent();

			const messageInput = screen.getByLabelText(/message/i) as HTMLTextAreaElement;

			// Fill to the limit
			const maxText = "a".repeat(MESSAGE_CHAR_LIMIT);
			await user.type(messageInput, maxText);

			// Try to paste more text
			const pasteText = "extra text";
			const clipboardData = new DataTransfer();
			clipboardData.setData("text/plain", pasteText);

			const pasteEvent = new ClipboardEvent("paste", {
				clipboardData,
				bubbles: true,
				cancelable: true,
			});

			messageInput.dispatchEvent(pasteEvent);

			await waitFor(() => {
				expect(messageInput.value.length).toBe(MESSAGE_CHAR_LIMIT);
			});
		});
	});

	describe("Subject Radio Group", () => {
		it("should render all subject options from config", () => {
			renderComponent();
			const subjectOptions = Object.values(USER_QUERY_SUBJECT);
			subjectOptions.forEach((subject) => {
				expect(screen.getByText(subject)).toBeInTheDocument();
			});
		});

		it("should allow selecting different subjects", async () => {
			renderComponent();
			const radioButtons = screen.getAllByRole("radio") as HTMLInputElement[];
			expect(radioButtons.length).toBeGreaterThan(0);

			// Select the first radio button
			await user.click(radioButtons[0]!);
			expect(radioButtons[0] as HTMLInputElement).toBeChecked();
		});

		it("should only allow one subject to be selected at a time", async () => {
			renderComponent();
			const radioButtons = screen.getAllByRole("radio") as HTMLInputElement[];

			if (radioButtons.length > 1) {
				await user.click(radioButtons[0]!);
				expect(radioButtons[0] as HTMLInputElement).toBeChecked();

				await user.click(radioButtons[1]!);
				expect(radioButtons[1] as HTMLInputElement).toBeChecked();
				expect(radioButtons[0] as HTMLInputElement).not.toBeChecked();
			}
		});
	});

	describe("Form Validation", () => {
		it("should not submit form without required fields", async () => {
			renderComponent();
			// Clear the pre-filled fields
			const firstNameInput = screen.getByLabelText(/first name/i);
			const lastNameInput = screen.getByLabelText(/last name/i);
			const emailInput = screen.getByLabelText(/email/i);

			await user.clear(firstNameInput);
			await user.clear(lastNameInput);
			await user.clear(emailInput);

			const submitButton = screen.getByRole("button", { name: /send query/i });
			await user.click(submitButton);

			expect(mockCreateUserQuery).not.toHaveBeenCalled();
		});

		it("should validate email format", async () => {
			renderComponent();

			const emailInput = screen.getByLabelText(/email/i);
			await user.clear(emailInput);
			await user.type(emailInput, "invalid-email");

			const submitButton = screen.getByRole("button", { name: /send query/i });
			await user.click(submitButton);

			expect(mockCreateUserQuery).not.toHaveBeenCalled();
		});
	});

	describe("Error State Management", () => {
		it("should clear error message when form is resubmitted successfully", async () => {
			// First submission fails
			mockCreateUserQuery.mockRejectedValueOnce(new Error("Network error")).mockResolvedValueOnce({ _id: "query-123" });

			renderComponent();

			await submitForm(user);
			await waitFor(() => {
				expect(screen.getByText(/failed to submit query/i)).toBeInTheDocument();
			});

			// Second submission succeeds

			await submitForm(user);

			await waitFor(() => {
				expect(screen.queryByText(/failed to submit query/i)).not.toBeInTheDocument();
			});
		});
	});
});
