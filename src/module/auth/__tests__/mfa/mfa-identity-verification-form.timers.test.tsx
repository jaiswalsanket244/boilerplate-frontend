import { act, render, screen } from "@testing-library/react";
import { vi } from "vitest";

import MfaResetVerificationForm from "@/module/auth/templates/mfa/mfa-identity-verification-form";
import type { InputOTPGroupMockProps, InputOTPMockProps } from "@/tests/types/input-otp-mock";
import { clearCookies } from "@/tests/utils/mock-cookies-next";
import { type IUser, SESSION_STORAGE_KEYS } from "@/types";

/*
  Covers the resend cooldown only: the mount-time decision to auto-send, the
  countdown that follows, and what the resend button reads at each point. The
  behavioural tests live in mfa-identity-verification-form.test.tsx.
*/

const NOW = 1_760_000_000_000;
const RESEND_COOLDOWN_MS = 60_000;
const AUTO_RESEND_COOLDOWN_MS = 5 * 60_000;

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

const mockUserData: { mfa: Pick<IUser["mfa"], "enrolled"> } = { mfa: { enrolled: false } };
vi.mock("@/module/profile/hooks/useProfile", () => ({
	useProfileAPI: () => ({
		useGetUserData: () => ({ data: mockUserData }),
	}),
}));

const seed = (key: SESSION_STORAGE_KEYS, value: number) => window.sessionStorage.setItem(key, JSON.stringify(value));

const storedResendAt = () => window.sessionStorage.getItem(SESSION_STORAGE_KEYS.MFA_RESET_EMAIL_OTP_RESEND_AT);

const resendButton = () => screen.getByRole("button", { name: /resend/i });

// Timer callbacks update React state, so every advance has to run inside act()
// or the assertion reads the pre-tick render.
const advance = async (ms: number) => {
	await act(async () => {
		await vi.advanceTimersByTimeAsync(ms);
	});
};

const renderAndSettle = async () => {
	render(<MfaResetVerificationForm />);
	await advance(0);
};

