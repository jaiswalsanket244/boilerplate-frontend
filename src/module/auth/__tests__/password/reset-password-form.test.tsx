import { screen, waitFor } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";

import type { UpdatePasswordCallbacks, UpdatePasswordPayload } from "@/module/auth/__tests__/types/mutation-types";
import ResetPasswordForm from "@/module/auth/templates/reset-password-form";
import { networkError, nullBodyError } from "@/tests/utils/mock-api-errors";
import { mockSearchParams } from "@/tests/utils/mock-next-navigation";
import { renderWithProviders } from "@/tests/utils/mock-providers";

let searchParams: Record<string, string> = {
	token: "RESET123",
	email: "user@example.com",
};

const mutateMock = vi.fn<(payload: UpdatePasswordPayload, callbacks: UpdatePasswordCallbacks) => void>();
let isPending = false;

vi.mock("@/module/auth/hooks/useAuth", () => ({
	useAuthAPI: () => ({
		useUpdatePasswordMutation: {
			mutate: mutateMock,
			get isPending() {
				return isPending;
			},
		},
	}),
}));

const renderComponent = () => {
	return renderWithProviders(<ResetPasswordForm />);
};

const fillPasswords = async (user: UserEvent, pass: string, confirm: string) => {
	await user.type(screen.getByLabelText("Password"), pass);
	await user.type(screen.getByLabelText(/confirm password/i), confirm);
};

const getSubmitButton = () => screen.getByTestId("reset-password-button");

describe("Reset Password Form template", () => {
	let user: UserEvent;
	beforeEach(() => {
		vi.clearAllMocks();
		isPending = false;
		searchParams = {
			token: "RESET123",
			email: "user@example.com",
		};

		user = userEvent.setup();
	});

	test("renders heading, fields and button", () => {
		renderComponent();

		expect(screen.getByRole("heading", { name: /reset password/i, level: 1 })).toBeInTheDocument();
		expect(screen.getByLabelText("Password")).toBeInTheDocument();
		expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
		expect(getSubmitButton()).toBeInTheDocument();
	});

	test("button is disabled initially (form invalid)", async () => {
		renderComponent();

		const button = getSubmitButton();

		expect(button).toBeDisabled();
	});

	test("button becomes enabled when form is valid", async () => {
		renderComponent();

		await fillPasswords(user, "Abc1234!", "Abc1234!");

		await waitFor(() => {
			expect(getSubmitButton()).not.toBeDisabled();
		});
	});

	test("calls mutate with correct payload and token", async () => {
		mockSearchParams.get.mockImplementation((key: string) => searchParams[key] ?? null);
		renderComponent();

		await fillPasswords(user, "Abc1234!", "Abc1234!");

		await user.click(getSubmitButton());

		await waitFor(() => {
			expect(mutateMock).toHaveBeenCalledTimes(1);
			expect(mutateMock).toHaveBeenCalledWith(
				{
					userData: {
						password: "Abc1234!",
						confirmPassword: "Abc1234!",
						email: "user@example.com",
					},
					token: "RESET123",
				},
				expect.any(Object)
			);
		});
	});

	test("onSuccess shows the success message", async () => {
		mutateMock.mockImplementation((_payload, opts) => {
			opts.onSuccess();
		});

		renderComponent();

		await fillPasswords(user, "Abc1234!", "Abc1234!");

		await user.click(getSubmitButton());

		await waitFor(() => {
			expect(screen.getByText(/password updated successfully!/i)).toBeInTheDocument();
		});
	});

	test("displays error message from API on failure", async () => {
		mutateMock.mockImplementation((_payload, opts) => {
			opts.onError({
				response: { data: { message: "Link expired!" } },
			});
		});

		renderComponent();

		await fillPasswords(user, "Abc1234!", "Abc1234!");

		await user.click(getSubmitButton());

		await waitFor(() => {
			expect(screen.getByText(/link expired!/i)).toBeInTheDocument();
		});
	});

	test("fallback error message shown when API gives no message", async () => {
		mutateMock.mockImplementation((_payload, opts) => {
			opts.onError({ response: { data: {} } });
		});

		renderComponent();
		const user = userEvent.setup();

		await fillPasswords(user, "Abc1234!", "Abc1234!");

		await user.click(getSubmitButton());

		await waitFor(() => {
			expect(screen.getByText(/something went wrong!/i)).toBeInTheDocument();
		});
	});

	test("shows loader when submitting", async () => {
		isPending = true;

		renderComponent();

		await fillPasswords(user, "Abc1234!", "Abc1234!");

		await user.click(getSubmitButton());

		await waitFor(() => {
			expect(screen.getByTestId("loader2-icon")).toBeInTheDocument();
		});
	});

	test("falls back to the generic message when the API is unreachable", async () => {
		mutateMock.mockImplementation((_payload, opts) => {
			opts.onError(networkError());
		});

		renderComponent();

		await fillPasswords(user, "Abc1234!", "Abc1234!");
		await user.click(getSubmitButton());

		expect(await screen.findByText(/something went wrong!/i)).toBeInTheDocument();
	});

	test("falls back to the generic message when the error response has no body", async () => {
		mutateMock.mockImplementation((_payload, opts) => {
			opts.onError(nullBodyError());
		});

		renderComponent();

		await fillPasswords(user, "Abc1234!", "Abc1234!");
		await user.click(getSubmitButton());

		expect(await screen.findByText(/something went wrong!/i)).toBeInTheDocument();
	});

	test("renders the button label and no error paragraph before anything fails", () => {
		renderComponent();

		expect(getSubmitButton()).toHaveTextContent(/reset password/i);
		expect(screen.queryByTestId("loader2-icon")).not.toBeInTheDocument();
		// Nothing has failed yet, so there should be no error line at all — not even an empty one.
		expect(screen.queryByTestId("reset-password-error")).not.toBeInTheDocument();
	});
});
