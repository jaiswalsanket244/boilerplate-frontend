import { render, screen, waitFor } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { vi } from "vitest";

import { routes } from "@/config/routes";
import { MFA_AUTH_CONTEXT_VALUES } from "@/lib/constants/paths";
import MfaSetupForm from "@/module/auth/templates/mfa/mfa-setup-form";
import { clearCookies, setupCookies } from "@/tests/utils/mock-cookies-next";
import { cookiesUtilsMocks } from "@/tests/utils/mock-cookies-utils";
import { mockRouter } from "@/tests/utils/mock-next-navigation";
import { COOKIES } from "@/types";

/*
  MfaSetupForm shows the QR code + secret for enrolling an authenticator app.
  It reads the MFA_AUTH_CONTEXT cookie to tell a first-time SETUP apart from a
  RESET (reconfigure) flow — the reset flow hides "Skip" — and drives the
  useMfaSetupQuery / useSkipMfaSetupMutation hooks.
*/

vi.mock("next/image", () => ({
	default: (props: any) => <img {...props} />,
}));

const mockSkipSetupMutate = vi.fn();
// The value useMfaSetupQuery() returns; each test sets it to the state under test.
let mockMfaSetupQuery: {
	data?: { qrCode?: string; secret?: string } | null;
	isPending: boolean;
	isError: boolean;
};

vi.mock("@/module/auth/hooks/useAuth", () => ({
	useAuthAPI: () => ({
		useMfaSetupQuery: () => mockMfaSetupQuery,
		useSkipMfaSetupMutation: () => ({ mutate: mockSkipSetupMutate }),
	}),
}));

const setupData = { qrCode: "https://example.test/qr.png", secret: "JBSWY3DPEHPK3PXP" };

describe("MfaSetupForm template", () => {
	let user: UserEvent;

	beforeEach(() => {
		vi.clearAllMocks();
		clearCookies();
		// Default: setup query has loaded successfully.
		mockMfaSetupQuery = { data: setupData, isPending: false, isError: false };
		user = userEvent.setup();
	});

	it("shows a loading state while the setup query is pending", () => {
		mockMfaSetupQuery = { isPending: true, isError: false };

		render(<MfaSetupForm />);

		expect(screen.getByText(/loading mfa setup/i)).toBeInTheDocument();
	});

	/*
	  The QR code and the secret are two ways of showing the same key — the screen offers
	  both because some users can't scan. Missing either one makes the screen unusable, so
	  each way of failing is checked on its own rather than lumped together.
	*/
	it.each([
		["the setup query errors", { data: setupData, isPending: false, isError: true }],
		["the QR code is missing", { data: { qrCode: "", secret: setupData.secret }, isPending: false, isError: false }],
		["the secret is missing", { data: { qrCode: setupData.qrCode, secret: "" }, isPending: false, isError: false }],
		// The request succeeded but came back empty.
		["the response has no body", { data: null, isPending: false, isError: false }],
	])("shows a failure state when %s", (_case, queryResult) => {
		mockMfaSetupQuery = queryResult;

		render(<MfaSetupForm />);

		expect(screen.getByText(/failed to load mfa setup/i)).toBeInTheDocument();
		expect(screen.queryByAltText("QR Code")).not.toBeInTheDocument();
	});

	it("renders the QR code, secret and both actions in the first-time setup flow", () => {
		render(<MfaSetupForm />);

		expect(screen.getByRole("heading", { name: /setup multi-factor authentication/i })).toBeInTheDocument();
		expect(screen.getByAltText("QR Code")).toHaveAttribute("src", setupData.qrCode);
		expect(screen.getByText(setupData.secret)).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /skip/i })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument();
	});

	it("hides Skip and shows the reconfigure title in the reset flow", () => {
		setupCookies({ [COOKIES.MFA_AUTH_CONTEXT]: MFA_AUTH_CONTEXT_VALUES.RESET_SETUP });

		render(<MfaSetupForm />);

		expect(screen.getByRole("heading", { name: /reconfigure multi-factor authentication/i })).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: /skip/i })).not.toBeInTheDocument();
	});

	it("skips setup, then clears the context cookie and redirects on success", async () => {
		mockSkipSetupMutate.mockImplementation((_undefined, { onSuccess }: any) => onSuccess({}));

		render(<MfaSetupForm />);

		await user.click(screen.getByRole("button", { name: /skip/i }));

		expect(mockSkipSetupMutate).toHaveBeenCalledTimes(1);
		await waitFor(() => {
			expect(cookiesUtilsMocks.clearCookies).toHaveBeenCalledWith([COOKIES.MFA_AUTH_CONTEXT]);
			expect(mockRouter.push).toHaveBeenCalled();
		});
	});

	it("advances to the verify step: sets the setup-verify context and routes to verify", async () => {
		render(<MfaSetupForm />);

		await user.click(screen.getByRole("button", { name: /next/i }));

		// The cookie lifetime is in days, so `1 / 24` is one hour — how long the user has to
		// come back and finish setup.
		expect(cookiesUtilsMocks.setCookies).toHaveBeenCalledWith(
			{ [COOKIES.MFA_AUTH_CONTEXT]: MFA_AUTH_CONTEXT_VALUES.SETUP_VERIFY },
			1 / 24
		);
		expect(mockRouter.push).toHaveBeenCalledWith(routes.auth.mfaSetupVerify);
	});
});