describe("MfaResetVerificationForm resend cooldown", () => {
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

	describe("deciding whether to auto-send on mount", () => {
		it("auto-sends when nothing is stored", async () => {
			await renderAndSettle();

			expect(mockInitiate).toHaveBeenCalledOnce();
		});

		it("skips the auto-send while a resend cooldown is still in the future", async () => {
			seed(SESSION_STORAGE_KEYS.MFA_RESET_EMAIL_OTP_RESEND_AT, NOW + 30_000);

			await renderAndSettle();

			expect(mockInitiate).not.toHaveBeenCalled();
			expect(resendButton()).toHaveTextContent("Resend in 30s");
		});

		it("auto-sends when the stored cooldown has already passed", async () => {
			seed(SESSION_STORAGE_KEYS.MFA_RESET_EMAIL_OTP_RESEND_AT, NOW - 1);

			await renderAndSettle();

			expect(mockInitiate).toHaveBeenCalledOnce();
		});

		it("auto-sends when the stored cooldown expires exactly now", async () => {
			seed(SESSION_STORAGE_KEYS.MFA_RESET_EMAIL_OTP_RESEND_AT, NOW);

			await renderAndSettle();

			expect(mockInitiate).toHaveBeenCalledOnce();
		});

		it("skips the auto-send while the auto-send window is still in the future", async () => {
			seed(SESSION_STORAGE_KEYS.MFA_AUTO_EMAIL_OTP_SEND_AT, NOW + 10_000);

			await renderAndSettle();

			expect(mockInitiate).not.toHaveBeenCalled();
		});

		it("auto-sends when the auto-send window expires exactly now", async () => {
			seed(SESSION_STORAGE_KEYS.MFA_AUTO_EMAIL_OTP_SEND_AT, NOW);

			await renderAndSettle();

			expect(mockInitiate).toHaveBeenCalledOnce();
		});

		it("records the next auto-send window when it sends", async () => {
			await renderAndSettle();

			expect(window.sessionStorage.getItem(SESSION_STORAGE_KEYS.MFA_AUTO_EMAIL_OTP_SEND_AT)).toBe(
				JSON.stringify(NOW + AUTO_RESEND_COOLDOWN_MS)
			);
		});

		it("drops the auto-send window again when the request fails", async () => {
			mockInitiate.mockRejectedValueOnce(new Error("smtp down"));

			await renderAndSettle();

			expect(window.sessionStorage.getItem(SESSION_STORAGE_KEYS.MFA_AUTO_EMAIL_OTP_SEND_AT)).toBeNull();
			expect(screen.getByRole("status")).toHaveTextContent(/couldn't send the code/i);
		});
	});

	describe("counting down", () => {
		it("starts a full cooldown after the auto-send", async () => {
			await renderAndSettle();

			expect(resendButton()).toHaveTextContent("Resend in 60s");
			expect(resendButton()).toBeDisabled();
			expect(storedResendAt()).toBe(JSON.stringify(NOW + RESEND_COOLDOWN_MS));
		});

		it("ticks down once per second", async () => {
			await renderAndSettle();

			await advance(1000);
			expect(resendButton()).toHaveTextContent("Resend in 59s");

			await advance(1000);
			expect(resendButton()).toHaveTextContent("Resend in 58s");
		});

		it("stays disabled with one second left", async () => {
			await renderAndSettle();

			await advance(RESEND_COOLDOWN_MS - 1000);

			expect(resendButton()).toHaveTextContent("Resend in 1s");
			expect(resendButton()).toBeDisabled();
		});

		it("re-enables the button and clears storage once the cooldown expires", async () => {
			await renderAndSettle();

			await advance(RESEND_COOLDOWN_MS);

			expect(resendButton()).toHaveTextContent("Resend otp");
			expect(resendButton()).not.toBeDisabled();
			expect(storedResendAt()).toBeNull();
		});

		it("does not resurrect the countdown after expiry", async () => {
			await renderAndSettle();

			await advance(RESEND_COOLDOWN_MS + 5000);

			expect(resendButton()).toHaveTextContent("Resend otp");
		});

		it("leaves the button enabled when no cooldown is running", async () => {
			seed(SESSION_STORAGE_KEYS.MFA_AUTO_EMAIL_OTP_SEND_AT, NOW + 10_000);

			await renderAndSettle();
			await advance(3000);

			expect(resendButton()).toHaveTextContent("Resend otp");
			expect(resendButton()).not.toBeDisabled();
		});

		it("runs no countdown at all when nothing scheduled a resend", async () => {
			// An expired resend deadline is left in storage and the auto-send window blocks the
			// mount-time send, so no countdown should ever start. If the interval ran anyway it
			// would immediately decide the cooldown had expired and wipe the stored key.
			seed(SESSION_STORAGE_KEYS.MFA_RESET_EMAIL_OTP_RESEND_AT, NOW - 5000);
			seed(SESSION_STORAGE_KEYS.MFA_AUTO_EMAIL_OTP_SEND_AT, NOW + 10_000);

			await renderAndSettle();
			await advance(3000);

			expect(mockInitiate).not.toHaveBeenCalled();
			expect(storedResendAt()).toBe(JSON.stringify(NOW - 5000));
		});

		it("resumes a stored countdown from where it left off", async () => {
			seed(SESSION_STORAGE_KEYS.MFA_RESET_EMAIL_OTP_RESEND_AT, NOW + 12_000);

			await renderAndSettle();
			expect(resendButton()).toHaveTextContent("Resend in 12s");

			await advance(2000);
			expect(resendButton()).toHaveTextContent("Resend in 10s");

			await advance(10_000);
			expect(resendButton()).toHaveTextContent("Resend otp");
		});
	});

	describe("manual resend", () => {
		it("is ignored while the cooldown is still running", async () => {
			await renderAndSettle();
			expect(mockInitiate).toHaveBeenCalledOnce();

			resendButton().click();
			await advance(0);

			expect(mockInitiate).toHaveBeenCalledOnce();
		});

		it("sends again once the cooldown has expired", async () => {
			await renderAndSettle();
			await advance(RESEND_COOLDOWN_MS);

			resendButton().click();
			await advance(0);

			expect(mockInitiate).toHaveBeenCalledTimes(2);
			expect(resendButton()).toHaveTextContent("Resend in 60s");
		});
	});
});
