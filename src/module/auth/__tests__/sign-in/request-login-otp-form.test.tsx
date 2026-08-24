import { screen, waitFor } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";

import { routes } from "@/config/routes";
import type { RequestOtpCallbacks } from "@/module/auth/__tests__/types/mutation-types";
import RequestLoginForm from "@/module/auth/templates/request-login-otp-form";
import { type IRequestOtpParams, OTP_PURPOSE } from "@/module/auth/types";
import { networkError, nullBodyError, serverError } from "@/tests/utils/mock-api-errors";
import { mockRouter } from "@/tests/utils/mock-next-navigation";
import { renderWithProviders } from "@/tests/utils/mock-providers";
import { mockQueryClient } from "@/tests/utils/mock-react-query";

let isPending = false;
const mutateMock = vi.fn<(payload: IRequestOtpParams, callbacks: RequestOtpCallbacks) => void>();

vi.mock("@/module/auth/hooks/useAuth", () => ({
	useAuthAPI: () => ({
		useRequestOtpMutation: () => ({
			mutate: mutateMock,
			get isPending() {
				return isPending;
			},
		}),
	}),
}));

const renderComponent = () => {
	return renderWithProviders(<RequestLoginForm />);
};

const getEmailInput = () => screen.getByRole("textbox", { name: /email/i });
const getSubmitButton = () => screen.getByTestId("send-otp-button");

describe("Request Login Form template", () => {
	const userEmail = "user@example.com";
	let user: UserEvent;

	beforeEach(() => {
		vi.clearAllMocks();
		isPending = false;
		user = userEvent.setup();
	});

	it("renders header, inputs and submit button", () => {
		renderComponent();

		expect(screen.getByRole("heading", { name: /sign in/i })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /sign in with a password/i })).toHaveAttribute("href", routes.auth.signIn);
		expect(screen.getByRole("link", { name: /sign in with a magic link/i })).toHaveAttribute(
			"href",
			routes.auth.requestLoginMagicLink
		);

		expect(getEmailInput()).toBeInTheDocument();

		expect(getSubmitButton()).toBeInTheDocument();
	});

	it("disables submit button when email is invalid and enables when email is valid", async () => {
		renderComponent();

		const submitButton = getSubmitButton();
		const emailInput = getEmailInput();

		expect(submitButton).toBeDisabled();

		await user.type(emailInput, "invalid-email");
		expect(submitButton).toBeDisabled();

		await user.clear(emailInput);
		await user.type(emailInput, userEmail);

		await waitFor(() => {
			expect(submitButton).not.toBeDisabled();
		});
	});

	it("calls the mutate with valid payload", async () => {
		renderComponent();

		await user.type(getEmailInput(), userEmail);

		await user.click(getSubmitButton());

		await waitFor(() => {
			expect(mutateMock).toHaveBeenCalledTimes(1);
			expect(mutateMock).toHaveBeenCalledWith(
				{
					identifier: userEmail,
					purpose: OTP_PURPOSE.LOGIN,
				},
				expect.any(Object)
			);
		});
	});

	it("shows loader and disables submit button when mutation is pending", async () => {
		isPending = true;
		renderComponent();

		await user.type(getEmailInput(), userEmail);

		await user.click(getSubmitButton());

		await waitFor(() => {
			expect(getSubmitButton()).toBeDisabled();
			expect(screen.getByTestId("loader2-icon")).toBeInTheDocument();
		});
	});

	it("onSuccess sets the query data, shows message and redirects to OTP page", async () => {
		renderComponent();
		mutateMock.mockImplementation((_payload, { onSuccess }) => {
			onSuccess();
		});

		await user.type(getEmailInput(), userEmail);

		await user.click(getSubmitButton());

		await waitFor(() => {
			expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(["signInUserData"], expect.any(Object));

			// 15 minutes. The verify-OTP screen reads this cached data, so the exact window matters.
			expect(mockQueryClient.setQueryDefaults).toHaveBeenCalledWith(
				["signInUserData"],
				expect.objectContaining({ gcTime: 900_000, staleTime: 900_000 })
			);

			expect(mutateMock).toHaveBeenCalledTimes(1);

			expect(mutateMock).toHaveBeenCalledWith(
				{
					identifier: userEmail,
					purpose: OTP_PURPOSE.LOGIN,
				},
				expect.any(Object)
			);
		});
		// The redirect is deliberately delayed, so it needs its own wait.
		await waitFor(() => {
			expect(mockRouter.push).toHaveBeenCalledWith(routes.auth.verifyLoginOtp);
		});
	});

	it("onError displays default error message if error message is not provided", async () => {
		mutateMock.mockImplementation((_payload, { onError }) => {
			onError();
		});

		renderComponent();

		await user.type(getEmailInput(), userEmail);

		await user.click(getSubmitButton());

		await waitFor(() => {
			expect(mockQueryClient.setQueryData).not.toHaveBeenCalled();

			expect(screen.queryByText(/something went wrong/i)).toBeInTheDocument();
		});
	});

	it("onError displays custom error message if error message is provided", async () => {
		const fakeError = {
			response: {
				data: {
					message: "Custom error message",
				},
			},
		};

		mutateMock.mockImplementation((_payload, { onError }) => {
			onError(fakeError);
		});

		renderComponent();

		await user.type(getEmailInput(), userEmail);

		await user.click(getSubmitButton());

		await waitFor(() => {
			expect(mockQueryClient.setQueryData).not.toHaveBeenCalled();

			expect(screen.queryByText(/custom error message/i)).toBeInTheDocument();
		});
	});

	it("prefers the EMAIL_NOT_FOUND copy over the message the server sent with it", async () => {
		// The server sent a code and a message together. The wording tied to the code should win.
		mutateMock.mockImplementation((_payload, { onError }) => {
			onError(serverError("No account matches that address", "EMAIL_NOT_FOUND"));
		});

		renderComponent();

		await user.type(getEmailInput(), userEmail);
		await user.click(getSubmitButton());

		expect(await screen.findByText(/^email not found$/i)).toBeInTheDocument();
		expect(screen.queryByText(/no account matches/i)).not.toBeInTheDocument();
	});

	it("falls back to the generic message when the API is unreachable", async () => {
		mutateMock.mockImplementation((_payload, { onError }) => {
			onError(networkError());
		});

		renderComponent();

		await user.type(getEmailInput(), userEmail);
		await user.click(getSubmitButton());

		expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
	});

	it("falls back to the generic message when the error response has no body", async () => {
		mutateMock.mockImplementation((_payload, { onError }) => {
			onError(nullBodyError());
		});

		renderComponent();

		await user.type(getEmailInput(), userEmail);
		await user.click(getSubmitButton());

		expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
	});

	it("renders the button label, not the spinner, while no request is in flight", () => {
		renderComponent();

		expect(getSubmitButton()).toHaveTextContent(/send otp/i);
		expect(screen.queryByTestId("loader2-icon")).not.toBeInTheDocument();
	});
});
