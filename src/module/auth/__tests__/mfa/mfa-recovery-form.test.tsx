import { render, screen, waitFor } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { vi } from "vitest";

import { routes } from "@/config/routes";
import { MFA_AUTH_CONTEXT_VALUES } from "@/lib/constants/paths";
import MfaRecoveryForm from "@/module/auth/templates/mfa/mfa-recovery-form";
import { clearCookies } from "@/tests/utils/mock-cookies-next";
import { cookiesUtilsMocks } from "@/tests/utils/mock-cookies-utils";
import { mockRouter } from "@/tests/utils/mock-next-navigation";
import { COOKIES } from "@/types";

/*
  MfaRecoveryForm lets a user log in with a one-time recovery code, then offers
  two fallbacks: switch to the authenticator app, or reset MFA over email. A
  valid code opens the success dialog (skip vs. re-register the authenticator).
  The email-OTP reset dialog is a self-contained child (its own hooks + timers),
  so we stub it and only assert that it opens.

  The cookie lifetime is in days, so the `1 / 24` in the setCookies assertions is one
  hour — how long the user has to come back and finish the flow.
*/

vi.mock("@/module/auth/components/mfa-reset-email-otp-dialog", () => ({
	default: ({ open }: any) => (open ? <div>Verify your email to reset MFA</div> : null),
}));

const mockVerifyRecoveryCode = vi.fn(); // useMfaRecoveryVerifyMutation().mutateAsync
const mockUpdateReconfigureSession = vi.fn(); // useUpdateRecoveryReconfigureSessionMutation().mutateAsync

const pending = { verify: false };

vi.mock("@/module/auth/hooks/useAuth", () => ({
	useAuthAPI: () => ({
		useMfaRecoveryVerifyMutation: () => ({ mutateAsync: mockVerifyRecoveryCode, isPending: pending.verify }),
		useUpdateRecoveryReconfigureSessionMutation: () => ({ mutateAsync: mockUpdateReconfigureSession }),
	}),
}));

const submitRecoveryCode = async (user: UserEvent, code: string) => {
	await user.type(screen.getByRole("textbox"), code);
	await user.click(screen.getByRole("button", { name: /continue/i }));
};

