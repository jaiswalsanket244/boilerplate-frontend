import { render, screen, waitFor } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { vi } from "vitest";

import { MFA_AUTH_CONTEXT_VALUES } from "@/lib/constants/paths";
import MfaRecoveryCodesList from "@/module/auth/templates/mfa/mfa-recovery-codes-list";
import { clearCookies, setupCookies } from "@/tests/utils/mock-cookies-next";
import { cookiesUtilsMocks } from "@/tests/utils/mock-cookies-utils";
import { mockRouter } from "@/tests/utils/mock-next-navigation";
import { mockQueryClient } from "@/tests/utils/mock-react-query";
import { COOKIES } from "@/types";

/*
  MfaRecoveryCodesList shows the freshly-generated recovery codes, lets the user
  copy/download them, and gates a "Finish" action behind a confirmation
  checkbox. The reset vs setup variant (titles + warning copy) is read from the
  MFA_AUTH_CONTEXT cookie via the real getCookie over the cookies-next mock.
*/

const CODES = ["AAAA-1111", "BBBB-2222", "CCCC-3333"];

// Drives the recovery-codes query result. Reassigned per-test.
let mockCodesResult: any = { data: CODES, isLoading: false };
vi.mock("@/module/auth/hooks/useAuth", () => ({
	useAuthAPI: () => ({
		useMfaRecoveryCodesQuery: () => mockCodesResult,
	}),
}));

vi.mock("@/stores/menu-store", () => ({
	useMenuStore: { getState: () => ({ defaultRedirectUrl: "/dashboard" }) },
}));

const mockWriteText = vi.fn().mockResolvedValue(undefined);

// The test browser can't read a file directly, so we read it back through a FileReader.
const readBlob = (blob?: Blob) =>
	new Promise<string>((resolve, reject) => {
		if (!blob) {
			reject(new Error("nothing was handed to URL.createObjectURL"));

			return;
		}

		const reader = new FileReader();

		reader.onload = () => resolve(String(reader.result));
		reader.onerror = () => reject(reader.error);
		reader.readAsText(blob);
	});

