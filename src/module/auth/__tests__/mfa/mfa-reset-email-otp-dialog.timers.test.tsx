import { act, fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";

import MfaResetEmailOtpDialog from "@/module/auth/components/mfa-reset-email-otp-dialog";
import type { InputOTPGroupMockProps, InputOTPMockProps } from "@/tests/types/input-otp-mock";
import { clearCookies } from "@/tests/utils/mock-cookies-next";
import { SESSION_STORAGE_KEYS } from "@/types";

/*
  Covers the resend cooldown and the open/close state reset. The send/verify
  behaviour lives in mfa-reset-email-otp-dialog.test.tsx.
*/

const NOW = 1_760_000_000_000;
const RESEND_COOLDOWN_MS = 30_000;

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

const mockInitiate = vi.fn();
const mockVerify = vi.fn();

vi.mock("@/module/auth/hooks/useAuth", () => ({
	useAuthAPI: () => ({
		useInitiateMfaResetEmailOtpMutation: () => ({ mutateAsync: mockInitiate, isPending: false }),
		useVerifyMfaResetIdentityMutation: () => ({ mutateAsync: mockVerify, isPending: false }),
	}),
}));

const seedResendAt = (value: number) =>
	window.sessionStorage.setItem(SESSION_STORAGE_KEYS.MFA_RESET_EMAIL_OTP_RESEND_AT, JSON.stringify(value));

const storedResendAt = () => window.sessionStorage.getItem(SESSION_STORAGE_KEYS.MFA_RESET_EMAIL_OTP_RESEND_AT);

const sendButton = () => screen.getByRole("button", { name: /send code|resend/i });
const otpInput = () => screen.getByTestId("mfa-reset-email-otp") as HTMLInputElement;

const advance = async (ms: number) => {
	await act(async () => {
		await vi.advanceTimersByTimeAsync(ms);
	});
};

// fireEvent.change goes through React's value tracker; assigning .value directly
// updates the DOM without the component ever seeing the change.
const typeOtp = async (value: string) => {
	await act(async () => {
		fireEvent.change(otpInput(), { target: { value } });
	});
};

describe("MfaResetEmailOtpDialog cooldown", () => {
	const onOpenChange = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		clearCookies();
		window.sessionStorage.clear();
		vi.useFakeTimers();
		vi.setSystemTime(NOW);
		mockInitiate.mockResolvedValue({});
		mockVerify.mockResolvedValue({});
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	const renderOpen = async () => {
		const view = render(<MfaResetEmailOtpDialog open onOpenChange={onOpenChange} />);
		await advance(0);
		return view;
	};

	describe("restoring a stored cooldown on mount", () => {
		it("resumes the countdown when the stored deadline is in the future", async () => {
			seedResendAt(NOW + 20_000);

			await renderOpen();

			expect(sendButton()).toHaveTextContent("Resend in 20s");
			expect(sendButton()).toBeDisabled();
		});

		it("discards a stored deadline that has already passed", async () => {
			seedResendAt(NOW - 1);

			await renderOpen();

			expect(sendButton()).toHaveTextContent("Send code");
			expect(sendButton()).not.toBeDisabled();
			expect(storedResendAt()).toBeNull();
		});

		it("discards a stored deadline that expires exactly now", async () => {
			seedResendAt(NOW);

			await renderOpen();

			expect(sendButton()).toHaveTextContent("Send code");
			expect(storedResendAt()).toBeNull();
		});

		it("starts with no cooldown when nothing is stored", async () => {
			await renderOpen();

			expect(sendButton()).toHaveTextContent("Send code");
			expect(sendButton()).not.toBeDisabled();
		});
	});

	describe("counting down after a send", () => {
		it("blocks a second send for the full cooldown", async () => {
			await renderOpen();

			await act(async () => sendButton().click());
			await advance(0);

			expect(mockInitiate).toHaveBeenCalledOnce();
			expect(sendButton()).toHaveTextContent("Resend in 30s");
			expect(sendButton()).toBeDisabled();
			expect(storedResendAt()).toBe(JSON.stringify(NOW + RESEND_COOLDOWN_MS));
		});

		it("ticks down once per second", async () => {
			await renderOpen();
			await act(async () => sendButton().click());
			await advance(0);

			await advance(1000);
			expect(sendButton()).toHaveTextContent("Resend in 29s");

			await advance(1000);
			expect(sendButton()).toHaveTextContent("Resend in 28s");
		});

		it("stays disabled with one second left", async () => {
			await renderOpen();
			await act(async () => sendButton().click());
			await advance(RESEND_COOLDOWN_MS - 1000);

			expect(sendButton()).toHaveTextContent("Resend in 1s");
			expect(sendButton()).toBeDisabled();
		});

		it("re-enables as Resend code and clears storage once expired", async () => {
			await renderOpen();
			await act(async () => sendButton().click());
			await advance(RESEND_COOLDOWN_MS);

			expect(sendButton()).toHaveTextContent("Resend code");
			expect(sendButton()).not.toBeDisabled();
			expect(storedResendAt()).toBeNull();
		});

		it("allows another send once the cooldown has expired", async () => {
			await renderOpen();
			await act(async () => sendButton().click());
			await advance(RESEND_COOLDOWN_MS);

			await act(async () => sendButton().click());
			await advance(0);

			expect(mockInitiate).toHaveBeenCalledTimes(2);
			expect(sendButton()).toHaveTextContent("Resend in 30s");
		});

		it("does not start a cooldown when the send fails", async () => {
			mockInitiate.mockRejectedValueOnce(new Error("smtp down"));

			await renderOpen();
			await act(async () => sendButton().click());
			await advance(0);

			expect(sendButton()).toHaveTextContent("Send code");
			expect(sendButton()).not.toBeDisabled();
			expect(storedResendAt()).toBeNull();
		});
	});

	describe("resetting state when the dialog closes", () => {
		it("clears the entered OTP and status once reopened", async () => {
			const { rerender } = await renderOpen();

			await act(async () => sendButton().click());
			await advance(0);
			await typeOtp("123456");
			expect(otpInput().value).toBe("123456");
			expect(screen.getByRole("status")).toBeInTheDocument();

			await act(async () => {
				rerender(<MfaResetEmailOtpDialog open={false} onOpenChange={onOpenChange} />);
			});
			await act(async () => {
				rerender(<MfaResetEmailOtpDialog open onOpenChange={onOpenChange} />);
			});
			await advance(0);

			expect(otpInput().value).toBe("");
			expect(screen.queryByRole("status")).not.toBeInTheDocument();
		});

		it("keeps the running cooldown across a close and reopen", async () => {
			const { rerender } = await renderOpen();

			await act(async () => sendButton().click());
			await advance(5000);

			await act(async () => {
				rerender(<MfaResetEmailOtpDialog open={false} onOpenChange={onOpenChange} />);
			});
			await act(async () => {
				rerender(<MfaResetEmailOtpDialog open onOpenChange={onOpenChange} />);
			});
			await advance(0);

			expect(sendButton()).toHaveTextContent("Resend in 25s");
		});
	});

	describe("clearing the inline OTP error", () => {
		it("drops the error as soon as the user retypes", async () => {
			mockVerify.mockRejectedValueOnce(new Error("bad otp"));

			await renderOpen();
			await typeOtp("000000");

			await act(async () => screen.getByRole("button", { name: /^verify$/i }).click());
			await advance(0);
			expect(screen.getByText(/invalid otp/i)).toBeInTheDocument();

			await typeOtp("111111");

			expect(screen.queryByText(/invalid otp/i)).not.toBeInTheDocument();
		});
	});
});
