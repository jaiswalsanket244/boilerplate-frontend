import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useProductSearch } from "@/module/product/hooks/useProductList";

describe("useProductSearch hook", () => {
	it("updates value immediately and debouncedValue after debounce", async () => {
		vi.useFakeTimers();
		const { result } = renderHook(() => useProductSearch());

		act(() => {
			result.current.handleInputChange("abc");
		});

		expect(result.current.value).toBe("abc");
		// debounced value still empty immediately
		expect(result.current.debouncedValue).toBe("");

		// advance timers by 300ms to flush debounce
		await act(async () => {
			vi.advanceTimersByTime(300);
		});

		expect(result.current.debouncedValue).toBe("abc");
		vi.useRealTimers();
	});
});
