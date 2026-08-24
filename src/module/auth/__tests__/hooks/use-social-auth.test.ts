import { act, renderHook } from "@testing-library/react";

import { useSocialAuth } from "@/module/auth/hooks/useSocialAuth";
import { SOCIAL_OAUTH_METHOD } from "@/module/auth/types";
import { mockGet } from "@/tests/utils/mock-api-client";
import { mockRouter } from "@/tests/utils/mock-next-navigation";

describe("useSocialAuth", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("starts without a failure flag", () => {
		const { result } = renderHook(() => useSocialAuth());

		expect(result.current.isSignupFailed).toBe(false);
	});

	it("requests the OAuth url for the given provider", async () => {
		mockGet.mockResolvedValue({ data: { data: { redirectUrl: "https://provider.test/oauth" } } });

		const { result } = renderHook(() => useSocialAuth());

		await act(() => result.current.socialSignIn(SOCIAL_OAUTH_METHOD.GOOGLE));

		expect(mockGet).toHaveBeenCalledWith("auth/url/oauth?provider=GOOGLE");
	});

	it("redirects to the url returned by the api", async () => {
		mockGet.mockResolvedValue({ data: { data: { redirectUrl: "https://provider.test/oauth" } } });

		const { result } = renderHook(() => useSocialAuth());

		await act(() => result.current.socialSignIn(SOCIAL_OAUTH_METHOD.GITHUB));

		expect(mockRouter.push).toHaveBeenCalledWith("https://provider.test/oauth");
		expect(result.current.isSignupFailed).toBe(false);
	});

	it("flags a failure and skips the redirect when the request rejects", async () => {
		mockGet.mockRejectedValue(new Error("network down"));

		const { result } = renderHook(() => useSocialAuth());

		await act(() => result.current.socialSignIn(SOCIAL_OAUTH_METHOD.GOOGLE));

		expect(result.current.isSignupFailed).toBe(true);
		expect(mockRouter.push).not.toHaveBeenCalled();
	});
});
