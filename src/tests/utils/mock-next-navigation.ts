import { vi } from "vitest";

export const createMockRouter = () => ({
	push: vi.fn(),
	replace: vi.fn(),
	refresh: vi.fn(),
	back: vi.fn(),
	forward: vi.fn(),
	prefetch: vi.fn().mockResolvedValue(undefined),
});

export const mockRouter = createMockRouter();
export const mockSearchParams = {
	get: vi.fn(),
	set: vi.fn(),
};
export const mockRedirect = vi.fn();

export const mockPathname = vi.fn();

vi.mock("next/navigation", () => ({
	useRouter: () => mockRouter,
	usePathname: mockPathname,
	useSearchParams: () => mockSearchParams,
	redirect: mockRedirect,
}));
