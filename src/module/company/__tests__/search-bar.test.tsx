import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { SearchBar } from "@/module/company/components/search-bar";

describe("SearchBar Component", () => {
	const mockOnSearch = vi.fn();
	let user = userEvent.setup();

	beforeEach(() => {
		vi.clearAllMocks();
		// vi.useFakeTimers();
		user = userEvent.setup();
	});

	function renderComponent(props?: { debounceMs?: number; placeholder?: string }) {
		vi.useFakeTimers({ shouldAdvanceTime: true });
		return render(<SearchBar onSearch={mockOnSearch} {...props} />);
	}

	afterEach(() => {
		vi.useRealTimers();
	});

	describe("Rendering", () => {
		it("should render search input with default placeholder", () => {
			renderComponent();

			const input = screen.getByPlaceholderText("Search anything here...");
			expect(input).toBeInTheDocument();
		});

		it("should render with custom placeholder", () => {
			renderComponent({ placeholder: "Search companies..." });

			const input = screen.getByPlaceholderText("Search companies...");
			expect(input).toBeInTheDocument();
		});

		it("should render input inside a container div", () => {
			const { container } = render(<SearchBar onSearch={mockOnSearch} />);

			const containerDiv = container.querySelector(".mb-6.mt-6");
			expect(containerDiv).toBeInTheDocument();
		});

		it("should initialize with empty value", () => {
			renderComponent();

			const input = screen.getByPlaceholderText("Search anything here...") as HTMLInputElement;
			expect(input.value).toBe("");
		});
	});

	describe("User Input", () => {
		it("should update input value when user types", async () => {
			const user = userEvent.setup({ delay: null });
			render(<SearchBar onSearch={mockOnSearch} />);

			const input = screen.getByPlaceholderText("Search anything here...") as HTMLInputElement;

			await user.type(input, "test");

			expect(input.value).toBe("test");
		});

		it("should handle typing multiple characters", async () => {
			const user = userEvent.setup({ delay: null });
			render(<SearchBar onSearch={mockOnSearch} />);

			const input = screen.getByPlaceholderText("Search anything here...") as HTMLInputElement;

			await user.type(input, "Test Company Name");

			expect(input.value).toBe("Test Company Name");
		});

		it("should handle clearing input", async () => {
			const user = userEvent.setup({ delay: null });
			render(<SearchBar onSearch={mockOnSearch} />);

			const input = screen.getByPlaceholderText("Search anything here...") as HTMLInputElement;

			await user.type(input, "test");
			expect(input.value).toBe("test");

			await user.clear(input);
			expect(input.value).toBe("");
		});

		it("should handle special characters", async () => {
			const user = userEvent.setup({ delay: null });
			render(<SearchBar onSearch={mockOnSearch} />);

			const input = screen.getByPlaceholderText("Search anything here...") as HTMLInputElement;

			await user.type(input, "test@123!#$");

			expect(input.value).toBe("test@123!#$");
		});
	});

	describe("Debounced Search", () => {
		it("should call onSearch after default debounce delay (300ms)", async () => {
			renderComponent();

			const input = screen.getByPlaceholderText("Search anything here...");

			// Use paste to avoid multiple onChange events
			await user.click(input);
			await user.paste("test");

			// Should not be called immediately
			expect(mockOnSearch).not.toHaveBeenCalled();

			// Fast-forward time by 300ms
			vi.advanceTimersByTime(300);

			await waitFor(() => {
				expect(mockOnSearch).toHaveBeenCalledWith("test");
				expect(mockOnSearch).toHaveBeenCalledTimes(1);
			});
		});

		it("should debounce multiple rapid inputs", async () => {
			renderComponent();

			const input = screen.getByPlaceholderText("Search anything here...");

			await user.type(input, "t");
			vi.advanceTimersByTime(100);

			await user.type(input, "e");
			vi.advanceTimersByTime(100);

			await user.type(input, "s");

			await user.type(input, "t");

			// Should not be called yet
			expect(mockOnSearch).not.toHaveBeenCalled();

			// Fast-forward to complete debounce
			act(() => {
				vi.advanceTimersByTime(300);
			});

			await waitFor(() => {
				expect(mockOnSearch).toHaveBeenCalledWith("test");
				expect(mockOnSearch).toHaveBeenCalledTimes(1);
			});
		});

		it("should reset debounce timer on new input", async () => {
			renderComponent();

			const input = screen.getByPlaceholderText("Search anything here...");

			// First input
			await user.click(input);
			await user.paste("test");
			vi.advanceTimersByTime(200);

			// Type more before debounce completes - this should reset the timer
			await user.clear(input);
			await user.paste("testing");

			// Original timer should be cancelled (only 200ms has passed, not 300ms)
			vi.advanceTimersByTime(100);
			expect(mockOnSearch).not.toHaveBeenCalled();

			// Complete new debounce (200ms more to reach 300ms from second input)
			vi.advanceTimersByTime(200);

			await waitFor(() => {
				expect(mockOnSearch).toHaveBeenCalledWith("testing");
				expect(mockOnSearch).toHaveBeenCalledTimes(1);
			});
		});

		it("should call onSearch with empty string when input is cleared", async () => {
			renderComponent();

			const input = screen.getByPlaceholderText("Search anything here...");

			await user.click(input);
			await user.paste("test");
			vi.advanceTimersByTime(300);

			await waitFor(() => {
				expect(mockOnSearch).toHaveBeenCalledWith("test");
			});

			mockOnSearch.mockClear();

			await user.clear(input);
			vi.advanceTimersByTime(300);

			await waitFor(() => {
				expect(mockOnSearch).toHaveBeenCalledWith("");
			});
		});
	});

	describe("Search Behavior", () => {
		it("should call onSearch with value as-is (no trimming)", async () => {
			renderComponent();

			const input = screen.getByPlaceholderText("Search anything here...");

			await user.click(input);
			await user.paste("  test  ");
			vi.advanceTimersByTime(300);

			await waitFor(() => {
				// Note: The component doesn't trim, so it passes the value as-is
				expect(mockOnSearch).toHaveBeenCalledWith("  test  ");
			});
		});

		it("should handle consecutive searches", async () => {
			renderComponent();

			const input = screen.getByPlaceholderText("Search anything here...");

			// First search
			await user.click(input);
			await user.paste("first");
			vi.advanceTimersByTime(300);

			await waitFor(() => {
				expect(mockOnSearch).toHaveBeenCalledWith("first");
			});

			mockOnSearch.mockClear();

			// Clear and second search
			await user.clear(input);
			await user.paste("second");
			vi.advanceTimersByTime(300);

			await waitFor(() => {
				expect(mockOnSearch).toHaveBeenCalledWith("second");
			});
		});

		it("should handle very long search strings", async () => {
			renderComponent();
			const longString = "a".repeat(1000);

			const input = screen.getByPlaceholderText("Search anything here...");

			await user.click(input);
			await user.paste(longString);
			vi.advanceTimersByTime(300);

			await waitFor(() => {
				expect(mockOnSearch).toHaveBeenCalledWith(longString);
			});
		});
	});

	describe("Edge Cases", () => {
		it("should handle zero debounce delay", async () => {
			renderComponent({ debounceMs: 0 });

			const input = screen.getByPlaceholderText("Search anything here...");

			await user.click(input);
			await user.paste("test");
			vi.advanceTimersByTime(0);

			await waitFor(() => {
				expect(mockOnSearch).toHaveBeenCalledWith("test");
			});
		});

		it("should handle numeric input", async () => {
			renderComponent();

			const input = screen.getByPlaceholderText("Search anything here...");

			await user.click(input);
			await user.paste("12345");
			vi.advanceTimersByTime(300);

			await waitFor(() => {
				expect(mockOnSearch).toHaveBeenCalledWith("12345");
			});
		});

		it("should handle emojis", async () => {
			renderComponent();

			const input = screen.getByPlaceholderText("Search anything here...");

			await user.click(input);
			await user.paste("🚀💻");
			vi.advanceTimersByTime(300);

			await waitFor(() => {
				expect(mockOnSearch).toHaveBeenCalledWith("🚀💻");
			});
		});
	});

	describe("Component Updates", () => {
		it("should maintain input value when onSearch prop changes", async () => {
			const user = userEvent.setup({ delay: null });
			const newOnSearch = vi.fn();

			const { rerender } = renderComponent();

			const input = screen.getByPlaceholderText("Search anything here...") as HTMLInputElement;

			await user.type(input, "test");
			expect(input.value).toBe("test");

			rerender(<SearchBar onSearch={newOnSearch} />);

			expect(input.value).toBe("test");
		});

		it("should update placeholder when prop changes", () => {
			const { rerender } = renderComponent({ placeholder: "Initial" });

			expect(screen.getByPlaceholderText("Initial")).toBeInTheDocument();

			rerender(<SearchBar onSearch={mockOnSearch} placeholder="Updated" />);

			expect(screen.getByPlaceholderText("Updated")).toBeInTheDocument();
			expect(screen.queryByPlaceholderText("Initial")).not.toBeInTheDocument();
		});
	});

	describe("Accessibility", () => {
		it("should be accessible via keyboard", async () => {
			renderComponent();

			const input = screen.getByPlaceholderText("Search anything here...");

			await user.tab();
			expect(input).toHaveFocus();

			await user.keyboard("test");
			expect(input).toHaveValue("test");
		});

		it("should render as an input element", () => {
			renderComponent();

			const input = screen.getByPlaceholderText("Search anything here...");
			expect(input.tagName).toBe("INPUT");
		});
	});
});
