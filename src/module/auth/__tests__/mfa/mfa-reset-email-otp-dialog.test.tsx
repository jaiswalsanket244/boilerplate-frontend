import { render, screen, waitFor } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { vi } from "vitest";

import { routes } from "@/config/routes";
import { MFA_AUTH_CONTEXT_VALUES } from "@/lib/constants/paths";
import MfaResetEmailOtpDialog from "@/module/auth/components/mfa-reset-email-otp-dialog";
import type { InputOTPGroupMockProps, InputOTPMockProps } from "@/tests/types/input-otp-mock";
import { clearCookies } from "@/tests/utils/mock-cookies-next";
import { cookiesUtilsMocks } from "@/tests/utils/mock-cookies-utils";
import { mockRouter } from "@/tests/utils/mock-next-navigation";
import { COOKIES } from "@/types";

/*
  MfaResetEmailOtpDialog is the "prove it's you by email OTP" gate before an MFA
  reset. It sends a code, verifies it, then stores the reset-setup context and
  routes to MFA setup. The dialog only mounts its body when `open` is true.
*/

// Collapse the multi-slot OTP widget to a single controlled input.
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

const mockInitiate = vi.fn(); // useInitiateMfaResetEmailOtpMutation().mutateAsync
const mockVerify = vi.fn(); // useVerifyMfaResetIdentityMutation().mutateAsync

const pending = { initiate: false, verify: false };

vi.mock("@/module/auth/hooks/useAuth", () => ({
	useAuthAPI: () => ({
		useInitiateMfaResetEmailOtpMutation: () => ({ mutateAsync: mockInitiate, isPending: pending.initiate }),
		useVerifyMfaResetIdentityMutation: () => ({ mutateAsync: mockVerify, isPending: pending.verify }),
	}),
}));

const enterOtp = async (user: UserEvent, code: string) => {
	await user.type(screen.getByTestId("mfa-reset-email-otp"), code);
};

