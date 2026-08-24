import { renderHook, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import { useAuthAPI } from "@/module/auth/hooks/useAuth";
import { OTP_PURPOSE } from "@/module/auth/types";
import { useMenuStore } from "@/stores/menu-store";
import { mockGet, mockPost, mockPut } from "@/tests/utils/mock-api-client";
import { mockOneSignalLogin, mockOneSignalLogout } from "@/tests/utils/mock-onesignal";
import { mockQueryClient } from "@/tests/utils/mock-react-query";
import { createQueryWrapper } from "@/tests/utils/query-wrapper-helpers";
import { SESSION_STORAGE_KEYS } from "@/types";

/**
 ====================================================
  use auth api integration tests
 ====================================================
 */

const user = { _id: "u1", roles: "admin", permissions: [] } as never;

// apiClient resolves an axios response ({ data }); its body is our ApiResponse ({ data }).
const apiData = <T>(payload: T) => ({ data: { data: payload } });
const apiResponse = <T>(payload: T) => ({ data: { success: true, message: "ok", data: payload } });

describe("useAuthAPI", () => {
	let wrapper: ReturnType<typeof createQueryWrapper>;
	let setMenuSpy: ReturnType<typeof vi.spyOn>;
	let resetMenuSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		mockPost.mockReset();
		mockPut.mockReset();
		mockGet.mockReset();
		mockQueryClient.clear.mockClear();
		mockOneSignalLogin.mockClear().mockResolvedValue(undefined);
		mockOneSignalLogout.mockClear().mockResolvedValue(undefined);

		setMenuSpy = vi.spyOn(useMenuStore.getState(), "setMenuForUser").mockReturnValue({} as never);
		resetMenuSpy = vi.spyOn(useMenuStore.getState(), "resetMenu").mockReturnValue(undefined as never);

		wrapper = createQueryWrapper();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("logs in via POST /auth/login, returns the user, sets the menu and signs into OneSignal", async () => {
		mockPost.mockResolvedValue(apiData({ token: "t", user, isPasswordExpired: false }));

		const { result } = renderHook(() => useAuthAPI().useLoginMutation(), { wrapper });
		const returned = await result.current.mutateAsync({ email: "a@b.com", password: "pw", loginType: "password" });

		expect(mockPost).toHaveBeenCalledWith("/auth/login", { email: "a@b.com", password: "pw", loginType: "password" });
		expect(returned).toEqual({ token: "t", user, isPasswordExpired: false });
		await waitFor(() => expect(setMenuSpy).toHaveBeenCalledWith(user));
		await waitFor(() => expect(mockOneSignalLogin).toHaveBeenCalledWith("u1"));
	});

	it("still logs in successfully when OneSignal.login fails", async () => {
		mockPost.mockResolvedValue(apiData({ token: "t", user, isPasswordExpired: false }));
		mockOneSignalLogin.mockRejectedValue(new Error("onesignal down"));

		const { result } = renderHook(() => useAuthAPI().useLoginMutation(), { wrapper });

		await expect(
			result.current.mutateAsync({ email: "a@b.com", password: "pw", loginType: "password" })
		).resolves.toBeTruthy();
		await waitFor(() => expect(setMenuSpy).toHaveBeenCalledWith(user));
	});

	it("registers via POST /auth/register, returns the user and sets the menu", async () => {
		mockPost.mockResolvedValue(apiData({ user, redirectToMfaSetup: false }));

		const { result } = renderHook(() => useAuthAPI().useRegisterMutation(), { wrapper });
		const returned = await result.current.mutateAsync({
			name: { first: "A", last: "B" },
			email: "a@b.com",
			password: "password",
		});

		expect(mockPost).toHaveBeenCalledWith("/auth/register", {
			name: { first: "A", last: "B" },
			email: "a@b.com",
			password: "password",
		});
		expect(returned).toEqual({ user, redirectToMfaSetup: false });
		await waitFor(() => expect(setMenuSpy).toHaveBeenCalledWith(user));
	});

	it("maps provider to oauthProvider when posting to /auth/social-signup", async () => {
		mockPost.mockResolvedValue(apiData({ user }));

		const { result } = renderHook(() => useAuthAPI().useSocialRegisterMutation(), { wrapper });
		const returned = await result.current.mutateAsync({ code: "c", provider: "GOOGLE", inviteToken: "inv" });

		expect(mockPost).toHaveBeenCalledWith("/auth/social-signup", {
			code: "c",
			oauthProvider: "GOOGLE",
			inviteToken: "inv",
		});
		expect(returned).toEqual({ user });
		await waitFor(() => expect(setMenuSpy).toHaveBeenCalledWith(user));
	});

	it("skips the menu update when social signup returns no user", async () => {
		mockPost.mockResolvedValue(apiData({ user: undefined }));

		const { result } = renderHook(() => useAuthAPI().useSocialRegisterMutation(), { wrapper });
		await result.current.mutateAsync({ code: "c", provider: "GOOGLE" });

		expect(setMenuSpy).not.toHaveBeenCalled();
	});

	it("skips the menu update when social signup returns no data envelope", async () => {
		mockPost.mockResolvedValue({ data: {} });

		const { result } = renderHook(() => useAuthAPI().useSocialRegisterMutation(), { wrapper });

		await expect(result.current.mutateAsync({ code: "c", provider: "GOOGLE" })).resolves.toBeUndefined();
		expect(setMenuSpy).not.toHaveBeenCalled();
	});

	it("logs out via POST /auth/logout, resets the menu, clears the cache and signs out of OneSignal", async () => {
		mockPost.mockResolvedValue(apiData(null));

		const { result } = renderHook(() => useAuthAPI().useLogoutMutation, { wrapper });
		await result.current.mutateAsync();

		expect(mockPost).toHaveBeenCalledWith("/auth/logout");
		await waitFor(() => expect(resetMenuSpy).toHaveBeenCalled());
		await waitFor(() => expect(mockQueryClient.clear).toHaveBeenCalled());
		await waitFor(() => expect(mockOneSignalLogout).toHaveBeenCalled());
	});

	it("sends the reset email via POST /auth/reset-password", async () => {
		mockPost.mockResolvedValue(apiResponse(true));

		const { result } = renderHook(() => useAuthAPI().useForgetPasswordMutation, { wrapper });
		const returned = await result.current.mutateAsync({ email: "a@b.com" });

		expect(mockPost).toHaveBeenCalledWith("/auth/reset-password", { email: "a@b.com" });
		expect(returned).toEqual({ success: true, message: "ok", data: true });
	});

	it("merges the token into the payload for POST /auth/update-password", async () => {
		mockPost.mockResolvedValue(apiResponse({ token: "tok" }));

		const { result } = renderHook(() => useAuthAPI().useUpdatePasswordMutation, { wrapper });
		await result.current.mutateAsync({
			userData: { password: "newpass", confirmPassword: "newpass" },
			token: "tok",
		});

		expect(mockPost).toHaveBeenCalledWith("/auth/update-password", {
			password: "newpass",
			confirmPassword: "newpass",
			token: "tok",
		});
	});

	it("fetches the invited email via POST /auth/invite/:token", async () => {
		mockPost.mockResolvedValue(apiResponse("a@b.com"));

		const { result } = renderHook(() => useAuthAPI().useGetEmailsFromTokenMutation(), { wrapper });
		const returned = await result.current.mutateAsync({ inviteToken: "INV123" });

		expect(mockPost).toHaveBeenCalledWith("/auth/invite/INV123", { inviteToken: "INV123" });
		expect(returned).toEqual({ success: true, message: "ok", data: "a@b.com" });
	});

	it("requests a magic link via POST /auth/magic-link/request", async () => {
		mockPost.mockResolvedValue(apiResponse(null));

		const { result } = renderHook(() => useAuthAPI().useRequestMagicLinkMutation, { wrapper });
		await result.current.mutateAsync({ email: "a@b.com" });

		expect(mockPost).toHaveBeenCalledWith("/auth/magic-link/request", { email: "a@b.com" });
	});

	it("verifies a magic link via POST /auth/magic-link/verify and sets the menu", async () => {
		mockPost.mockResolvedValue(apiData({ token: "t", user, isPasswordExpired: false }));

		const { result } = renderHook(() => useAuthAPI().useVerifyMagicLinkMutation, { wrapper });
		const returned = await result.current.mutateAsync("MAGIC");

		expect(mockPost).toHaveBeenCalledWith("/auth/magic-link/verify?token=MAGIC");
		expect(returned).toEqual({ token: "t", user, isPasswordExpired: false });
		await waitFor(() => expect(setMenuSpy).toHaveBeenCalledWith(user, false));
	});

	it("requests an OTP via POST /auth/request-otp", async () => {
		mockPost.mockResolvedValue(apiResponse(null));

		const { result } = renderHook(() => useAuthAPI().useRequestOtpMutation(), { wrapper });
		await result.current.mutateAsync({ identifier: "a@b.com", purpose: OTP_PURPOSE.LOGIN });

		expect(mockPost).toHaveBeenCalledWith("/auth/request-otp", { identifier: "a@b.com", purpose: OTP_PURPOSE.LOGIN });
	});

	it("resends an OTP via POST /auth/resend-otp", async () => {
		mockPost.mockResolvedValue(apiResponse(null));

		const { result } = renderHook(() => useAuthAPI().useResendOtpMutation(), { wrapper });
		await result.current.mutateAsync({ identifier: "a@b.com", purpose: OTP_PURPOSE.LOGIN });

		expect(mockPost).toHaveBeenCalledWith("/auth/resend-otp", { identifier: "a@b.com", purpose: OTP_PURPOSE.LOGIN });
	});

	it("verifies an OTP via POST /auth/verify-otp, returns the user and sets the menu", async () => {
		mockPost.mockResolvedValue(apiData({ user }));

		const { result } = renderHook(() => useAuthAPI().useVerifyOtpMutation(), { wrapper });
		const returned = await result.current.mutateAsync({
			identifier: "a@b.com",
			otp: "1234",
			purpose: OTP_PURPOSE.LOGIN,
		});

		expect(mockPost).toHaveBeenCalledWith("/auth/verify-otp", {
			identifier: "a@b.com",
			otp: "1234",
			purpose: OTP_PURPOSE.LOGIN,
		});
		expect(returned).toEqual({ user });
		await waitFor(() => expect(setMenuSpy).toHaveBeenCalledWith(user));
	});

	it("skips the menu update when verify-otp returns no user", async () => {
		mockPost.mockResolvedValue(apiData({ user: undefined }));

		const { result } = renderHook(() => useAuthAPI().useVerifyOtpMutation(), { wrapper });
		await result.current.mutateAsync({ identifier: "a@b.com", otp: "1234", purpose: OTP_PURPOSE.LOGIN });

		expect(setMenuSpy).not.toHaveBeenCalled();
	});

	it("loads MFA setup data via POST /auth/mfa/setup/initiate", async () => {
		mockPost.mockResolvedValue(apiData({ qrCode: "qr", uri: "u", secret: "s" }));

		const { result } = renderHook(() => useAuthAPI().useMfaSetupQuery(), { wrapper });

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(mockPost).toHaveBeenCalledWith("/auth/mfa/setup/initiate");
		expect(result.current.data).toEqual({ qrCode: "qr", uri: "u", secret: "s" });
	});

	it("verifies MFA setup via POST /auth/mfa/setup/verify with the code", async () => {
		mockPost.mockResolvedValue(apiData({ user, recoveryCodes: ["r1", "r2"] }));

		const { result } = renderHook(() => useAuthAPI().useVerifyMfaSetupMutation(), { wrapper });
		const returned = await result.current.mutateAsync({ code: "123456" });

		expect(mockPost).toHaveBeenCalledWith("/auth/mfa/setup/verify", { code: "123456" });
		expect(returned).toEqual({ user, recoveryCodes: ["r1", "r2"] });
	});

	it("verifies the MFA challenge via POST /auth/mfa/verify with the code", async () => {
		mockPost.mockResolvedValue(apiData({ user }));

		const { result } = renderHook(() => useAuthAPI().useMfaVerifyMutation(), { wrapper });
		const returned = await result.current.mutateAsync({ code: "123456" });

		expect(mockPost).toHaveBeenCalledWith("/auth/mfa/verify", { code: "123456" });
		expect(returned).toEqual({ user });
	});

	it("verifies a recovery code via POST /auth/mfa/recovery, sending recoveryCode", async () => {
		mockPost.mockResolvedValue(apiData({ user }));

		const { result } = renderHook(() => useAuthAPI().useMfaRecoveryVerifyMutation(), { wrapper });
		const returned = await result.current.mutateAsync({ recoveryCode: "abcd-efgh" });

		expect(mockPost).toHaveBeenCalledWith("/auth/mfa/recovery", { recoveryCode: "abcd-efgh" });
		expect(returned).toEqual({ user });
	});

	it("reads recovery codes from session storage without any network call", async () => {
		window.sessionStorage.setItem(SESSION_STORAGE_KEYS.RECOVERY_CODES, JSON.stringify(["c1", "c2"]));

		const { result } = renderHook(() => useAuthAPI().useMfaRecoveryCodesQuery(), { wrapper });

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(result.current.data).toEqual(["c1", "c2"]);
		expect(mockGet).not.toHaveBeenCalled();
		expect(mockPost).not.toHaveBeenCalled();

		window.sessionStorage.clear();
	});

	it("returns an empty recovery-code list when session storage is empty", async () => {
		const { result } = renderHook(() => useAuthAPI().useMfaRecoveryCodesQuery(), { wrapper });

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(result.current.data).toEqual([]);
	});

	it("requests a reset email OTP via POST /auth/mfa/reset/email/otp", async () => {
		mockPost.mockResolvedValue(apiData(null));

		const { result } = renderHook(() => useAuthAPI().useInitiateMfaResetEmailOtpMutation(), { wrapper });
		await result.current.mutateAsync();

		expect(mockPost).toHaveBeenCalledWith("/auth/mfa/reset/email/otp");
	});

	it("verifies reset identity via POST /auth/mfa/reset/identity/verify with method and code", async () => {
		mockPost.mockResolvedValue(apiData({ verified: true }));

		const { result } = renderHook(() => useAuthAPI().useVerifyMfaResetIdentityMutation(), { wrapper });
		const returned = await result.current.mutateAsync({ method: "email_otp", code: "123456" });

		expect(mockPost).toHaveBeenCalledWith("/auth/mfa/reset/identity/verify", { method: "email_otp", code: "123456" });
		expect(returned).toEqual({ verified: true });
	});

	it("updates the recovery reconfigure session via POST /auth/mfa/recovery/reset", async () => {
		mockPost.mockResolvedValue({ data: null });

		const { result } = renderHook(() => useAuthAPI().useUpdateRecoveryReconfigureSessionMutation(), { wrapper });
		const returned = await result.current.mutateAsync();

		expect(mockPost).toHaveBeenCalledWith("/auth/mfa/recovery/reset");
		expect(returned).toBeNull();
	});

	it("skips MFA setup via POST /auth/mfa/setup/skip", async () => {
		mockPost.mockResolvedValue(apiData({ user }));

		const { result } = renderHook(() => useAuthAPI().useSkipMfaSetupMutation(), { wrapper });
		const returned = await result.current.mutateAsync();

		expect(mockPost).toHaveBeenCalledWith("/auth/mfa/setup/skip");
		expect(returned).toEqual({ user });
	});

	it("disables MFA via PUT /auth/mfa/disable", async () => {
		mockPut.mockResolvedValue(apiData({ disabled: true }));

		const { result } = renderHook(() => useAuthAPI().useDisableMfaMutation(), { wrapper });
		// useDisableMfaMutation has no response generic, so its result is `any`; pin the shape here.
		const returned = (await result.current.mutateAsync()) as { disabled: boolean };

		expect(mockPut).toHaveBeenCalledWith("/auth/mfa/disable");
		expect(returned).toEqual({ disabled: true });
	});

	it("surfaces login errors and skips the success side effects", async () => {
		mockPost.mockRejectedValue(new Error("invalid credentials"));

		const { result } = renderHook(() => useAuthAPI().useLoginMutation(), { wrapper });

		await expect(
			result.current.mutateAsync({ email: "a@b.com", password: "wrong", loginType: "password" })
		).rejects.toThrow("invalid credentials");
		expect(setMenuSpy).not.toHaveBeenCalled();
		expect(mockOneSignalLogin).not.toHaveBeenCalled();
	});

	it("surfaces registration errors", async () => {
		mockPost.mockRejectedValue(new Error("email already exists"));

		const { result } = renderHook(() => useAuthAPI().useRegisterMutation(), { wrapper });

		await expect(
			result.current.mutateAsync({ name: { first: "A", last: "B" }, email: "a@b.com", password: "password" })
		).rejects.toThrow("email already exists");
		expect(setMenuSpy).not.toHaveBeenCalled();
	});
});
