import { screen, waitFor } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { vi } from "vitest";

import { routes } from "@/config/routes";
import { MFA_AUTH_CONTEXT_VALUES } from "@/lib/constants/paths";
import type { SignInCallbacks, SignInSuccessData } from "@/module/auth/__tests__/types/mutation-types";
import SignInForm from "@/module/auth/templates/sign-in-form";
import type { IUserLoginData } from "@/module/auth/types";
import { useMenuStore } from "@/stores/menu-store";
import { networkError, nullBodyError } from "@/tests/utils/mock-api-errors";
import { cookiesUtilsMocks } from "@/tests/utils/mock-cookies-utils";
import { mockRouter } from "@/tests/utils/mock-next-navigation";
import { renderWithProviders } from "@/tests/utils/mock-providers";
import { COOKIES, ROLES } from "@/types";
import type { IUser } from "@/types";

type SetMenuForUser = ReturnType<typeof useMenuStore.getState>["setMenuForUser"];

// We'll mock the auth hook that the component uses. The component expects
// useAuthAPI() to return an object with { useLoginMutation } and
// useLoginMutation contains { mutate, isPending }

const mutateMock = vi.fn<(payload: IUserLoginData, callbacks: SignInCallbacks) => void>();
let isPending = false;
vi.mock("@/module/auth/hooks/useAuth", () => ({
	useAuthAPI: () => ({
		useLoginMutation: () => ({
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

// Mock react-icons used in the component
vi.mock("react-icons/pi", async (importOriginal) => {
	const actual = await importOriginal<Record<string, unknown>>();
	return {
		...actual,
		PiArrowRightBold: () => <span data-testid="arrow" />,
	};
});

const getFormElements = () => {
	return {
		emailInput: screen.getByRole("textbox", { name: /email/i }),
		passwordInput: screen.getByLabelText(/password/i, { selector: 'input[type="password"]' }),
	};
};
const getSubmitButton = () => screen.getByTestId("signin-btn");

const submitForm = async (user: UserEvent, email: string, password: string) => {
	const { emailInput, passwordInput } = getFormElements();

	// Fill the form so button is not disabled due to validation
	await user.type(emailInput, email);
	await user.type(passwordInput, password);

	// Click the submit button
	await user.click(getSubmitButton());
};

function renderComponent() {
	return renderWithProviders(<SignInForm />);
}

describe("SignInForm Template", () => {
	let user: UserEvent;
	beforeEach(() => {
		vi.clearAllMocks();
		isPending = false;
		user = userEvent.setup();
	});

	it("renders form inputs, links and submit button", () => {
		renderComponent();
		const { emailInput, passwordInput } = getFormElements();
		// Inputs
		expect(emailInput).toBeInTheDocument();

		expect(passwordInput).toBeInTheDocument();

		// Links
		expect(screen.getByRole("link", { name: /sign in with magic link/i })).toHaveAttribute(
			"href",
			routes.auth.requestLoginMagicLink
		);
		expect(screen.getByRole("link", { name: /sign in with otp/i })).toHaveAttribute(
			"href",
			routes.auth.requestLoginOtp
		);
		expect(screen.getByRole("link", { name: /reset password/i })).toHaveAttribute("href", routes.auth.forgotPassword);

		// // Button
		expect(getSubmitButton()).toBeInTheDocument();
	});

	it("disables submit button when form is invalid", async () => {
		renderComponent();
		const { emailInput, passwordInput } = getFormElements();
		const btn = screen.getByRole("button", { name: /sign in/i }) as HTMLButtonElement;
		// Initially invalid (empty fields)
		expect(getSubmitButton()).toBeDisabled();

		// Fill only email (invalid password still)
		await user.type(emailInput, "test@example.com");
		expect(btn).toBeDisabled();

		// Fill password too -> should enable
		await user.type(passwordInput, "password123");
		await waitFor(() => expect(btn).not.toBeDisabled());
	});

	it("calls mutate with correct payload on submit", async () => {
		renderComponent();

		await submitForm(user, "user@site.test", "secretpass");

		await waitFor(() => {
			expect(mutateMock).toHaveBeenCalledTimes(1);
			expect(mutateMock).toHaveBeenCalledWith(
				{ email: "user@site.test", password: "secretpass", loginType: "password" },
				expect.any(Object)
			);
		});
	});

	it("shows loader icon when login is pending", async () => {
		// Turn on pending flag
		isPending = true;
		renderComponent();

		await submitForm(user, "user@site.test", "secretpass");

		// Since isPending is true, the button should show loader from lucide mock
		expect(screen.getByTestId("loader2-icon")).toBeInTheDocument();
	});

	it("onSuccess sets cookies and redirects user", async () => {
		// Make mutate call invoke onSuccess
		mutateMock.mockImplementation((_payload, { onSuccess }) => {
			onSuccess({
				user: { roles: ROLES.USER, companyRef: { _id: "comp123" }, _id: "abc123", email: "test@x.test" },
			});
		});

		renderComponent();

		await submitForm(user, "test@x.test", "pw");

		await waitFor(() => {
			expect(mockRouter.replace).toHaveBeenCalledWith(expect.any(String));
		});
	});

	describe("post-login MFA routing", () => {
		const DEFAULT_REDIRECT = "/dashboard";
		const setMenuForUserMock = vi.fn<SetMenuForUser>(() => ({
			menuItems: [],
			settingsMenuItems: [],
			defaultRedirectUrl: DEFAULT_REDIRECT,
			permissions: [],
			role: null,
		}));

		const loginUser = (mfa?: IUser["mfa"]): SignInSuccessData["user"] => ({
			roles: ROLES.USER,
			companyRef: { _id: "comp123" },
			_id: "abc123",
			email: "user@x.test",
			...(mfa ? { mfa } : {}),
		});

		const resolveLoginWith = (user: SignInSuccessData["user"], isPasswordExpired = false) =>
			mutateMock.mockImplementation((_payload, { onSuccess }) => {
				onSuccess({ user, isPasswordExpired });
			});

		beforeEach(() => {
			setMenuForUserMock.mockClear();
			useMenuStore.setState({ setMenuForUser: setMenuForUserMock });
		});

		it("sends a fully enrolled MFA user to the verification step", async () => {
			resolveLoginWith(loginUser({ enabled: true, enrolled: true }));
			renderComponent();

			await submitForm(user, "user@x.test", "pw");

			await waitFor(() => {
				expect(mockRouter.replace).toHaveBeenCalledWith(routes.auth.mfaVerify);
			});
			expect(cookiesUtilsMocks.setCookies).toHaveBeenCalledWith(
				{ [COOKIES.MFA_AUTH_CONTEXT]: MFA_AUTH_CONTEXT_VALUES.VERIFICATION },
				1 / 24
			);
			expect(setMenuForUserMock).not.toHaveBeenCalled();
		});

		it.each([
			["enabled but not enrolled", { enabled: true, enrolled: false }],
			["enrolled but not enabled", { enabled: false, enrolled: true }],
			["neither enabled nor enrolled", { enabled: false, enrolled: false }],
		])("sends a user %s to their default route", async (_label, mfa) => {
			resolveLoginWith(loginUser(mfa));
			renderComponent();

			await submitForm(user, "user@x.test", "pw");

			await waitFor(() => {
				expect(mockRouter.replace).toHaveBeenCalledWith(DEFAULT_REDIRECT);
			});
			expect(mockRouter.replace).not.toHaveBeenCalledWith(routes.auth.mfaVerify);
			expect(cookiesUtilsMocks.setCookies).not.toHaveBeenCalled();
		});

		it("treats a user without an mfa object as not requiring verification", async () => {
			resolveLoginWith(loginUser());
			renderComponent();

			await submitForm(user, "user@x.test", "pw");

			await waitFor(() => {
				expect(mockRouter.replace).toHaveBeenCalledWith(DEFAULT_REDIRECT);
			});
			expect(mockRouter.replace).not.toHaveBeenCalledWith(routes.auth.mfaVerify);
		});

		it("builds the menu as a non-impersonating user", async () => {
			resolveLoginWith(loginUser({ enabled: false, enrolled: false }));
			renderComponent();

			await submitForm(user, "user@x.test", "pw");

			await waitFor(() => {
				expect(setMenuForUserMock).toHaveBeenCalledWith(expect.objectContaining({ _id: "abc123" }), false);
			});
		});

		it("diverts to change-password when the password has expired", async () => {
			resolveLoginWith(loginUser({ enabled: true, enrolled: true }), true);
			renderComponent();

			await submitForm(user, "user@x.test", "pw");

			await waitFor(() => {
				expect(mockRouter.replace).toHaveBeenCalledWith(routes.settings.changePassword);
			});
			expect(mockRouter.replace).not.toHaveBeenCalledWith(routes.auth.mfaVerify);
			expect(setMenuForUserMock).not.toHaveBeenCalled();
		});
	});

	it("handles USER_NOT_FOUND error by setting email field error", async () => {
		// Simulate AxiosError shape with response.data.messageCode
		const fakeError = {
			response: {
				data: {
					messageCode: "USER_NOT_FOUND",
				},
			},
		};

		mutateMock.mockImplementation((_payload, { onError }) => {
			onError(fakeError);
		});

		renderComponent();

		await submitForm(user, "notfound@x.test", "pw");

		await waitFor(() => {
			// The component uses react-hook-form setError which shows the message in the UI
			expect(screen.getByText(/user not found! please check your email and try again\./i)).toBeInTheDocument();
		});
	});

	it("handles generic server error by setting password error and clearing email error", async () => {
		const fakeError = {
			response: {
				data: {
					message: "Invalid credentials",
				},
			},
		};

		mutateMock.mockImplementation((_payload, { onError }) => {
			onError(fakeError);
		});

		renderComponent();

		await submitForm(user, "user@x.test", "wrong");

		await waitFor(() => {
			expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
		});
	});

	it("shows a form-level lock message and keeps the reset link when the account is locked", async () => {
		const fakeError = {
			response: {
				data: {
					messageCode: "ACCOUNT_LOCKED",
					message: "Too many failed login attempts. Please try again in a few minutes.",
				},
			},
		};

		mutateMock.mockImplementation((_payload, { onError }) => {
			onError(fakeError);
		});

		renderComponent();

		await submitForm(user, "user@x.test", "wrong");

		await waitFor(() => {
			expect(screen.getByRole("alert")).toHaveTextContent(/too many failed login attempts/i);
		});
		// The reset link must remain reachable so the user can recover.
		expect(screen.getByRole("link", { name: /reset password/i })).toHaveAttribute(
			"href",
			routes.auth.forgotPassword,
		);
	});

	it("shows a form-level message when the lock requires a password reset", async () => {
		const fakeError = {
			response: {
				data: {
					messageCode: "ACCOUNT_LOCKED_RESET_REQUIRED",
					message: "Your account is locked due to too many failed login attempts. Please reset your password to continue.",
				},
			},
		};

		mutateMock.mockImplementation((_payload, { onError }) => {
			onError(fakeError);
		});

		renderComponent();

		await submitForm(user, "user@x.test", "wrong");

		await waitFor(() => {
			expect(screen.getByRole("alert")).toHaveTextContent(/please reset your password/i);
		});
	});

	it("falls back to generic error message when server message missing", async () => {
		const fakeError = {
			response: {
				data: {},
			},
		};

		mutateMock.mockImplementation((_payload, { onError }) => {
			onError(fakeError);
		});

		renderComponent();

		await submitForm(user, "user@x.test", "wrong");

		await waitFor(() => {
			expect(screen.getByText(/something went wrong!/i)).toBeInTheDocument();
		});
	});

	it("falls back to the generic message when the API is unreachable", async () => {
		mutateMock.mockImplementation((_payload, { onError }) => {
			onError(networkError());
		});

		renderComponent();

		await submitForm(user, "user@x.test", "wrong");

		expect(await screen.findByText(/something went wrong!/i)).toBeInTheDocument();
	});

	it("falls back to the generic message when the error response has no body", async () => {
		mutateMock.mockImplementation((_payload, { onError }) => {
			onError(nullBodyError());
		});

		renderComponent();

		await submitForm(user, "user@x.test", "wrong");

		expect(await screen.findByText(/something went wrong!/i)).toBeInTheDocument();
	});
});
