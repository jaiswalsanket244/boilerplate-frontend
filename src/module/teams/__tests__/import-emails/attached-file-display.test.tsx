import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AttachedFileDisplay } from "@/module/teams/components/import-emails/attached-file-display";

describe("AttachedFileDisplay Component", () => {
	const mockOnRemove = vi.fn();
	const mockFile = new File(["test content"], "test.xlsx", {
		type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	});

	// Mock file size to be 1024 bytes
	Object.defineProperty(mockFile, "size", { value: 1024 });

	function renderComponent(props?: { file?: File; onRemove?: () => void }) {
		return render(<AttachedFileDisplay file={mockFile} onRemove={mockOnRemove} {...props} />);
	}

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("Rendering", () => {
		it("should render file name", () => {
			renderComponent();

			expect(screen.getByText("test.xlsx")).toBeInTheDocument();
		});

		it("should render file size", () => {
			renderComponent();

			expect(screen.getByText("1 KB")).toBeInTheDocument();
		});

		it("should render paperclip icon", () => {
			renderComponent();

			const icon = screen.getByTestId("paperclip-icon");
			expect(icon).toBeInTheDocument();
		});

		it("should render remove button", () => {
			renderComponent();

			const removeButton = screen.getByRole("button");
			expect(removeButton).toBeInTheDocument();
		});

		it("should render X icon in remove button", () => {
			renderComponent();

			const xIcon = screen.getByTestId("x-icon");
			expect(xIcon).toBeInTheDocument();
		});
	});

	describe("File Information Display", () => {
		it("should display correct file size for bytes", () => {
			const smallFile = new File(["test"], "small.xlsx", { type: "application/xlsx" });
			Object.defineProperty(smallFile, "size", { value: 500 });

			renderComponent({ file: smallFile });

			expect(screen.getByText("500 Bytes")).toBeInTheDocument();
		});

		it("should display correct file size for KB", () => {
			const kbFile = new File(["test"], "kb.xlsx", { type: "application/xlsx" });
			Object.defineProperty(kbFile, "size", { value: 2048 });

			renderComponent({ file: kbFile });

			expect(screen.getByText("2 KB")).toBeInTheDocument();
		});

		it("should display correct file size for MB", () => {
			const mbFile = new File(["test"], "mb.xlsx", { type: "application/xlsx" });
			Object.defineProperty(mbFile, "size", { value: 1048576 });

			renderComponent({ file: mbFile });

			expect(screen.getByText("1 MB")).toBeInTheDocument();
		});

		it("should display long file names", () => {
			const longNameFile = new File(["test"], "very_long_file_name_that_exceeds_normal_length.xlsx", {
				type: "application/xlsx",
			});
			Object.defineProperty(longNameFile, "size", { value: 1024 });

			renderComponent({ file: longNameFile });

			expect(screen.getByText("very_long_file_name_that_exceeds_normal_length.xlsx")).toBeInTheDocument();
		});

		it("should display file names with special characters", () => {
			const specialFile = new File(["test"], "file-name_with.special@chars.xlsx", { type: "application/xlsx" });
			Object.defineProperty(specialFile, "size", { value: 1024 });

			renderComponent({ file: specialFile });

			expect(screen.getByText("file-name_with.special@chars.xlsx")).toBeInTheDocument();
		});
	});

	describe("Remove Functionality", () => {
		it("should call onRemove when remove button is clicked", async () => {
			const user = userEvent.setup();
			renderComponent();
			const removeButton = screen.getByRole("button");
			await user.click(removeButton);

			expect(mockOnRemove).toHaveBeenCalledTimes(1);
		});

		it("should call onRemove multiple times when clicked multiple times", async () => {
			const user = userEvent.setup();
			renderComponent();
			const removeButton = screen.getByRole("button");
			await user.click(removeButton);
			await user.click(removeButton);
			await user.click(removeButton);

			expect(mockOnRemove).toHaveBeenCalledTimes(3);
		});

		it("should not call onRemove on initial render", () => {
			renderComponent();
			expect(mockOnRemove).not.toHaveBeenCalled();
		});
	});

	describe("Edge Cases", () => {
		it("should handle zero-size file", () => {
			const zeroFile = new File([""], "empty.xlsx", { type: "application/xlsx" });
			Object.defineProperty(zeroFile, "size", { value: 0 });

			renderComponent({ file: zeroFile });

			expect(screen.getByText("0 Bytes")).toBeInTheDocument();
		});

		it("should handle very large file size", () => {
			const largeFile = new File(["test"], "large.xlsx", { type: "application/xlsx" });
			Object.defineProperty(largeFile, "size", { value: 1073741824 }); // 1 GB

			renderComponent({ file: largeFile });

			expect(screen.getByText("1 GB")).toBeInTheDocument();
		});

		it("should handle file with no extension", () => {
			const noExtFile = new File(["test"], "filename", { type: "application/xlsx" });
			Object.defineProperty(noExtFile, "size", { value: 1024 });

			renderComponent({ file: noExtFile });

			expect(screen.getByText("filename")).toBeInTheDocument();
		});

		it("should handle undefined onRemove gracefully", () => {
			expect(() => {
				renderComponent({ file: mockFile, onRemove: undefined as any });
			}).not.toThrow();
		});

		it("should handle file name with unicode characters", () => {
			const unicodeFile = new File(["test"], "文件名.xlsx", { type: "application/xlsx" });
			Object.defineProperty(unicodeFile, "size", { value: 1024 });

			renderComponent({ file: unicodeFile });

			expect(screen.getByText("文件名.xlsx")).toBeInTheDocument();
		});

		it("should handle file name with spaces", () => {
			const spaceFile = new File(["test"], "my file name.xlsx", { type: "application/xlsx" });
			Object.defineProperty(spaceFile, "size", { value: 1024 });

			renderComponent({ file: spaceFile });

			expect(screen.getByText("my file name.xlsx")).toBeInTheDocument();
		});
	});

	describe("Accessibility", () => {
		it("should have accessible button", () => {
			renderComponent();
			const button = screen.getByRole("button");
			expect(button).toBeInTheDocument();
		});

		it("should be keyboard accessible", async () => {
			const user = userEvent.setup();
			renderComponent();
			const button = screen.getByRole("button");
			button.focus();
			await user.keyboard("{Enter}");

			expect(mockOnRemove).toHaveBeenCalledTimes(1);
		});

		it("should support space key for button activation", async () => {
			const user = userEvent.setup();
			renderComponent();
			const button = screen.getByRole("button");
			button.focus();
			await user.keyboard(" ");

			expect(mockOnRemove).toHaveBeenCalledTimes(1);
		});
	});
});
