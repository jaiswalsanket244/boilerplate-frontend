import { screen, waitFor } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { vi } from "vitest";

import { routes } from "@/config/routes";
import type { SignUpCallbacks, SignUpPayload } from "@/module/auth/__tests__/types/mutation-types";
import SignUpForm from "@/module/auth/templates/sign-up-form";
import { OTP_PURPOSE } from "@/module/auth/types";
import { networkError, nullBodyError, serverError } from "@/tests/utils/mock-api-errors";
import { mockRouter, mockSearchParams } from "@/tests/utils/mock-next-navigation";
import { renderWithProviders } from "@/tests/utils/mock-providers";
import { mockQueryClient } from "@/tests/utils/mock-react-query";

const mutateMock = vi.fn<(payload: SignUpPayload, callbacks: SignUpCallbacks) => void>();

let isPending = false;

vi.mock("@/module/auth/hooks/useAuth", () => ({
	useAuthAPI: () => ({
		useGetEmailsFromTokenMutation: () => ({
			mutate: (...args: Parameters<typeof mutateMock>) => mutateMock(...args),
			get isPending() {
				return isPending;
			},
		}),
		useRequestOtpMutation: () => ({
			mutate: (...args: Parameters<typeof mutateMock>) => mutateMock(...args),
			get isPending() {
				return isPending;
			},
		}),
		useSocialRegisterMutation: () => ({
			mutate: vi.fn(),
		}),
	}),
}));

const renderForm = () => {
	return renderWithProviders(<SignUpForm />);
};

const fillForm = async (user: ReturnType<typeof userEvent.setup>) => {
	await user.type(screen.getByRole("textbox", { name: /first name/i }), "John");
	await user.type(screen.getByRole("textbox", { name: /last name/i }), "Doe");
	await user.type(screen.getByRole("textbox", { name: /email/i }), "john@example.com");
};

const getSubmitButton = () => screen.getByTestId("signup-button");

