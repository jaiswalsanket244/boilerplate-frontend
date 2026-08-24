import { vi } from "vitest";

export const mockOneSignalLogin = vi.fn();
export const mockOneSignalLogout = vi.fn();

vi.mock("react-onesignal", () => ({
	default: {
		login: mockOneSignalLogin,
		logout: mockOneSignalLogout,
	},
}));
