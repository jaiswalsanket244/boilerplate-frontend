import { vi } from "vitest";

export const mockQueryClient = {
	setQueryData: vi.fn(),
	getQueryData: vi.fn(),
	setQueryDefaults: vi.fn(),
	invalidateQueries: vi.fn(),
	removeQueries: vi.fn(),
	clear: vi.fn(),
};

vi.mock("@tanstack/react-query", async () => {
	const actual = await vi.importActual("@tanstack/react-query");

	return {
		...actual,
		useQueryClient: () => mockQueryClient,
	};
});
