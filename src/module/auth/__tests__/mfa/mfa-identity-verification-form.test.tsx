import { render, screen, waitFor } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { vi } from "vitest";

import { routes } from "@/config/routes";
import { MFA_AUTH_CONTEXT_VALUES } from "@/lib/constants/paths";
import MfaResetVerificationForm from "@/module/auth/templates/mfa/mfa-identity-verification-form";
import type { InputOTPGroupMockProps, InputOTPMockProps } from "@/tests/types/input-otp-mock";
import { clearCookies } from "@/tests/utils/mock-cookies-next";
import { cookiesUtilsMocks } from "@/tests/utils/mock-cookies-utils";
import { mockRouter } from "@/tests/utils/mock-next-navigation";
import { mockQueryClient } from "@/tests/utils/mock-react-query";
import { COOKIES, type IUser } from "@/types";

/*
  MfaResetVerificationForm (file: mfa-identity-verification-form) is the identity
  gate before reconfiguring MFA: it auto-emails an OTP on mount, the user enters
  it, and on success it stores the next MFA context (RESET_SETUP if the account
  already has MFA enrolled, otherwise SETUP) and routes to MFA setup.
*/

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

let mockUserData: { mfa?: Pick<IUser["mfa"], "enrolled"> } | undefined = { mfa: { enrolled: false } };
vi.mock("@/module/profile/hooks/useProfile", () => ({
	useProfileAPI: () => ({
		useGetUserData: () => ({ data: mockUserData }),
	}),
}));

const enterCode = async (user: UserEvent, code: string) => {
	await user.type(screen.getByTestId("input-otp"), code);
};

