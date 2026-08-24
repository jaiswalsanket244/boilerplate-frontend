import EmailForm from "@/module/profile/components/user-queries/email-form";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";

const mockOnSendEmail = vi.fn();
function renderComponent() {
	return render(<EmailForm onSendEmail={mockOnSendEmail} />);
}

const getSubmitButton = () => screen.getByRole("button", { name: "Send Email" });

const getMessageInput = () => screen.getByPlaceholderText("Message") as HTMLInputElement;

const typeMessage = async (user: UserEvent, message: string = "Test message") => {
	await user.type(getMessageInput(), message);
};

describe("EmailForm Component", () => {
	let user: UserEvent;
	beforeEach(() => {
		vi.clearAllMocks();
		user = userEvent.setup();
	});

	it("should render email form", () => {
		renderComponent();

		expect(screen.getByText("Respond Via Email")).toBeInTheDocument();
		expect(screen.getByPlaceholderText("Message")).toBeInTheDocument();
		expect(getSubmitButton()).toBeInTheDocument();
	});

	it("should render CC and BCC checkboxes", () => {
		renderComponent();

		expect(screen.getByLabelText("cc")).toBeInTheDocument();
		expect(screen.getByLabelText("bcc")).toBeInTheDocument();
	});

	it("should show CC input when CC checkbox is checked", async () => {
		renderComponent();

		const ccCheckbox = screen.getByLabelText("cc");
		await user.click(ccCheckbox);

		expect(screen.getByPlaceholderText("Enter email addresses separated by commas")).toBeInTheDocument();
	});

	it("should show BCC input when BCC checkbox is checked", async () => {
		renderComponent();

		const bccCheckbox = screen.getByLabelText("bcc");
		await user.click(bccCheckbox);

		expect(screen.getByPlaceholderText("Enter email addresses separated by commas")).toBeInTheDocument();
	});

	it("should call onSendEmail with form data when submitted", async () => {
		mockOnSendEmail.mockResolvedValue(undefined);
		renderComponent();

		await typeMessage(user);

		await user.click(getSubmitButton());

		await waitFor(() => {
			expect(mockOnSendEmail).toHaveBeenCalledWith({
				message: "Test message",
				ccEmails: [],
				bccEmails: [],
			});
		});
	});

	it("should include CC emails when submitted", async () => {
		mockOnSendEmail.mockResolvedValue(undefined);
		renderComponent();

		// Enable CC
		const ccCheckbox = screen.getByLabelText("cc");
		await user.click(ccCheckbox);

		// Enter CC emails
		const ccInput = screen.getByPlaceholderText("Enter email addresses separated by commas");
		await user.type(ccInput, "test1@example.com, test2@example.com");

		// Enter message
		await typeMessage(user);

		// Submit
		await user.click(getSubmitButton());

		await waitFor(() => {
			expect(mockOnSendEmail).toHaveBeenCalledWith({
				message: "Test message",
				ccEmails: ["test1@example.com", "test2@example.com"],
				bccEmails: [],
			});
		});
	});

	it("should show validation error for empty message", async () => {
		renderComponent();

		await user.click(getSubmitButton());

		await waitFor(() => {
			expect(screen.getByText("Message is required")).toBeInTheDocument();
		});

		expect(mockOnSendEmail).not.toHaveBeenCalled();
	});

	it("should reset form after successful submission", async () => {
		mockOnSendEmail.mockResolvedValue(undefined);
		renderComponent();

		await typeMessage(user);

		await user.click(getSubmitButton());

		await waitFor(() => {
			expect(mockOnSendEmail).toHaveBeenCalled();
		});

		// Form should be reset
		await waitFor(() => {
			expect(getMessageInput()).toHaveValue("");
		});
	});

	it("should show error state when submission fails", async () => {
		mockOnSendEmail.mockRejectedValue(new Error("Failed to send"));
		renderComponent();

		await typeMessage(user);

		await user.click(getSubmitButton());

		await waitFor(() => {
			expect(screen.getByText("Failed to send email")).toBeInTheDocument();
		});
	});

	it("should disable submit button while submitting", async () => {
		mockOnSendEmail.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
		renderComponent();

		await typeMessage(user);

		await user.click(getSubmitButton());

		// Button should be disabled and show "Sending..."
		await waitFor(() => {
			expect(screen.getByRole("button", { name: "Sending..." })).toBeDisabled();
		});
	});
});
