import { act, screen, waitFor } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";

import { routes } from "@/config/routes";
import { MFA_AUTH_CONTEXT_VALUES } from "@/lib/constants/paths";
import type {
	RegisterCallbacks,
	RegisterPayload,
	RegisterSuccessData,
} from "@/module/auth/__tests__/types/mutation-types";
import PasswordForm from "@/module/auth/templates/set-password";
import type { IQueryRegisterData } from "@/module/auth/types";
import { useMenuStore } from "@/stores/menu-store";
import { networkError, nullBodyError } from "@/tests/utils/mock-api-errors";
import { cookiesUtilsMocks } from "@/tests/utils/mock-cookies-utils";
import { mockRouter } from "@/tests/utils/mock-next-navigation";
import { renderWithProviders } from "@/tests/utils/mock-providers";
import { mockQueryClient } from "@/tests/utils/mock-react-query";
import { COOKIES, ROLES } from "@/types";

// --- Mock API hooks ---
const registerMutateMock = vi.fn<(payload: RegisterPayload, callbacks: RegisterCallbacks) => void>();
let isPending = false;

vi.mock("@/module/auth/hooks/useAuth", () => ({
	useAuthAPI: () => ({
		useRegisterMutation: () => ({
			mutate: registerMutateMock,
			get isPending() {
				return isPending;
			},
		}),
	}),
}));

const realSetMenuForUser = useMenuStore.getState().setMenuForUser;

const renderComponent = (userData?: Partial<IQueryRegisterData>) => {
	mockQueryClient.getQueryData.mockReturnValue(userData);

	return renderWithProviders(<PasswordForm />);
};

const getSubmitButton = () => screen.getByTestId("set-password-button");

const fillPasswords = async (user: UserEvent, pass: string, confirm: string) => {
	await user.type(screen.getByLabelText("Password"), pass);
	await user.type(screen.getByLabelText("Confirm Password"), confirm);
	await user.click(getSubmitButton());
};

const signupUser: Partial<IQueryRegisterData> = { email: "hello@x.com", firstName: "Test", lastName: "User" };
const registeredUser: RegisterSuccessData["user"] = {
	roles: ROLES.ADMIN,
	companyRef: { _id: "C1" },
	_id: "U1",
	permissions: [],
};

