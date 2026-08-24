export const mockCookieStore = new Map<string, unknown>();

export const Cookies = {
	setCookie: vi.fn((key: string, value: string) => {
		mockCookieStore.set(key, value);
	}),
	getCookie: vi.fn((key: string) => mockCookieStore.get(key)),
	deleteCookie: vi.fn((key: string) => mockCookieStore.delete(key)),
};

export const setupCookies = (cookies: Record<string, unknown>) => {
	mockCookieStore.clear();
	Object.entries(cookies).forEach(([key, value]) => {
		mockCookieStore.set(key, value);
	});
};

export const clearCookies = () => {
	mockCookieStore.clear();
};
vi.mock("cookies-next", () => Cookies);
