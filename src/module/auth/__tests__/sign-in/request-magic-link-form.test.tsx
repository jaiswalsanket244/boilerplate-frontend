import { render, screen, waitFor } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";

import { routes } from "@/config/routes";
import type { EmailOnlyCallbacks, EmailOnlyPayload } from "@/module/auth/__tests__/types/mutation-types";
import RequestMagicLinkForm from "@/module/auth/templates/request-magic-link-form";
import { networkError, nullBodyError, serverError } from "@/tests/utils/mock-api-errors";
import { mockQueryClient } from "@/tests/utils/mock-react-query";

const mutateMock = vi.fn<(payload: EmailOnlyPayload, callbacks: EmailOnlyCallbacks) => void>();
let isPending = false;

vi.mock("@/module/auth/hooks/useAuth", () => ({
	useAuthAPI: () => ({
		useRequestMagicLinkMutation: {
			mutate: (...args: Parameters<typeof mutateMock>) => mutateMock(...args),
			get isPending() {
				return isPending;
			},
		},
	}),
}));

const resetAll = () => {
	vi.clearAllMocks();
	isPending = false;
};

const getSubmitButton = () => screen.getByRole("button");
const getEmailInput = () => screen.getByLabelText(/email/i);

describe("RequestMagicLinkForm template", () => {
	let user: UserEvent;
	beforeEach(() => {
		user = userEvent.setup();
		resetAll();
	});

	it("renders header links, email input and submit button", () => {
		render(<RequestMagicLinkForm />);

		expect(screen.getByRole("heading", { name: /sign in/i })).toBeInTheDocument();

		expect(screen.getByRole("link", { name: /sign in with a password/i })).toHaveAttribute("href", routes.auth.signIn);
		expect(screen.getByRole("link", { name: /sign in with otp/i })).toHaveAttribute(
			"href",
			routes.auth.requestLoginOtp
		);

		expect(getEmailInput()).toBeInTheDocument();

		expect(getSubmitButton()).toBeInTheDocument();
	});

	it("disables submit button when form is invalid and enables after valid email", async () => {
		render(<RequestMagicLinkForm />);

		const submitBtn = getSubmitButton();
		const emailInput = getEmailInput();

		expect(submitBtn).toBeDisabled();

		await user.type(emailInput, "not-an-email");
		expect(submitBtn).toBeDisabled();

		await user.clear(emailInput);
		await user.type(emailInput, "user@example.test");
		await waitFor(() => expect(submitBtn).not.toBeDisabled());
	});

	it("calls mutate with correct payload when submitting", async () => {
		render(<RequestMagicLinkForm />);

		await user.type(getEmailInput(), "user@x.test");

		await user.click(getSubmitButton());

		await waitFor(() => {
			expect(mutateMock).toHaveBeenCalledTimes(1);
			expect(mutateMock).toHaveBeenCalledWith({ email: "user@x.test" }, expect.any(Object));
		});
	});

	it("shows loader and disables button when mutation is pending", async () => {
		isPending = true;
		render(<RequestMagicLinkForm />);

		await user.type(getEmailInput(), "user@x.test");

		const submitBtn = screen.getByRole("button");
		await user.click(submitBtn);

		expect(screen.getByTestId("loader2-icon")).toBeInTheDocument();

		expect(submitBtn).toBeDisabled();
	});

	it("onSuccess sets query data & defaults and shows success message", async () => {
		mutateMock.mockImplementation((_payload, { onSuccess }) => {
			onSuccess?.();
		});

		render(<RequestMagicLinkForm />);

		await user.type(getEmailInput(), "user@x.test");

		await user.click(getSubmitButton());

		await waitFor(() => {
			expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(["signInUserData"], { email: "user@x.test" });

			// 15 minutes. The next screen reads this cached data, so the exact window matters.
			expect(mockQueryClient.setQueryDefaults).toHaveBeenCalledWith(
				["signInUserData"],
				expect.objectContaining({ gcTime: 900_000, staleTime: 900_000 })
			);

			expect(screen.getByText(/email sent successfully/i)).toBeInTheDocument();
		});
	});

	it("handles EMAIL_NOT_FOUND by setting form error visible to user", async () => {
		const fakeError = {
			response: {
				data: {
					messageCode: "EMAIL_NOT_FOUND",
				},
			},
		};

		mutateMock.mockImplementation((_payload, { onError }) => {
			onError(fakeError);
		});

		render(<RequestMagicLinkForm />);

		await user.type(getEmailInput(), "notfound@x.test");

		await user.click(getSubmitButton());

		await waitFor(() => {
			expect(screen.getByText(/email not found/i)).toBeInTheDocument();
		});
	});

	/*
	  Error handling below the EMAIL_NOT_FOUND branch. 
	*/

	it("surfaces the server message for a failure that is not EMAIL_NOT_FOUND", async () => {
		mutateMock.mockImplementation((_payload, { onError }) => {
			onError(serverError("Too many requests. Try again later.", "RATE_LIMITED"));
		});

		render(<RequestMagicLinkForm />);

		await user.type(getEmailInput(), "user@x.test");
		await user.click(getSubmitButton());

		expect(await screen.findByText(/too many requests/i)).toBeInTheDocument();
		expect(screen.queryByText(/email not found/i)).not.toBeInTheDocument();
	});

	it("falls back to the generic message when the API is unreachable", async () => {
		mutateMock.mockImplementation((_payload, { onError }) => {
			onError(networkError());
		});

		render(<RequestMagicLinkForm />);

		await user.type(getEmailInput(), "user@x.test");
		await user.click(getSubmitButton());

		expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
	});

	it("falls back to the generic message when the error response has no body", async () => {
		mutateMock.mockImplementation((_payload, { onError }) => {
			onError(nullBodyError());
		});

		render(<RequestMagicLinkForm />);

		await user.type(getEmailInput(), "user@x.test");
		await user.click(getSubmitButton());

		expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
	});

	it("renders the button label, not the spinner, while no request is in flight", async () => {
		render(<RequestMagicLinkForm />);

		expect(getSubmitButton()).toHaveTextContent(/get magic link/i);
		expect(screen.queryByTestId("loader2-icon")).not.toBeInTheDocument();
	});
});
