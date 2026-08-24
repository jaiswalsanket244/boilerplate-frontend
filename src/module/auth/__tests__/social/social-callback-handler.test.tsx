import { screen, waitFor } from "@testing-library/react";
import type { Mock } from "vitest";

import { routes } from "@/config/routes";
import type { SocialRegisterCallbacks, SocialRegisterPayload } from "@/module/auth/__tests__/types/mutation-types";
import { SocialCallbackHandler } from "@/module/auth/components/social-callback-handler";
import { type ISocialCallbackHandlerProps, SOCIAL_OAUTH_METHOD } from "@/module/auth/types";
import { useMenuStore } from "@/stores/menu-store";
import { mockRouter } from "@/tests/utils/mock-next-navigation";
import { renderWithProviders } from "@/tests/utils/mock-providers";
import { SESSION_STORAGE_KEYS } from "@/types";

const socialRegisterMutate = vi.fn<(payload: SocialRegisterPayload, callbacks: SocialRegisterCallbacks) => void>();

vi.mock("@/module/auth/hooks/useAuth", () => ({
	useAuthAPI: () => ({
		useSocialRegisterMutation: () => ({
			mutate: (...args: Parameters<typeof socialRegisterMutate>) => socialRegisterMutate(...args),
			isPending: false,
		}),
	}),
}));

const setSearch = (search: string) => {
	Object.defineProperty(window, "location", {
		value: { ...window.location, search },
		configurable: true,
		writable: true,
	});
};

const renderHandler = (props: Partial<React.ComponentProps<typeof SocialCallbackHandler>> = {}) =>
	renderWithProviders(<SocialCallbackHandler provider={SOCIAL_OAUTH_METHOD.GOOGLE} {...props} />);

describe("SocialCallbackHandler", () => {
	let handleOnSuccess: Mock<NonNullable<ISocialCallbackHandlerProps["handleOnSuccess"]>>;
	let handleOnError: Mock<NonNullable<ISocialCallbackHandlerProps["handleOnError"]>>;

	beforeEach(() => {
		vi.clearAllMocks();
		window.sessionStorage.clear();
		useMenuStore.setState({ defaultRedirectUrl: "" });
		setSearch("?code=auth-code-123");
		handleOnSuccess = vi.fn(() => {});
		handleOnError = vi.fn((_error: unknown) => {});
	});

	it("renders the interstitial copy", () => {
		renderHandler();

		expect(screen.getByRole("heading", { name: /completing authentication/i })).toBeInTheDocument();
		expect(screen.getByText(/this window will close automatically/i)).toBeInTheDocument();
	});

	describe("when the authorization code is missing", () => {
		beforeEach(() => setSearch(""));

		it("reports the error and does not call the api", async () => {
			renderHandler({ handleOnError });

			await waitFor(() => expect(handleOnError).toHaveBeenCalledTimes(1));
			const reportedError = handleOnError.mock.calls[0]?.[0];
			expect(reportedError).toBeInstanceOf(Error);
			expect(reportedError).toHaveProperty("message", "No authorization code found");
			expect(socialRegisterMutate).not.toHaveBeenCalled();
		});

		it("does not throw when no error handler is supplied", async () => {
			renderHandler();

			await waitFor(() => expect(socialRegisterMutate).not.toHaveBeenCalled());
		});
	});

	describe("when an authorization code is present", () => {
		it("forwards the code and provider to the api", async () => {
			renderHandler();

			await waitFor(() => expect(socialRegisterMutate).toHaveBeenCalledTimes(1));
			expect(socialRegisterMutate.mock.calls[0]?.[0]).toEqual({
				code: "auth-code-123",
				provider: SOCIAL_OAUTH_METHOD.GOOGLE,
				inviteToken: undefined,
			});
		});

		it("forwards a stored invite token", async () => {
			window.sessionStorage.setItem(SESSION_STORAGE_KEYS.INVITE_TOKEN, JSON.stringify("invite-abc"));

			renderHandler();

			await waitFor(() => expect(socialRegisterMutate).toHaveBeenCalledTimes(1));
			expect(socialRegisterMutate.mock.calls[0]?.[0]?.inviteToken).toBe("invite-abc");
		});

		it("clears the invite token and redirects on success", async () => {
			window.sessionStorage.setItem(SESSION_STORAGE_KEYS.INVITE_TOKEN, JSON.stringify("invite-abc"));
			useMenuStore.setState({ defaultRedirectUrl: "/client/reports" });
			socialRegisterMutate.mockImplementation((_payload, { onSuccess }) => onSuccess?.());

			renderHandler({ handleOnSuccess });

			await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith("/client/reports"));
			expect(handleOnSuccess).toHaveBeenCalledTimes(1);
			expect(window.sessionStorage.getItem(SESSION_STORAGE_KEYS.INVITE_TOKEN)).toBeNull();
		});

		it("falls back to the dashboard when no default redirect is set", async () => {
			socialRegisterMutate.mockImplementation((_payload, { onSuccess }) => onSuccess?.());

			renderHandler();

			await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith(routes.dashboard));
		});

		it("passes the mutation error to the error handler", async () => {
			const failure = new Error("provider rejected the code");
			socialRegisterMutate.mockImplementation((_payload, { onError }) => onError?.(failure));

			renderHandler({ handleOnError });

			await waitFor(() => expect(handleOnError).toHaveBeenCalledWith(failure));
			expect(mockRouter.replace).not.toHaveBeenCalled();
		});

		it("survives a mutation error when no error handler is supplied", async () => {
			socialRegisterMutate.mockImplementation((_payload, { onError }) =>
				onError?.(new Error("provider rejected the code"))
			);

			expect(() => renderHandler()).not.toThrow();

			await waitFor(() => expect(socialRegisterMutate).toHaveBeenCalledTimes(1));
			expect(mockRouter.replace).not.toHaveBeenCalled();
		});
	});
});
