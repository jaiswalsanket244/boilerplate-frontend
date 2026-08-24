import { render, screen, waitFor } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { vi } from "vitest";

import { routes } from "@/config/routes";
import { MFA_AUTH_CONTEXT_VALUES } from "@/lib/constants/paths";
import MfaVerificationForm from "@/module/auth/templates/mfa/mfa-verification-form";
import type { InputOTPGroupMockProps, InputOTPMockProps } from "@/tests/types/input-otp-mock";
import { clearCookies, setupCookies } from "@/tests/utils/mock-cookies-next";
import { cookiesUtilsMocks } from "@/tests/utils/mock-cookies-utils";
import { mockRouter } from "@/tests/utils/mock-next-navigation";
import { mockQueryClient } from "@/tests/utils/mock-react-query";
import { COOKIES } from "@/types";

/*
  MfaVerificationForm is dual-purpose, switched by the `isSetupFlow` prop:
    - login flow (default): verify the second factor, then land on the dashboard.
    - setup flow: confirm the first authenticator code, then go to recovery codes.
  Within the setup flow, the RESET (reconfigure) variant is read from the
  MFA_AUTH_CONTEXT cookie and changes the title + the next context it stores.

  The cookie lifetime is in days, so the `1 / 24` in the setCookies assertions is one
  hour — how long the user has to come back and finish the flow. It is checked exactly
  rather than as "some number", because that hour is the behaviour being pinned down.
*/

// Collapse the multi-slot OTP widget down to a single controlled input.
vi.mock("@/components/ui/input-otp", () => ({
	InputOTP: ({
		value,
		onChange,
		"data-testid": testId,
	}: Pick<InputOTPMockProps, "value" | "onChange" | "data-testid">) => (
		<input data-testid={testId ?? "input-otp"} value={value ?? ""} onChange={(e) => onChange?.(e.target.value)} />
	),
	InputOTPGroup: ({ children }: InputOTPGroupMockProps) => <div>{children}</div>,
	InputOTPSlot: () => <span />,
}));

const mockVerifyLogin = vi.fn(); // useMfaVerifyMutation().mutateAsync — the login challenge
const mockVerifySetup = vi.fn(); // useVerifyMfaSetupMutation().mutateAsync — the first setup code

// Read at render time so a test can put either mutation into a pending state on its own.
// The submit button ORs the two flags together, which is indistinguishable from an AND
// unless each one is exercised independently.
const pending = { login: false, setup: false };

vi.mock("@/module/auth/hooks/useAuth", () => ({
	useAuthAPI: () => ({
		useMfaVerifyMutation: () => ({ mutateAsync: mockVerifyLogin, isPending: pending.login }),
		useVerifyMfaSetupMutation: () => ({ mutateAsync: mockVerifySetup, isPending: pending.setup }),
	}),
}));

const enterCode = async (user: UserEvent, code: string) => {
	await user.type(screen.getByTestId("input-otp"), code);
};