describe("SignUpForm template", () => {
	let user: UserEvent;
	beforeEach(() => {
		user = userEvent.setup();
		vi.clearAllMocks();
		isPending = false;
	});

	it("renders all inputs & submit button", () => {
		renderForm();

		expect(screen.getByRole("textbox", { name: /first name/i })).toBeInTheDocument();
		expect(screen.getByRole("textbox", { name: /last name/i })).toBeInTheDocument();
		expect(screen.getByRole("textbox", { name: /email/i })).toBeInTheDocument();

		expect(screen.getByRole("button", { name: /verify email/i })).toBeInTheDocument();
	});

	it("prefills email when invite token is valid and disables the email input field", async () => {
		mutateMock.mockImplementation((_payload, { onSuccess }) => {
			onSuccess({ data: "invited@xyz.com" });
		});

		mockSearchParams.get.mockImplementation((key) => (key === "inviteToken" ? "INVITE_TOKEN" : null));

		renderForm();

		// Mutation should be called
		await waitFor(() => {
			expect(mutateMock).toHaveBeenCalledWith({ inviteToken: "INVITE_TOKEN" }, expect.any(Object));
		});

		// Email field prefilled
		expect(screen.getByRole("textbox", { name: /email/i })).toHaveValue("invited@xyz.com");
		expect(screen.getByRole("textbox", { name: /email/i })).toBeDisabled();
		expect(screen.queryByText(/your token is expired/i)).not.toBeInTheDocument();
	});

	it("shows token expired message when invite token fails", async () => {
		mutateMock.mockImplementation((_payload, { onError }) => onError(serverError("Invite token expired")));

		mockSearchParams.get.mockImplementation((k) => (k === "inviteToken" ? "BADTOKEN" : null));

		renderForm();

		await waitFor(() => {
			expect(mutateMock).toHaveBeenCalledWith({ inviteToken: "BADTOKEN" }, expect.any(Object));
		});

		expect(await screen.findByText(/your token is expired/i)).toBeInTheDocument();
	});

	it("submit button disabled until valid form is filled", async () => {
		mockSearchParams.get.mockImplementation(() => null);

		renderForm();

		const btn = screen.getByTestId("signup-button");
		expect(btn).toBeDisabled();

		await fillForm(user);

		await waitFor(() => {
			expect(btn).not.toBeDisabled();
		});
	});

	it("calls sendEmailOtp with correct payload", async () => {
		renderForm();

		await fillForm(user);

		await user.click(getSubmitButton());

		await waitFor(() => {
			expect(mutateMock).toHaveBeenCalledWith(
				{ identifier: "john@example.com", purpose: OTP_PURPOSE.SIGNUP },
				expect.any(Object)
			);
		});
	});

	it("redirects & stores react-query data on success", async () => {
		mutateMock.mockImplementation((_payload, { onSuccess }) => onSuccess());

		renderForm();

		await fillForm(user);
		await user.click(getSubmitButton());

		await waitFor(() => {
			expect(mockRouter.push).toHaveBeenCalledWith(routes.auth.verifySignUpOtp);
			expect(mockRouter.push).toHaveBeenCalledWith(routes.auth.verifySignUpOtp);
		});
	});

	it("shows server error message from OTP request", async () => {
		mutateMock.mockImplementation((_payload, { onError }) =>
			onError({ response: { data: { message: "Email already exists" } } })
		);
		renderForm();

		await fillForm(user);
		await user.click(getSubmitButton());

		expect(await screen.findByText(/email already exists/i)).toBeInTheDocument();
	});

	it("shows fallback error when server message missing", async () => {
		mutateMock.mockImplementation((_payload, { onError }) => onError({ response: { data: {} } }));
		mockSearchParams.get.mockImplementation(() => null);

		const user = userEvent.setup();
		renderForm();

		await fillForm(user);
		await user.click(getSubmitButton());

		expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
	});

	it("shows loader when OTP mutation is pending", async () => {
		mockSearchParams.get.mockImplementation(() => null);
		isPending = true;
		const user = userEvent.setup();
		renderForm();

		await fillForm(user);
		await user.click(getSubmitButton());

		expect(screen.getByTestId("loader2-icon")).toBeInTheDocument();
	});

	it("falls back to the generic message when the API is unreachable", async () => {
		mutateMock.mockImplementation((_payload, { onError }) => onError(networkError()));
		mockSearchParams.get.mockImplementation(() => null);

		renderForm();

		await fillForm(user);
		await user.click(getSubmitButton());

		expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
	});

	it("falls back to the generic message when the error response has no body", async () => {
		mutateMock.mockImplementation((_payload, { onError }) => onError(nullBodyError()));
		mockSearchParams.get.mockImplementation(() => null);

		renderForm();

		await fillForm(user);
		await user.click(getSubmitButton());

		expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
	});

	it("shows no error paragraph before a request has failed", () => {
		mockSearchParams.get.mockImplementation(() => null);

		renderForm();

		expect(screen.queryByTestId("signup-error")).not.toBeInTheDocument();
		expect(getSubmitButton()).toHaveTextContent(/verify email/i);
	});

	it("caches the signup data without an invite token for 15 minutes", async () => {
		mutateMock.mockImplementation((_payload, { onSuccess }) => onSuccess());
		mockSearchParams.get.mockImplementation(() => null);

		renderForm();

		await fillForm(user);
		await user.click(getSubmitButton());

		await waitFor(() => {
			// An exact match, so an unexpected invite token would fail this.
			expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(["signupUserData"], {
				firstName: "John",
				lastName: "Doe",
				email: "john@example.com",
			});
		});
		expect(mockQueryClient.setQueryDefaults).toHaveBeenCalledWith(
			["signupUserData"],
			expect.objectContaining({ gcTime: 900_000, staleTime: 900_000 })
		);
	});

	it("carries the invite token into the cached signup data", async () => {
		mutateMock.mockImplementation((payload, callbacks) =>
			"inviteToken" in payload ? callbacks.onSuccess({ data: "invited@xyz.com" }) : callbacks.onSuccess()
		);
		mockSearchParams.get.mockImplementation((k) => (k === "inviteToken" ? "INVITE_TOKEN" : null));

		renderForm();

		await user.type(screen.getByRole("textbox", { name: /first name/i }), "John");
		await user.type(screen.getByRole("textbox", { name: /last name/i }), "Doe");
		await user.click(getSubmitButton());

		await waitFor(() => {
			expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(
				["signupUserData"],
				expect.objectContaining({ inviteToken: "INVITE_TOKEN" })
			);
		});
	});
});