describe("Set Password Template", () => {
	let user: UserEvent;
	beforeEach(() => {
		vi.clearAllMocks();
		isPending = false;

		useMenuStore.setState({ setMenuForUser: vi.fn(realSetMenuForUser) });

		user = userEvent.setup();
	});

	test("renders all form elements", () => {
		renderComponent();

		expect(screen.getByRole("heading", { name: /create password/i })).toBeInTheDocument();
		expect(screen.getByLabelText("Password")).toBeInTheDocument();
		expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
		expect(getSubmitButton()).toBeInTheDocument();
	});

	test("displays error when password & confirm do not match", async () => {
		renderComponent();

		await fillPasswords(user, "Abc1234!", "Mismatch!");

		expect(screen.queryByText(/passwords match/i)).not.toBeInTheDocument();
	});

	test("calls registerUser when no invite token", async () => {
		renderComponent(signupUser);

		await fillPasswords(user, "Abc1234!", "Abc1234!");

		await waitFor(() => {
			expect(registerMutateMock).toHaveBeenCalledTimes(1);
		});
	});

	test("calls acceptInvite when invite token exists", async () => {
		renderComponent({ ...signupUser, email: "invited@x.com", inviteToken: "INV12345" });

		await fillPasswords(user, "Abc1234!", "Abc1234!");

		await waitFor(() => {
			expect(registerMutateMock).toHaveBeenCalledWith(
				expect.objectContaining({ inviteToken: "INV12345" }),
				expect.anything()
			);
		});
	});

	/*
	  The name and email are carried over from the sign-up screen and held in memory. Arriving here
	  without them — after a refresh, the back button, or a bookmarked link — means there is no
	  account to finish, so the only sensible move is to send the person back to the start.
	*/
	describe("incomplete signup data", () => {
		const cases: Array<[string, Partial<IQueryRegisterData> | undefined]> = [
			["first name", { lastName: "User", email: "hello@x.com" }],
			["last name", { firstName: "Test", email: "hello@x.com" }],
			["email", { firstName: "Test", lastName: "User" }],
			["everything", {}],
			["the cache entry itself", undefined],
		];

		test.each(cases)("redirects to sign-up when the cached data is missing the %s", async (_label, cached) => {
			renderComponent(cached);

			await fillPasswords(user, "Abc1234!", "Abc1234!");

			await waitFor(() => {
				expect(mockRouter.replace).toHaveBeenCalledWith(routes.auth.signUp);
			});
			expect(registerMutateMock).not.toHaveBeenCalled();
		});
	});

	test("sends the cached name and email with the chosen password", async () => {
		renderComponent(signupUser);

		await fillPasswords(user, "Abc1234!", "Abc1234!");

		await waitFor(() => {
			expect(registerMutateMock).toHaveBeenCalledWith(
				{
					name: { first: "Test", last: "User" },
					email: "hello@x.com",
					password: "Abc1234!",
					inviteToken: undefined,
				},
				expect.anything()
			);
		});
	});

	test("onSuccess builds the menu as the user themselves and redirects there", async () => {
		registerMutateMock.mockImplementation((_payload, { onSuccess }) => onSuccess({ user: registeredUser }));

		renderComponent(signupUser);

		await fillPasswords(user, "Abc1234!", "Abc1234!");

		await waitFor(() => {
			expect(useMenuStore.getState().setMenuForUser).toHaveBeenCalledWith(registeredUser, false);
		});
		expect(mockRouter.replace).toHaveBeenCalledWith(useMenuStore.getState().defaultRedirectUrl);
		expect(cookiesUtilsMocks.setCookies).not.toHaveBeenCalled();
	});

	test("onSuccess routes to MFA setup instead when the server asks for it", async () => {
		registerMutateMock.mockImplementation((_payload, { onSuccess }) =>
			onSuccess({ user: registeredUser, redirectToMfaSetup: true })
		);

		renderComponent(signupUser);

		await fillPasswords(user, "Abc1234!", "Abc1234!");

		await waitFor(() => {
			// 1/24 of a day = one hour, the time allowed to finish an interrupted MFA setup.
			expect(cookiesUtilsMocks.setCookies).toHaveBeenCalledWith(
				{ [COOKIES.MFA_AUTH_CONTEXT]: MFA_AUTH_CONTEXT_VALUES.SETUP },
				1 / 24
			);
		});
		expect(mockRouter.replace).toHaveBeenCalledWith(routes.auth.mfaSetup);
		expect(mockRouter.replace).toHaveBeenCalledTimes(1);
		expect(useMenuStore.getState().setMenuForUser).not.toHaveBeenCalled();
	});

	test("onError displays error message (register)", async () => {
		registerMutateMock.mockImplementation((_p, { onError }) =>
			onError({ response: { data: { message: "Weak Password" } } })
		);

		renderComponent({ ...signupUser, email: "err@test.com" });

		await fillPasswords(user, "Test123!", "Test123!");

		expect(await screen.findByText(/weak password/i)).toBeInTheDocument();
	});

	test("onError displays fallback message", async () => {
		registerMutateMock.mockImplementation((_p, { onError }) => onError({ response: { data: {} } }));

		renderComponent({ ...signupUser, email: "fallback@test.com" });

		await fillPasswords(user, "Abc1234!", "Abc1234!");

		expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
	});

	test("falls back to the generic message when the API is unreachable", async () => {
		registerMutateMock.mockImplementation((_p, { onError }) => onError(networkError()));

		renderComponent(signupUser);

		await fillPasswords(user, "Abc1234!", "Abc1234!");

		expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
	});

	test("falls back to the generic message when the error response has no body", async () => {
		registerMutateMock.mockImplementation((_p, { onError }) => onError(nullBodyError()));

		renderComponent(signupUser);

		await fillPasswords(user, "Abc1234!", "Abc1234!");

		expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
	});

	test("shows the label and no error paragraph before anything is submitted", () => {
		renderComponent(signupUser);

		expect(getSubmitButton()).toHaveTextContent(/finish sign up/i);
		expect(screen.queryByTestId("set-password-error")).not.toBeInTheDocument();
		expect(screen.queryByTestId("loader2-icon")).not.toBeInTheDocument();
	});

	test("keeps submit disabled until both passwords are valid and matching", async () => {
		renderComponent(signupUser);

		expect(getSubmitButton()).toBeDisabled();

		await user.type(screen.getByLabelText("Password"), "Abc1234!");
		expect(getSubmitButton()).toBeDisabled();

		await user.type(screen.getByLabelText("Confirm Password"), "Abc1234!");
		await waitFor(() => expect(getSubmitButton()).not.toBeDisabled());
	});

	test("blocks a second submit while the registration is in flight", async () => {
		isPending = true;

		renderComponent(signupUser);

		await user.type(screen.getByLabelText("Password"), "Abc1234!");
		await user.type(screen.getByLabelText("Confirm Password"), "Abc1234!");

		expect(getSubmitButton()).toBeDisabled();
		expect(screen.getByTestId("loader2-icon")).toBeInTheDocument();

		await user.click(getSubmitButton());
		// Submitting is asynchronous, so wait a beat. Without this, the check below would pass
		// even if the click had gone through.
		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 0));
		});
		expect(registerMutateMock).not.toHaveBeenCalled();
	});
});