describe("MfaResetEmailOtpDialog", () => {
	let user: UserEvent;
	const onOpenChange = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		clearCookies();
		window.sessionStorage.clear();
		pending.initiate = false;
		pending.verify = false;
		mockInitiate.mockResolvedValue({});
		mockVerify.mockResolvedValue({});
		user = userEvent.setup();
	});

	describe("visibility", () => {
		it("renders the dialog body when open", () => {
			render(<MfaResetEmailOtpDialog open onOpenChange={onOpenChange} />);

			expect(screen.getByText(/verify your email to reset mfa/i)).toBeInTheDocument();
		});

		it("renders nothing when closed", () => {
			render(<MfaResetEmailOtpDialog open={false} onOpenChange={onOpenChange} />);

			expect(screen.queryByText(/verify your email to reset mfa/i)).not.toBeInTheDocument();
		});
	});

	describe("sending the code", () => {
		it("requests an OTP and shows a confirmation on success", async () => {
			render(<MfaResetEmailOtpDialog open onOpenChange={onOpenChange} />);

			await user.click(screen.getByRole("button", { name: /^send code$/i }));

			await waitFor(() => expect(mockInitiate).toHaveBeenCalledOnce());
			expect(await screen.findByRole("status")).toHaveTextContent(/a verification code was sent/i);
		});

		it("shows an error when the send fails", async () => {
			mockInitiate.mockRejectedValueOnce(new Error("smtp down"));

			render(<MfaResetEmailOtpDialog open onOpenChange={onOpenChange} />);

			await user.click(screen.getByRole("button", { name: /^send code$/i }));

			expect(await screen.findByText(/couldn't send the verification code/i)).toBeInTheDocument();
		});
	});

	describe("verifying the code", () => {
		it("keeps Verify disabled until the OTP is 6 digits", async () => {
			render(<MfaResetEmailOtpDialog open onOpenChange={onOpenChange} />);

			const verify = screen.getByRole("button", { name: /^verify$/i });
			expect(verify).toBeDisabled();

			await enterOtp(user, "123");
			expect(verify).toBeDisabled();

			await enterOtp(user, "456");
			await waitFor(() => expect(verify).not.toBeDisabled());
		});

		it("verifies, stores the reset-setup context, routes to setup and closes", async () => {
			render(<MfaResetEmailOtpDialog open onOpenChange={onOpenChange} />);

			await enterOtp(user, "123456");
			await user.click(screen.getByRole("button", { name: /^verify$/i }));

			await waitFor(() => {
				expect(mockVerify).toHaveBeenCalledWith({ method: "email_otp", code: "123456" });
				// The cookie lifetime is in days, so `1 / 24` is one hour — how long the user has
				// to come back and finish the reset.
				expect(cookiesUtilsMocks.setCookies).toHaveBeenCalledWith(
					{ [COOKIES.MFA_AUTH_CONTEXT]: MFA_AUTH_CONTEXT_VALUES.RESET_SETUP },
					1 / 24
				);
				expect(mockRouter.push).toHaveBeenCalledWith(routes.auth.mfaSetup);
				expect(onOpenChange).toHaveBeenCalledWith(false);
			});
		});

		it("shows an inline error and does not route when verification is rejected", async () => {
			mockVerify.mockRejectedValueOnce(new Error("bad otp"));

			render(<MfaResetEmailOtpDialog open onOpenChange={onOpenChange} />);

			await enterOtp(user, "000000");
			await user.click(screen.getByRole("button", { name: /^verify$/i }));

			expect(await screen.findByText(/invalid otp/i)).toBeInTheDocument();
			expect(mockRouter.push).not.toHaveBeenCalled();
		});

		// The field itself is marked as wrong, not just the message under it — that is what
		// a screen reader announces to someone who can't see the colour change.
		it("marks the OTP field invalid only once verification has failed", async () => {
			mockVerify.mockRejectedValueOnce(new Error("bad otp"));

			render(<MfaResetEmailOtpDialog open onOpenChange={onOpenChange} />);

			expect(screen.getByRole("group")).toHaveAttribute("data-invalid", "false");

			await enterOtp(user, "000000");
			await user.click(screen.getByRole("button", { name: /^verify$/i }));

			await waitFor(() => expect(screen.getByRole("group")).toHaveAttribute("data-invalid", "true"));
		});
	});

	describe("cancel", () => {
		it("closes the dialog without verifying", async () => {
			render(<MfaResetEmailOtpDialog open onOpenChange={onOpenChange} />);

			await user.click(screen.getByRole("button", { name: /^cancel$/i }));

			expect(onOpenChange).toHaveBeenCalledWith(false);
			expect(mockVerify).not.toHaveBeenCalled();
		});
	});

	describe("pending state of either mutation", () => {
		const cancelButton = () => screen.getByRole("button", { name: /^cancel$/i });
		const sendButton = () => screen.getByRole("button", { name: /send code|resend/i });
		// While pending, the label is replaced by a spinner, so the button has no name left.
		const spinningButton = () => screen.getByTestId("loader2-icon").closest("button");

		it("locks every action while the send is in flight", async () => {
			pending.initiate = true;

			render(<MfaResetEmailOtpDialog open onOpenChange={onOpenChange} />);
			await enterOtp(user, "123456");

			// The send button owns the spinner; Verify keeps its label but is still blocked.
			expect(spinningButton()).toBeDisabled();
			expect(cancelButton()).toBeDisabled();
			expect(screen.getByRole("button", { name: /^verify$/i })).toBeDisabled();
		});

		it("locks every action while the verification is in flight", async () => {
			pending.verify = true;

			render(<MfaResetEmailOtpDialog open onOpenChange={onOpenChange} />);
			await enterOtp(user, "123456");

			// Verify owns the spinner now, so its label is gone.
			expect(screen.queryByRole("button", { name: /^verify$/i })).not.toBeInTheDocument();
			expect(spinningButton()).toBeDisabled();
			expect(cancelButton()).toBeDisabled();
			expect(sendButton()).toBeDisabled();
		});

		it("leaves every action available when neither mutation is in flight", async () => {
			render(<MfaResetEmailOtpDialog open onOpenChange={onOpenChange} />);
			await enterOtp(user, "123456");

			expect(screen.queryByTestId("loader2-icon")).not.toBeInTheDocument();
			expect(cancelButton()).not.toBeDisabled();
			expect(sendButton()).not.toBeDisabled();
			await waitFor(() => expect(screen.getByRole("button", { name: /^verify$/i })).not.toBeDisabled());
		});
	});
});
