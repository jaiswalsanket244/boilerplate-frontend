import { createPopupWindow, getPopupConfig, isPasswordValid } from "@/module/auth/utils/helpers";

const stubWindowGeometry = (geometry: Record<string, number>) => {
	const originals = Object.keys(geometry).map((key) => [key, window[key as keyof Window]] as const);

	Object.entries(geometry).forEach(([key, value]) => {
		Object.defineProperty(window, key, { value, configurable: true, writable: true });
	});

	return () =>
		originals.forEach(([key, value]) =>
			Object.defineProperty(window, key, { value, configurable: true, writable: true })
		);
};

describe("isPasswordValid", () => {
	it("accepts a password meeting every rule", () => {
		expect(isPasswordValid("Passw0rd!")).toBe(true);
	});

	it("accepts a password at the eight character boundary", () => {
		expect(isPasswordValid("Passw0r!")).toBe(true);
	});

	it("rejects a password one character below the boundary", () => {
		expect(isPasswordValid("Pasw0r!")).toBe(false);
	});

	it.each([
		["no digit", "Password!"],
		["no special character", "Password1"],
		["no letter", "1234567!"],
		["an unsupported special character", "Passw0rd^"],
		["empty", ""],
	])("rejects a password with %s", (_label, password) => {
		expect(isPasswordValid(password)).toBe(false);
	});
});

describe("getPopupConfig", () => {
	let restore: () => void;

	afterEach(() => restore?.());

	it("returns the fixed popup dimensions", () => {
		restore = stubWindowGeometry({ screenX: 0, screenY: 0, outerWidth: 500, outerHeight: 600 });

		expect(getPopupConfig()).toMatchObject({ width: 500, height: 600 });
	});

	it("centres the popup against the current screen offset", () => {
		restore = stubWindowGeometry({ screenX: 100, screenY: 50, outerWidth: 1500, outerHeight: 1000 });

		expect(getPopupConfig()).toEqual({ width: 500, height: 600, left: 600, top: 250 });
	});

	it("allows a negative offset when the window is smaller than the popup", () => {
		restore = stubWindowGeometry({ screenX: 0, screenY: 0, outerWidth: 300, outerHeight: 400 });

		expect(getPopupConfig()).toEqual({ width: 500, height: 600, left: -100, top: -100 });
	});
});

describe("createPopupWindow", () => {
	it("opens a named popup with the computed geometry", () => {
		const openSpy = vi.spyOn(window, "open").mockReturnValue(null);

		createPopupWindow("https://example.test/oauth", { width: 500, height: 600, left: 600, top: 250 });

		expect(openSpy).toHaveBeenCalledWith(
			"https://example.test/oauth",
			"oauth-popup",
			"width=500,height=600,top=250,left=600,popup=true,location=yes"
		);

		openSpy.mockRestore();
	});

	it("returns whatever window.open returns", () => {
		const fakeWindow = {} as Window;
		const openSpy = vi.spyOn(window, "open").mockReturnValue(fakeWindow);

		expect(createPopupWindow("https://example.test", getPopupConfig())).toBe(fakeWindow);

		openSpy.mockRestore();
	});
});
