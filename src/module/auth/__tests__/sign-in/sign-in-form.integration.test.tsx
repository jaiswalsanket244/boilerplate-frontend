import { screen, waitFor } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { vi } from "vitest";

import { routes } from "@/config/routes";
import { ERROR_CODES } from "@/lib/constants/error-codes";
import { MFA_AUTH_CONTEXT_VALUES } from "@/lib/constants/paths";
import SignInForm from "@/module/auth/templates/sign-in-form";
import { resetMenuStore } from "@/tests/utils/menu-store-helpers";
import { mockPost } from "@/tests/utils/mock-api-client";
import { cookiesUtilsMocks } from "@/tests/utils/mock-cookies-utils";
import { mockRouter } from "@/tests/utils/mock-next-navigation";
import { mockOneSignalLogin } from "@/tests/utils/mock-onesignal";
import { renderWithProviders } from "@/tests/utils/mock-providers";
import { COOKIES } from "@/types";

/**
 ====================================================
  sign-in form integration (real form + real useAuthAPI hook)
 ====================================================
 */

// Unlike sign-in-form.test.tsx, this does NOT mock useAuth — the real hook runs and
// only the network (apiClient) and OneSignal are stubbed, so a user typing and clicking
// exercises the whole path: form -> hook -> store -> redirect / inline error.

const loggedInUser = {
	_id: "u1",
	email: "user@site.test",
	roles: "user",
	permissions: [],
	mfa: { enabled: false, enrolled: false },
};

// apiClient resolves an axios response ({ data }); its body is our ApiResponse ({ data }).
const loginResponse = (overrides = {}) => ({
	data: { data: { token: "t", user: loggedInUser, isPasswordExpired: false, ...overrides } },
});

const signIn = async (user: UserEvent, email = "user@site.test", password = "secretpass") => {
	await user.type(screen.getByRole("textbox", { name: /email/i }), email);
	await user.type(screen.getByLabelText(/password/i, { selector: 'input[type="password"]' }), password);
	await user.click(screen.getByTestId("signin-btn"));
};

describe("SignInForm integration", () => {
	let user: UserEvent;

	beforeEach(() => {
		vi.clearAllMocks();
		resetMenuStore();
		mockOneSignalLogin.mockResolvedValue(undefined);
		user = userEvent.setup();
	});

	it("posts the typed credentials to /auth/login and redirects into the app", async () => {
		mockPost.mockResolvedValue(loginResponse());

		renderWithProviders(<SignInForm />);
		await signIn(user);

		await waitFor(() =>
			expect(mockPost).toHaveBeenCalledWith("/auth/login", {
				email: "user@site.test",
				password: "secretpass",
				loginType: "password",
			})
		);
		await waitFor(() => expect(mockOneSignalLogin).toHaveBeenCalledWith("u1"));
		await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith(expect.any(String)));
	});

	it("redirects to change-password when the account's password has expired", async () => {
		mockPost.mockResolvedValue(loginResponse({ isPasswordExpired: true }));

		renderWithProviders(<SignInForm />);
		await signIn(user);

		await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith(routes.settings.changePassword));
	});

	it("sends an MFA-enrolled user to the verify step and stores the verification context", async () => {
		mockPost.mockResolvedValue(loginResponse({ user: { ...loggedInUser, mfa: { enabled: true, enrolled: true } } }));

		renderWithProviders(<SignInForm />);
		await signIn(user);

		await waitFor(() =>
			expect(cookiesUtilsMocks.setCookies).toHaveBeenCalledWith(
				{ [COOKIES.MFA_AUTH_CONTEXT]: MFA_AUTH_CONTEXT_VALUES.VERIFICATION },
				expect.any(Number)
			)
		);
		expect(mockRouter.replace).toHaveBeenCalledWith(routes.auth.mfaVerify);
	});

	it("shows an inline email error and does not redirect when the user is not found", async () => {
		mockPost.mockRejectedValue({ response: { data: { messageCode: ERROR_CODES.USER_NOT_FOUND } } });

		renderWithProviders(<SignInForm />);
		await signIn(user, "missing@site.test");

		expect(await screen.findByText(/user not found! please check your email and try again\./i)).toBeInTheDocument();
		expect(mockRouter.replace).not.toHaveBeenCalled();
	});

	it("shows the server's error message on a rejected password", async () => {
		mockPost.mockRejectedValue({ response: { data: { message: "Invalid credentials" } } });

		renderWithProviders(<SignInForm />);
		await signIn(user);

		expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
		expect(mockRouter.replace).not.toHaveBeenCalled();
	});
});
