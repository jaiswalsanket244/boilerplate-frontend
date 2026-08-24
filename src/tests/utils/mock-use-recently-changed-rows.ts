interface RecentlyChangedRows {
	created: string[];
	updated: string[];
	deleted: string[];
	errors: string[];
}

const initialData: RecentlyChangedRows = {
	created: [],
	updated: [],
	deleted: [],
	errors: [],
};

export const mockRecentlyChangedRowsData: RecentlyChangedRows = { ...initialData };

export const mockAddRow = vi.fn((type: string, id: string) => {
	if (!mockRecentlyChangedRowsData[type as keyof RecentlyChangedRows].includes(id)) {
		mockRecentlyChangedRowsData[type as keyof RecentlyChangedRows].push(id);
	}
});

export const mockClearAll = vi.fn(() => {
	Object.keys(mockRecentlyChangedRowsData).forEach((key) => {
		mockRecentlyChangedRowsData[key as keyof RecentlyChangedRows] = [];
	});
});

export const mockGetRowAnimationClasses = vi.fn((id: string) => {
	const isCreated = mockRecentlyChangedRowsData.created.includes(id);
	const isUpdated = mockRecentlyChangedRowsData.updated.includes(id);
	const isDeleting = mockRecentlyChangedRowsData.deleted.includes(id);
	const error = mockRecentlyChangedRowsData.errors.includes(id);

	const classes = ["transition-all", "w-full", "overflow-x-hidden", "overflow-hidden"];
	if (isCreated) classes.push("animate-fade-in-blue");
	if (isUpdated) classes.push("animate-fade-in-yellow");
	if (isDeleting) classes.push("animate-delete-row");
	if (error) classes.push("animate-error-shake");

	return classes.join(" ");
});

export const useRecentlyChangedRows = vi.fn(() => ({
	data: mockRecentlyChangedRowsData,
	addRow: mockAddRow,
	clearAll: mockClearAll,
	getRowAnimationClasses: mockGetRowAnimationClasses,
}));

export const resetRecentlyChangedRowsMock = () => {
	mockRecentlyChangedRowsData.created = [];
	mockRecentlyChangedRowsData.updated = [];
	mockRecentlyChangedRowsData.deleted = [];
	mockRecentlyChangedRowsData.errors = [];
	mockAddRow.mockClear();
	mockClearAll.mockClear();
	mockGetRowAnimationClasses.mockClear();
};

export const setRecentlyChangedRows = (data: Partial<RecentlyChangedRows>) => {
	Object.assign(mockRecentlyChangedRowsData, data);
};

vi.mock("@/hooks/use-recently-changed-rows", () => ({
	useRecentlyChangedRows,
}));
