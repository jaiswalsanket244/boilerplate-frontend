class ResizeObserverMock {
	observe() {}
	unobserve() {}
	disconnect() {}
}
class MockDataTransfer {
	data: Record<string, string> = {};

	getData(type: string) {
		return this.data[type] || "";
	}

	setData(type: string, value: string) {
		this.data[type] = value;
	}
}
class MockClipboardEvent extends Event {
	clipboardData: any;
	constructor(type: string, eventInitDict: any = {}) {
		super(type, eventInitDict);
		this.clipboardData = eventInitDict.clipboardData ?? new MockDataTransfer();
	}
}

vi.stubGlobal("ResizeObserver", ResizeObserverMock);
vi.stubGlobal("DataTransfer", MockDataTransfer);
vi.stubGlobal("ClipboardEvent", MockClipboardEvent);
