import { COOKIES } from "@/types";
import { vi } from "vitest";
import { mockCookieStore } from "@/tests/utils/mock-cookies-next";

export const cookiesUtilsMocks = {
	setCookies: vi.fn(),
	clearCookies: vi.fn(),
	/* Reads from the shared cookie store so setupCookies() controls the values
	   (matching the real getUserCookies). userType falls back to "USER" when absent
	   so tests that don't touch cookies stay unaffected. */
	getUserCookies: vi.fn(() => ({
		userType: (mockCookieStore.get(COOKIES.USER_TYPE) as string) ?? "USER",
		userRef: "",
		companyRef: mockCookieStore.get(COOKIES.COMPANY_REF) as string,
		isAdminPath: false,
	})),
};

vi.mock("@/lib/utils/cookies", async (importOriginal) => {
	const actual = await importOriginal<any>();
	return {
		...actual,

		...cookiesUtilsMocks,
	};
});