describe("MfaResetVerificationForm template", () => {
	let user: UserEvent;

	beforeEach(() => {
		vi.clearAllMocks();
		clearCookies();
		window.sessionStorage.clear();
		pending.initiate = false;
		pending.verify = false;
		mockUserData = { mfa: { enrolled: false } };
		mockInitiate.mockResolvedValue({});
		mockVerify.mockResolvedValue({});
		user = userEvent.setup();
	});

	describe("on mount", () => {
		it("renders the identity heading and auto-sends an email OTP", async () => {
			render(<MfaResetVerificationForm />);

			expect(screen.getByRole("heading", { name: /verify your identity/i })).toBeInTheDocument();

			await waitFor(() => expect(mockInitiate).toHaveBeenCalledOnce());
			expect(await screen.findByRole("status")).toHaveTextContent(/a verification code was sent to your email/i);
		});

		it("does not auto-send while a cooldown is still active", () => {
			window.sessionStorage.setItem("mfaResetEmailOtpResendAt", JSON.stringify(Date.now() + 60_000));

			render(<MfaResetVerificationForm />);

			expect(mockInitiate).not.toHaveBeenCalled();
			// The restored-cooldown branch still tells the user a code is already out there.
			expect(screen.getByRole("status")).toHaveTextContent("A verification code was sent to your email.");
		});

		it("does not auto-send while a send is already in flight", () => {
			pending.initiate = true;

			render(<MfaResetVerificationForm />);

			// Nothing is stored, so only the in-flight guard can be holding the request back.
			expect(mockInitiate).not.toHaveBeenCalled();
		});
	});

	describe("submitting the code", () => {
		it("keeps Continue disabled until the code is exactly 6 digits", async () => {
			render(<MfaResetVerificationForm />);

			const submit = screen.getByRole("button", { name: /continue/i });
			expect(submit).toBeDisabled();

			await enterCode(user, "123");
			expect(submit).toBeDisabled();

			await enterCode(user, "456");
			await waitFor(() => expect(submit).not.toBeDisabled());
		});

		it("verifies, clears cached setup data, stores SETUP context (not enrolled) and routes to setup", async () => {
			render(<MfaResetVerificationForm />);

			await enterCode(user, "123456");
			await user.click(screen.getByRole("button", { name: /continue/i }));

			await waitFor(() => {
				expect(mockVerify).toHaveBeenCalledWith({ method: "email_otp", code: "123456" });
				expect(mockQueryClient.removeQueries).toHaveBeenCalledWith({
					queryKey: ["mfa-setup-data"],
					exact: true,
				});
				expect(cookiesUtilsMocks.setCookies).toHaveBeenCalledWith(
					{ [COOKIES.MFA_AUTH_CONTEXT]: MFA_AUTH_CONTEXT_VALUES.SETUP },
					// One hour, expressed in days — the unit the cookie helper takes.
					1 / 24
				);
				expect(mockRouter.push).toHaveBeenCalledWith(routes.auth.mfaSetup);
			});
		});

		it("stores the RESET_SETUP context when MFA is already enrolled", async () => {
			mockUserData = { mfa: { enrolled: true } };

			render(<MfaResetVerificationForm />);

			await enterCode(user, "123456");
			await user.click(screen.getByRole("button", { name: /continue/i }));

			await waitFor(() => {
				expect(cookiesUtilsMocks.setCookies).toHaveBeenCalledWith(
					{ [COOKIES.MFA_AUTH_CONTEXT]: MFA_AUTH_CONTEXT_VALUES.RESET_SETUP },
					expect.any(Number)
				);
			});
		});

		it("falls back to the SETUP context when the profile has not loaded yet", async () => {
			mockUserData = undefined;

			render(<MfaResetVerificationForm />);

			await enterCode(user, "123456");
			await user.click(screen.getByRole("button", { name: /continue/i }));

			await waitFor(() => {
				expect(cookiesUtilsMocks.setCookies).toHaveBeenCalledWith(
					{ [COOKIES.MFA_AUTH_CONTEXT]: MFA_AUTH_CONTEXT_VALUES.SETUP },
					expect.any(Number)
				);
			});
			expect(screen.queryByText(/invalid code/i)).not.toBeInTheDocument();
		});

		it("falls back to the SETUP context when the profile carries no mfa block", async () => {
			mockUserData = {};

			render(<MfaResetVerificationForm />);

			await enterCode(user, "123456");
			await user.click(screen.getByRole("button", { name: /continue/i }));

			await waitFor(() => {
				expect(cookiesUtilsMocks.setCookies).toHaveBeenCalledWith(
					{ [COOKIES.MFA_AUTH_CONTEXT]: MFA_AUTH_CONTEXT_VALUES.SETUP },
					expect.any(Number)
				);
			});
			expect(screen.queryByText(/invalid code/i)).not.toBeInTheDocument();
		});

		it("shows an inline error and does not route when verification is rejected", async () => {
			mockVerify.mockRejectedValueOnce(new Error("bad code"));

			render(<MfaResetVerificationForm />);

			await enterCode(user, "000000");
			await user.click(screen.getByRole("button", { name: /continue/i }));

			expect(await screen.findByText(/invalid code/i)).toBeInTheDocument();
			expect(mockRouter.push).not.toHaveBeenCalled();
		});

		it("clears the inline error and the invalid marker once the user retypes", async () => {
			mockVerify.mockRejectedValueOnce(new Error("bad code"));

			render(<MfaResetVerificationForm />);

			await enterCode(user, "000000");
			await user.click(screen.getByRole("button", { name: /continue/i }));

			expect(await screen.findByText(/invalid code/i)).toBeInTheDocument();
			expect(screen.getByRole("group")).toHaveAttribute("data-invalid", "true");

			await user.clear(screen.getByTestId("input-otp"));
			await enterCode(user, "123456");

			await waitFor(() => expect(screen.queryByText(/invalid code/i)).not.toBeInTheDocument());
			expect(screen.getByRole("group")).toHaveAttribute("data-invalid", "false");
		});
	});

	describe("pending state of either mutation", () => {
		const submitButton = (container: HTMLElement) =>
			container.querySelector('button[type="submit"]') as HTMLButtonElement;

		it("blocks submit while the email OTP is being sent", async () => {
			pending.initiate = true;

			const { container } = render(<MfaResetVerificationForm />);
			await enterCode(user, "123456");

			expect(submitButton(container)).toBeDisabled();
			// Only the verify mutation swaps the label for a spinner.
			expect(screen.getByText("Continue")).toBeInTheDocument();
		});

		it("blocks submit and shows the spinner while the code is being verified", async () => {
			pending.verify = true;

			const { container } = render(<MfaResetVerificationForm />);
			await enterCode(user, "123456");

			expect(submitButton(container)).toBeDisabled();
			expect(screen.getByTestId("loader2-icon")).toBeInTheDocument();
			expect(screen.queryByText("Continue")).not.toBeInTheDocument();
		});

		it("allows submit with the label showing when neither mutation is in flight", async () => {
			const { container } = render(<MfaResetVerificationForm />);
			await enterCode(user, "123456");

			await waitFor(() => expect(submitButton(container)).not.toBeDisabled());
			expect(screen.queryByTestId("loader2-icon")).not.toBeInTheDocument();
			expect(screen.getByText("Continue")).toBeInTheDocument();
		});
	});

	describe("back to settings", () => {
		it("clears the MFA context cookie and routes to the profile settings", async () => {
			render(<MfaResetVerificationForm />);

			await user.click(screen.getByRole("button", { name: /back to settings/i }));

			expect(cookiesUtilsMocks.clearCookies).toHaveBeenCalledWith([COOKIES.MFA_AUTH_CONTEXT]);
			expect(mockRouter.push).toHaveBeenCalledWith(routes.settings.profile);
		});
	});
});