describe("MfaRecoveryCodesList template", () => {
	let user: UserEvent;
	// Every "Download" click, captured so tests can check the file name it saves under.
	const downloadedAnchors: HTMLAnchorElement[] = [];
	// The contents of the file the user ends up with.
	const downloadedBlobs: Blob[] = [];

	beforeEach(() => {
		vi.clearAllMocks();
		clearCookies();
		mockCodesResult = { data: CODES, isLoading: false };
		mockWriteText.mockResolvedValue(undefined);
		downloadedBlobs.length = 0;
		URL.createObjectURL = vi.fn((blob: Blob | MediaSource) => {
			downloadedBlobs.push(blob as Blob);

			return "blob:mock-url";
		});
		URL.revokeObjectURL = vi.fn();
		downloadedAnchors.length = 0;
		// A real download click would make the test browser try to navigate and log noise,
		// so we intercept it and inspect what would have been downloaded instead.
		vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
			downloadedAnchors.push(this);
		});
		user = userEvent.setup();
		// Must run AFTER userEvent.setup(), which installs its own clipboard stub.
		Object.defineProperty(navigator, "clipboard", {
			value: { writeText: mockWriteText, readText: vi.fn() },
			configurable: true,
		});
	});

	describe("rendering", () => {
		it("shows the setup title, the recovery codes and the lose-access warning by default", () => {
			render(<MfaRecoveryCodesList />);

			expect(screen.getByRole("heading", { name: /^recovery codes$/i })).toBeInTheDocument();
			CODES.forEach((code) => expect(screen.getByText(code)).toBeInTheDocument());
			expect(
				screen.getByText(/on losing access to these codes, you will lose access to your account/i)
			).toBeInTheDocument();
		});

		it("shows the reset-variant title and invalidation warning in the reset flow", () => {
			setupCookies({ [COOKIES.MFA_AUTH_CONTEXT]: MFA_AUTH_CONTEXT_VALUES.RESET_RECOVERY_CODES });

			render(<MfaRecoveryCodesList />);

			expect(screen.getByRole("heading", { name: /new recovery codes/i })).toBeInTheDocument();
			expect(screen.getByText(/previous recovery codes have been invalidated/i)).toBeInTheDocument();
		});

		it("disables copy/download while the codes are loading", () => {
			mockCodesResult = { data: [], isLoading: true };

			render(<MfaRecoveryCodesList />);

			expect(screen.getByRole("button", { name: /copy to clipboard/i })).toBeDisabled();
			expect(screen.getByRole("button", { name: /download/i })).toBeDisabled();
		});
	});

	describe("copy & download", () => {
		it("copies the codes to the clipboard", async () => {
			render(<MfaRecoveryCodesList />);

			await user.click(screen.getByRole("button", { name: /copy to clipboard/i }));

			expect(mockWriteText).toHaveBeenCalledWith(CODES.join("\n"));
		});

		it("builds a downloadable blob of the codes", async () => {
			render(<MfaRecoveryCodesList />);

			await user.click(screen.getByRole("button", { name: /download/i }));

			expect(URL.createObjectURL).toHaveBeenCalledOnce();
			expect(downloadedAnchors[0]?.href).toBe("blob:mock-url");
			expect(await readBlob(downloadedBlobs[0])).toBe(CODES.join("\n"));
			expect(downloadedBlobs[0]?.type).toBe("text/plain");
		});

		// After a reset the old file is still in the downloads folder with codes that no
		// longer work, so the file name is the only way for the user to tell them apart.
		it("names the file recovery-codes.txt in the setup flow", async () => {
			render(<MfaRecoveryCodesList />);

			await user.click(screen.getByRole("button", { name: /download/i }));

			expect(downloadedAnchors[0]?.download).toBe("recovery-codes.txt");
		});

		it("names the file new-recovery-codes.txt in the reset flow", async () => {
			setupCookies({ [COOKIES.MFA_AUTH_CONTEXT]: MFA_AUTH_CONTEXT_VALUES.RESET_RECOVERY_CODES });

			render(<MfaRecoveryCodesList />);

			await user.click(screen.getByRole("button", { name: /download/i }));

			expect(downloadedAnchors[0]?.download).toBe("new-recovery-codes.txt");
		});
	});

	describe("finishing", () => {
		it("keeps Finish disabled until there are codes to acknowledge", () => {
			mockCodesResult = { data: [], isLoading: true };

			render(<MfaRecoveryCodesList />);

			expect(screen.getByRole("button", { name: /finish/i })).toBeDisabled();
		});

		// Finish stays clickable with the box unticked on purpose: clicking it is how the
		// user is told what is missing. A disabled button explains nothing.
		it("explains what is missing when finishing without ticking the confirmation", async () => {
			render(<MfaRecoveryCodesList />);

			await user.click(screen.getByRole("button", { name: /finish/i }));

			expect(await screen.findByText(/you must confirm that you have saved your recovery codes/i)).toBeInTheDocument();
			expect(cookiesUtilsMocks.clearCookies).not.toHaveBeenCalled();
			expect(mockRouter.push).not.toHaveBeenCalled();
		});

		it("clears the context cookie, invalidates caches and redirects on finish", async () => {
			render(<MfaRecoveryCodesList />);

			await user.click(screen.getByRole("checkbox"));
			await user.click(screen.getByRole("button", { name: /finish/i }));

			await waitFor(() => {
				expect(cookiesUtilsMocks.clearCookies).toHaveBeenCalledWith([COOKIES.MFA_AUTH_CONTEXT]);
				expect(mockRouter.push).toHaveBeenCalledWith("/dashboard");
			});
			expect(screen.queryByText(/you must confirm that you have saved your recovery codes/i)).not.toBeInTheDocument();
		});

		it("invalidates the setup and recovery-code caches, and nothing else", async () => {
			render(<MfaRecoveryCodesList />);

			await user.click(screen.getByRole("checkbox"));
			await user.click(screen.getByRole("button", { name: /finish/i }));

			await waitFor(() => expect(mockQueryClient.invalidateQueries).toHaveBeenCalledTimes(2));

			// Each call passes a matching function instead of a cache name, so the only way
			// to see which caches it clears is to run that function.
			const invalidates = (queryKey: string[]) =>
				mockQueryClient.invalidateQueries.mock.calls.some(([arg]) => arg.predicate({ queryKey }));

			expect(invalidates(["mfa-setup-data"])).toBe(true);
			expect(invalidates(["mfa-recovery-codes"])).toBe(true);
			expect(invalidates(["mfa-status"])).toBe(false);
		});

		// Where to send the user next depends on their user type, so without one there is
		// nowhere to go. The cleanup still has to happen, or refreshing the page would
		// drop them back into the flow they just finished.
		it("still clears the context and caches, but does not redirect, without a user type", async () => {
			cookiesUtilsMocks.getUserCookies.mockReturnValueOnce({
				userType: "",
				userRef: "",
				companyRef: "",
				isAdminPath: false,
			});

			render(<MfaRecoveryCodesList />);

			await user.click(screen.getByRole("checkbox"));
			await user.click(screen.getByRole("button", { name: /finish/i }));

			await waitFor(() => {
				expect(cookiesUtilsMocks.clearCookies).toHaveBeenCalledWith([COOKIES.MFA_AUTH_CONTEXT]);
				expect(mockQueryClient.invalidateQueries).toHaveBeenCalledTimes(2);
			});
			expect(mockRouter.push).not.toHaveBeenCalled();
		});
	});
});