describe("MfaVerificationForm template", () => {
	let user: UserEvent;

	beforeEach(() => {
		vi.clearAllMocks();
		clearCookies();
		pending.login = false;
		pending.setup = false;
		mockVerifyLogin.mockResolvedValue({});
		mockVerifySetup.mockResolvedValue({ recoveryCodes: ["CODE1", "CODE2"] });
		user = userEvent.setup();
	});

	// The label is swapped for a spinner while pending, so the button cannot be found by name.
	const submitButton = (container: HTMLElement) =>
		container.querySelector('button[type="submit"]') as HTMLButtonElement;

	describe("login flow (verifying the second factor)", () => {
		it("keeps submit disabled until the code is exactly 6 digits", async () => {
			render(<MfaVerificationForm />);

			expect(screen.getByRole("heading", { name: /multi-factor verification/i })).toBeInTheDocument();

			const submit = screen.getByRole("button", { name: /submit/i });
			expect(submit).toBeDisabled();

			await enterCode(user, "123");
			expect(submit).toBeDisabled();

			await enterCode(user, "456");
			await waitFor(() => expect(submit).not.toBeDisabled());
		});

		it("verifies a valid code, clears the context cookie and redirects", async () => {
			render(<MfaVerificationForm />);

			await enterCode(user, "123456");
			await user.click(screen.getByRole("button", { name: /submit/i }));

			await waitFor(() => {
				expect(mockVerifyLogin).toHaveBeenCalledWith({ code: "123456" });
				expect(cookiesUtilsMocks.clearCookies).toHaveBeenCalledWith([COOKIES.MFA_AUTH_CONTEXT]);
				expect(mockRouter.push).toHaveBeenCalled();
			});
		});

		it("shows an inline error and does not redirect when the code is rejected", async () => {
			mockVerifyLogin.mockRejectedValueOnce(new Error("bad code"));

			render(<MfaVerificationForm />);

			await enterCode(user, "000000");
			await user.click(screen.getByRole("button", { name: /submit/i }));

			expect(await screen.findByText(/invalid code/i)).toBeInTheDocument();
			expect(mockRouter.push).not.toHaveBeenCalled();
		});

		it("clears the inline error and the invalid marker once the user retypes", async () => {
			mockVerifyLogin.mockRejectedValueOnce(new Error("bad code"));

			render(<MfaVerificationForm />);

			await enterCode(user, "000000");
			await user.click(screen.getByRole("button", { name: /submit/i }));

			expect(await screen.findByText(/invalid code/i)).toBeInTheDocument();
			expect(screen.getByRole("group")).toHaveAttribute("data-invalid", "true");

			await user.clear(screen.getByTestId("input-otp"));
			await enterCode(user, "123456");

			await waitFor(() => expect(screen.queryByText(/invalid code/i)).not.toBeInTheDocument());
			expect(screen.getByRole("group")).toHaveAttribute("data-invalid", "false");
		});

		it("describes the login challenge in the sub-heading", () => {
			render(<MfaVerificationForm />);

			// Scoped to the paragraph: the field label reads almost the same, minus the full stop.
			expect(screen.getByText("Enter the code displayed on your device.", { selector: "p" })).toBeInTheDocument();
		});

		it("routes to recovery when the user picks 'Use recovery code'", async () => {
			render(<MfaVerificationForm />);

			await user.click(screen.getByRole("button", { name: /use recovery code/i }));

			expect(cookiesUtilsMocks.setCookies).toHaveBeenCalledWith(
				{ [COOKIES.MFA_AUTH_CONTEXT]: MFA_AUTH_CONTEXT_VALUES.RECOVERY },
				1 / 24
			);
			expect(mockRouter.push).toHaveBeenCalledWith(routes.auth.mfaRecovery);
		});
	});

	describe("setup flow (confirming the first authenticator code)", () => {
		it("renders the device-activation title, description and a 'Continue' action", () => {
			render(<MfaVerificationForm isSetupFlow />);

			expect(screen.getByRole("heading", { name: /device activation/i })).toBeInTheDocument();
			expect(
				screen.getByText("Enter the code displayed on your new authenticator app to complete setup.")
			).toBeInTheDocument();
			expect(screen.getByRole("button", { name: /continue/i })).toBeInTheDocument();
		});

		it("verifies the setup code, stores the recovery-codes context and routes there", async () => {
			render(<MfaVerificationForm isSetupFlow />);

			await enterCode(user, "123456");
			await user.click(screen.getByRole("button", { name: /continue/i }));

			await waitFor(() => {
				expect(mockVerifySetup).toHaveBeenCalledWith({ code: "123456" });
				// The call passes a matching function instead of a cache name, so the only way to
				// see which cache it clears is to run that function.
				expect(
					mockQueryClient.invalidateQueries.mock.calls.some(([arg]) =>
						arg.predicate?.({ queryKey: ["mfa-setup-data"] })
					)
				).toBe(true);
				expect(cookiesUtilsMocks.setCookies).toHaveBeenCalledWith(
					{ [COOKIES.MFA_AUTH_CONTEXT]: MFA_AUTH_CONTEXT_VALUES.RECOVERY_CODES },
					1 / 24
				);
				expect(mockRouter.push).toHaveBeenCalledWith(routes.auth.mfaRecoveryCodes);
			});
		});

		it("uses the reset variant (new-authenticator title + reset context) when reconfiguring", async () => {
			setupCookies({ [COOKIES.MFA_AUTH_CONTEXT]: MFA_AUTH_CONTEXT_VALUES.RESET_SETUP_VERIFY });

			render(<MfaVerificationForm isSetupFlow />);

			expect(screen.getByRole("heading", { name: /verify your new authenticator/i })).toBeInTheDocument();
			expect(
				screen.getByText("Enter the first code from your newly configured authenticator app.")
			).toBeInTheDocument();

			await enterCode(user, "123456");
			await user.click(screen.getByRole("button", { name: /continue/i }));

			await waitFor(() => {
				expect(cookiesUtilsMocks.setCookies).toHaveBeenCalledWith(
					{ [COOKIES.MFA_AUTH_CONTEXT]: MFA_AUTH_CONTEXT_VALUES.RESET_RECOVERY_CODES },
					1 / 24
				);
				expect(mockRouter.push).toHaveBeenCalledWith(routes.auth.mfaRecoveryCodes);
			});
		});

		it("refreshes the mfa-status query only on the reset variant", async () => {
			setupCookies({ [COOKIES.MFA_AUTH_CONTEXT]: MFA_AUTH_CONTEXT_VALUES.RESET_SETUP_VERIFY });

			render(<MfaVerificationForm isSetupFlow />);

			await enterCode(user, "123456");
			await user.click(screen.getByRole("button", { name: /continue/i }));

			await waitFor(() => {
				expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["mfa-status"] });
			});
		});

		it("leaves the mfa-status query alone on a first-time setup", async () => {
			render(<MfaVerificationForm isSetupFlow />);

			await enterCode(user, "123456");
			await user.click(screen.getByRole("button", { name: /continue/i }));

			await waitFor(() => expect(mockRouter.push).toHaveBeenCalledWith(routes.auth.mfaRecoveryCodes));
			expect(mockQueryClient.invalidateQueries).not.toHaveBeenCalledWith({ queryKey: ["mfa-status"] });
		});
	});

	describe("the helper action under the submit button", () => {
		it("returns to the QR code with the setup context on a first-time setup", async () => {
			render(<MfaVerificationForm isSetupFlow />);

			await user.click(screen.getByRole("button", { name: /back to qr code/i }));

			expect(cookiesUtilsMocks.setCookies).toHaveBeenCalledWith(
				{ [COOKIES.MFA_AUTH_CONTEXT]: MFA_AUTH_CONTEXT_VALUES.SETUP },
				1 / 24
			);
			expect(mockRouter.push).toHaveBeenCalledWith(routes.auth.mfaSetup);
		});

		it("returns to the QR code with the reset context when reconfiguring", async () => {
			setupCookies({ [COOKIES.MFA_AUTH_CONTEXT]: MFA_AUTH_CONTEXT_VALUES.RESET_SETUP_VERIFY });

			render(<MfaVerificationForm isSetupFlow />);

			await user.click(screen.getByRole("button", { name: /back to qr code/i }));

			expect(cookiesUtilsMocks.setCookies).toHaveBeenCalledWith(
				{ [COOKIES.MFA_AUTH_CONTEXT]: MFA_AUTH_CONTEXT_VALUES.RESET_SETUP },
				1 / 24
			);
			expect(mockRouter.push).toHaveBeenCalledWith(routes.auth.mfaSetup);
		});
	});

	describe("pending state of either verification mutation", () => {
		it("blocks submit and shows the spinner while the login verification is in flight", async () => {
			pending.login = true;

			const { container } = render(<MfaVerificationForm />);
			await enterCode(user, "123456");

			expect(submitButton(container)).toBeDisabled();
			expect(screen.getByTestId("loader2-icon")).toBeInTheDocument();
			expect(screen.queryByText("Submit")).not.toBeInTheDocument();
		});

		it("blocks submit and shows the spinner while the setup verification is in flight", async () => {
			pending.setup = true;

			const { container } = render(<MfaVerificationForm isSetupFlow />);
			await enterCode(user, "123456");

			expect(submitButton(container)).toBeDisabled();
			expect(screen.getByTestId("loader2-icon")).toBeInTheDocument();
			expect(screen.queryByText("Continue")).not.toBeInTheDocument();
		});

		it("shows the label and allows submit when neither mutation is in flight", async () => {
			const { container } = render(<MfaVerificationForm />);
			await enterCode(user, "123456");

			await waitFor(() => expect(submitButton(container)).not.toBeDisabled());
			expect(screen.queryByTestId("loader2-icon")).not.toBeInTheDocument();
			expect(screen.getByText("Submit")).toBeInTheDocument();
		});
	});
});
