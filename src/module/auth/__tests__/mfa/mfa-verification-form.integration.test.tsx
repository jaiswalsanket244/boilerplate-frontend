import "@/tests/utils/mock-onesignal";

import { screen, waitFor } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { vi } from "vitest";

import { routes } from "@/config/routes";
import MfaVerificationForm from "@/module/auth/templates/mfa/mfa-verification-form";
import type { InputOTPGroupMockProps, InputOTPMockProps } from "@/tests/types/input-otp-mock";
import { resetMenuStore } from "@/tests/utils/menu-store-helpers";
import { mockPost } from "@/tests/utils/mock-api-client";
import { clearCookies } from "@/tests/utils/mock-cookies-next";
import { cookiesUtilsMocks } from "@/tests/utils/mock-cookies-utils";
import { mockRouter } from "@/tests/utils/mock-next-navigation";
import { renderWithProviders } from "@/tests/utils/mock-providers";
import { COOKIES } from "@/types";

/**
 ====================================================
  MFA verification form integration (real form + real useAuthAPI hook)
 ====================================================
 */

// Unlike mfa-verification-form.test.tsx, this does NOT mock useAuth — the real hook runs and
// only the network (apiClient) is stubbed, so entering a code and submitting drives the real
// verify / verify-setup mutations and the resulting redirect or inline error.

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

const user = { _id: "u1", roles: "user", permissions: [] };
const enterCode = async (u: UserEvent, code: string) => u.type(screen.getByTestId("input-otp"), code);

describe("MfaVerificationForm integration", () => {
	let u: UserEvent;

	beforeEach(() => {
		vi.clearAllMocks();
		clearCookies();
		resetMenuStore();
		u = userEvent.setup();
	});

	it("verifies the login challenge via /auth/mfa/verify, clears the context cookie and redirects", async () => {
		mockPost.mockResolvedValue({ data: { data: { user } } });

		renderWithProviders(<MfaVerificationForm />);
		await enterCode(u, "123456");
		await u.click(screen.getByRole("button", { name: /submit/i }));

		await waitFor(() => expect(mockPost).toHaveBeenCalledWith("/auth/mfa/verify", { code: "123456" }));
		expect(cookiesUtilsMocks.clearCookies).toHaveBeenCalledWith([COOKIES.MFA_AUTH_CONTEXT]);
		expect(mockRouter.push).toHaveBeenCalled();
	});

	it("shows an inline error and does not redirect when the code is rejected", async () => {
		mockPost.mockRejectedValue(new Error("bad code"));

		renderWithProviders(<MfaVerificationForm />);
		await enterCode(u, "000000");
		await u.click(screen.getByRole("button", { name: /submit/i }));

		expect(await screen.findByText(/invalid code/i)).toBeInTheDocument();
		expect(mockRouter.push).not.toHaveBeenCalled();
	});

	it("verifies the first setup code via /auth/mfa/setup/verify and routes to the recovery codes", async () => {
		mockPost.mockResolvedValue({ data: { data: { user, recoveryCodes: ["CODE1", "CODE2"] } } });

		renderWithProviders(<MfaVerificationForm isSetupFlow />);
		await enterCode(u, "123456");
		await u.click(screen.getByRole("button", { name: /continue/i }));

		await waitFor(() => expect(mockPost).toHaveBeenCalledWith("/auth/mfa/setup/verify", { code: "123456" }));
		expect(mockRouter.push).toHaveBeenCalledWith(routes.auth.mfaRecoveryCodes);
	});
});
