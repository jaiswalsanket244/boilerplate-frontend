import { render, screen, waitFor } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { vi } from "vitest";

import { routes } from "@/config/routes";
import type { EmailOnlyCallbacks, EmailOnlyPayload } from "@/module/auth/__tests__/types/mutation-types";
import ForgetPasswordForm from "@/module/auth/templates/forget-password-form";
import { networkError, nullBodyError } from "@/tests/utils/mock-api-errors";
import { mockRouter } from "@/tests/utils/mock-next-navigation";

const mutateMock = vi.fn<(payload: EmailOnlyPayload, callbacks: EmailOnlyCallbacks) => void>();
let isPending = false;

vi.mock("@/module/auth/hooks/useAuth", () => ({
	useAuthAPI: () => ({
		useForgetPasswordMutation: {
			mutate: (...args: Parameters<typeof mutateMock>) => mutateMock(...args),
			get isPending() {
				return isPending;
			},
		},
	}),
}));

const getEmailInput = () => screen.getByRole("textbox", { name: /email/i });
const getSubmitButton = () => screen.getByTestId("forgot-password-button");

describe("Forget password form template", () => {
	const userEmail = "user@test.com";
	let user: UserEvent;

	beforeEach(() => {
		vi.clearAllMocks();
		isPending = false;

		user = userEvent.setup();
	});

	it("renders heading, back button & email input", () => {
		render(<ForgetPasswordForm />);

		expect(screen.getByRole("heading", { name: /forgot password/i })).toBeInTheDocument();
		expect(screen.getByTestId("go-back-button")).toBeInTheDocument();
		expect(getEmailInput()).toBeInTheDocument();
		expect(getSubmitButton()).toBeInTheDocument();
	});

	it("navigates back to sign-in when clicking Go Back", async () => {
		render(<ForgetPasswordForm />);

		await userEvent.click(screen.getByTestId("go-back-button"));

		expect(mockRouter.push).toHaveBeenCalledWith(routes.auth.signIn);
	});

	it("disables button if email is not valid or empty", async () => {
		render(<ForgetPasswordForm />);

		const submitBtn = getSubmitButton();
		const emailInput = getEmailInput();

		expect(submitBtn).toBeDisabled();

		await user.type(emailInput, userEmail);

		expect(submitBtn).not.toBeDisabled();
	});

	it("calls mutate with correct payload", async () => {
		render(<ForgetPasswordForm />);

		const emailInput = getEmailInput();
		await user.type(emailInput, userEmail);

		await user.click(getSubmitButton());

		await waitFor(() => {
			expect(mutateMock).toHaveBeenCalledTimes(1);
			expect(mutateMock).toHaveBeenCalledWith({ email: userEmail }, expect.any(Object));
		});
	});

	it("shows loader and disables button when mutation pending", async () => {
		isPending = true;

		render(<ForgetPasswordForm />);

		const emailInput = getEmailInput();
		await user.type(emailInput, userEmail);

		const submitBtn = getSubmitButton();
		await user.click(submitBtn);

		expect(screen.getByTestId("loader2-icon")).toBeInTheDocument();
		expect(submitBtn).toBeDisabled();
	});

	it("shows success message after onSuccess and hides submit button", async () => {
		mutateMock.mockImplementation((_data, { onSuccess }) => {
			onSuccess();
		});

		render(<ForgetPasswordForm />);

		await userEvent.type(getEmailInput(), userEmail);

		await userEvent.click(getSubmitButton());

		await waitFor(() => {
			expect(screen.getByText(/email sent successfully/i)).toBeInTheDocument();

			expect(screen.queryByRole("button", { name: /forgot password/i })).not.toBeInTheDocument();
		});
	});

	it("shows field error message returned by server", async () => {
		const fakeError = {
			response: {
				data: {
					message: "User does not exist",
				},
			},
		};

		mutateMock.mockImplementation((_data, { onError }) => {
			onError(fakeError);
		});

		render(<ForgetPasswordForm />);

		await user.type(getEmailInput(), userEmail);

		await user.click(getSubmitButton());

		expect(await screen.findByText(/user does not exist/i)).toBeInTheDocument();
	});

	it("falls back to generic error message if server response has no message", async () => {
		const fakeError = { response: { data: {} } };

		mutateMock.mockImplementation((_data, { onError }) => {
			onError(fakeError);
		});

		render(<ForgetPasswordForm />);

		await user.type(getEmailInput(), userEmail);

		await user.click(getSubmitButton());

		expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
	});

	it("falls back to the generic message when the API is unreachable", async () => {
		mutateMock.mockImplementation((_data, { onError }) => {
			onError(networkError());
		});

		render(<ForgetPasswordForm />);

		await user.type(getEmailInput(), userEmail);
		await user.click(getSubmitButton());

		expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
	});

	it("falls back to the generic message when the error response has no body", async () => {
		mutateMock.mockImplementation((_data, { onError }) => {
			onError(nullBodyError());
		});

		render(<ForgetPasswordForm />);

		await user.type(getEmailInput(), userEmail);
		await user.click(getSubmitButton());

		expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
	});

	it("renders the button label, not the spinner, while no request is in flight", () => {
		render(<ForgetPasswordForm />);

		expect(getSubmitButton()).toHaveTextContent(/forgot password/i);
		expect(screen.queryByTestId("loader2-icon")).not.toBeInTheDocument();
		// Nothing has been sent yet, so there should be no success banner — not even an empty one.
		expect(screen.queryByTestId("forgot-password-success")).not.toBeInTheDocument();
	});
});
