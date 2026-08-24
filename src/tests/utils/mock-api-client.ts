export const mockGet = vi.fn();
export const mockPost = vi.fn();
export const mockPut = vi.fn();
export const mockDelete = vi.fn();
export const mockPatch = vi.fn();

export const mockInterceptResponse = {
	use: vi.fn(),
};

export const mockApiClient = {
	get: mockGet,
	post: mockPost,
	put: mockPut,
	delete: mockDelete,
	patch: mockPatch,
	interceptors: {
		response: mockInterceptResponse,
	},
};

vi.mock("@/lib/api", async (importActual) => {
	const actual = await importActual<typeof import("@/lib/api")>();
	return {
		...actual,
		apiClient: mockApiClient,
	};
});