describe("MfaRecoveryForm template", () => {
	let user: UserEvent;

	beforeEach(() => {
		vi.clearAllMocks();
		clearCookies();
		pending.verify = false;
		mockVerifyRecoveryCode.mockResolvedValue({});
		mockUpdateReconfigureSession.mockResolvedValue(undefined);
		user = userEvent.setup();
	});

	// The label is swapped for a spinner while pending, so the button cannot be found by name.
	const submitButton = (container: HTMLElement) =>
		container.querySelector('button[type="submit"]') as HTMLButtonElement;

	it("renders the heading, recovery-code input and submit action, with neither dialog open", () => {
		render(<MfaRecoveryForm />);

		expect(screen.getByRole("heading", { name: /enter recovery code/i })).toBeInTheDocument();
		expect(screen.getByRole("textbox")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /continue/i })).toBeInTheDocument();

		// Both dialogs are user-triggered: neither may greet the user on arrival.
		expect(screen.queryByRole("heading", { name: /set up your authenticator/i })).not.toBeInTheDocument();
		expect(screen.queryByText(/verify your email to reset mfa/i)).not.toBeInTheDocument();
	});

	it("verifies a valid recovery code and opens the success dialog", async () => {
		render(<MfaRecoveryForm />);

		await submitRecoveryCode(user, "RECOVER01");

		await waitFor(() => {
			expect(mockVerifyRecoveryCode).toHaveBeenCalledWith({ recoveryCode: "RECOVER01" });
			expect(screen.getByRole("heading", { name: /set up your authenticator/i })).toBeInTheDocument();
		});
	});

	it("shows an inline error when the recovery code is rejected", async () => {
		mockVerifyRecoveryCode.mockRejectedValueOnce(new Error("bad code"));

		render(<MfaRecoveryForm />);

		await submitRecoveryCode(user, "WRONGCODE");

		expect(await screen.findByText(/invalid recovery code\. please try again\./i)).toBeInTheDocument();
	});

	it("routes to authenticator verification via the 'Authenticator App' fallback", async () => {
		render(<MfaRecoveryForm />);

		await user.click(screen.getByRole("button", { name: /authenticator app/i }));

		expect(cookiesUtilsMocks.setCookies).toHaveBeenCalledWith(
			{ [COOKIES.MFA_AUTH_CONTEXT]: MFA_AUTH_CONTEXT_VALUES.VERIFICATION },
			1 / 24
		);
		expect(mockRouter.push).toHaveBeenCalledWith(routes.auth.mfaVerify);
	});

	it("opens the email-OTP reset dialog from the 'Reset MFA' fallback", async () => {
		render(<MfaRecoveryForm />);

		await user.click(screen.getByRole("button", { name: /reset mfa/i }));

		expect(await screen.findByText(/verify your email to reset mfa/i)).toBeInTheDocument();
	});

	it("re-registers the authenticator from the success dialog", async () => {
		render(<MfaRecoveryForm />);

		await submitRecoveryCode(user, "RECOVER01");
		await screen.findByRole("heading", { name: /set up your authenticator/i });

		await user.click(screen.getByRole("button", { name: /setup authenticator/i }));

		await waitFor(() => {
			expect(mockUpdateReconfigureSession).toHaveBeenCalledTimes(1);
			expect(cookiesUtilsMocks.setCookies).toHaveBeenCalledWith(
				{ [COOKIES.MFA_AUTH_CONTEXT]: MFA_AUTH_CONTEXT_VALUES.RESET_SETUP },
				1 / 24
			);
			expect(mockRouter.push).toHaveBeenCalledWith(routes.auth.mfaSetup);
		});
	});

	it("skips re-registration from the success dialog and redirects", async () => {
		render(<MfaRecoveryForm />);

		await submitRecoveryCode(user, "RECOVER01");
		await screen.findByRole("heading", { name: /set up your authenticator/i });

		await user.click(screen.getByRole("button", { name: /skip for now/i }));

		await waitFor(() => {
			expect(cookiesUtilsMocks.clearCookies).toHaveBeenCalledWith([COOKIES.MFA_AUTH_CONTEXT]);
			expect(mockRouter.push).toHaveBeenCalled();
		});
	});

	it("does not clear the context or redirect when skipping without a user type", async () => {
		cookiesUtilsMocks.getUserCookies.mockReturnValueOnce({
			userType: "",
			userRef: "",
			companyRef: "",
			isAdminPath: false,
		});

		render(<MfaRecoveryForm />);

		await submitRecoveryCode(user, "RECOVER01");
		await screen.findByRole("heading", { name: /set up your authenticator/i });

		await user.click(screen.getByRole("button", { name: /skip for now/i }));

		expect(cookiesUtilsMocks.clearCookies).not.toHaveBeenCalled();
		expect(mockRouter.push).not.toHaveBeenCalled();
	});

	describe("submit button state", () => {
		it("stays disabled while the recovery code is empty", () => {
			const { container } = render(<MfaRecoveryForm />);

			expect(submitButton(container)).toBeDisabled();
			expect(screen.queryByTestId("loader2-icon")).not.toBeInTheDocument();
		});

		it("enables once a recovery code has been entered", async () => {
			const { container } = render(<MfaRecoveryForm />);

			await user.type(screen.getByRole("textbox"), "RECOVER01");

			await waitFor(() => expect(submitButton(container)).not.toBeDisabled());
			expect(screen.getByText("Continue")).toBeInTheDocument();
		});

		it("blocks submit and shows the spinner while verification is in flight", async () => {
			pending.verify = true;

			const { container } = render(<MfaRecoveryForm />);
			await user.type(screen.getByRole("textbox"), "RECOVER01");

			await waitFor(() => expect(screen.getByTestId("loader2-icon")).toBeInTheDocument());
			// The form is valid at this point, so only isPending can be holding the button down.
			expect(submitButton(container)).toBeDisabled();
			expect(screen.queryByText("Continue")).not.toBeInTheDocument();
		});
	});
});
