import { FileUploadZone } from "@/module/teams/components/import-emails/file-upload-zone";
import { IFileUploadZoneProps } from "@/module/teams/types";
import { FILE_CONSTRAINTS } from "@/module/teams/utils/constants";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

describe("FileUploadZone Component", () => {
	let user = userEvent.setup();
	const mockOnFileSelect = vi.fn().mockResolvedValue(undefined);

	function renderComponent(props?: IFileUploadZoneProps) {
		return render(<FileUploadZone onFileSelect={mockOnFileSelect} {...props} />);
	}

	beforeEach(() => {
		vi.clearAllMocks();
		user = userEvent.setup();
	});

	describe("Rendering", () => {
		it("should render upload zone", () => {
			renderComponent();

			expect(screen.getByText("Drag & drop your Excel file or")).toBeInTheDocument();
		});

		it("should render Browse Files button", () => {
			renderComponent();

			expect(screen.getByText("Browse Files")).toBeInTheDocument();
		});

		it("should render upload icon", () => {
			renderComponent();
			const uploadIcon = screen.getByTestId("upload-icon");
			expect(uploadIcon).toBeInTheDocument();
		});

		it("should render file constraints information", () => {
			renderComponent();

			expect(
				screen.getByText(
					`.xlsx/.xls, Max ${FILE_CONSTRAINTS.MAX_SIZE_MB}MB, up to ${FILE_CONSTRAINTS.MAX_RECORDS} rows`
				)
			).toBeInTheDocument();
		});

		it("should render hidden file input", () => {
			const { container } = renderComponent();

			const fileInput = container.querySelector('input[type="file"]');
			expect(fileInput).toBeInTheDocument();
			expect(fileInput).toHaveClass("hidden");
		});
	});

	describe("File Input Interaction", () => {
		it("should open file dialog when Browse Files button is clicked", async () => {
			const user = userEvent.setup();
			const { container } = renderComponent();

			const browseButton = screen.getByText("Browse Files");
			const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

			const clickSpy = vi.spyOn(fileInput, "click");

			await user.click(browseButton);

			expect(clickSpy).toHaveBeenCalled();
		});

		it("should call onFileSelect when file is selected via input", async () => {
			const user = userEvent.setup();
			const { container } = renderComponent();

			const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
			const file = new File(["test"], "test.xlsx", {
				type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			});

			await user.upload(fileInput, file);

			await waitFor(() => {
				expect(mockOnFileSelect).toHaveBeenCalledWith(file);
			});
		});

		it("should accept correct file types", () => {
			const { container } = renderComponent();

			const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
			const acceptAttr = fileInput.getAttribute("accept");

			expect(acceptAttr).toContain(".xlsx");
			expect(acceptAttr).toContain(".xls");
		});

		it("should not call onFileSelect when no file is selected", async () => {
			const { container } = renderComponent();

			const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

			// Simulate clicking the input without selecting a file
			await user.click(fileInput);

			expect(mockOnFileSelect).not.toHaveBeenCalled();
		});
	});

	describe("Drag and Drop", () => {
		it("should handle file drop", async () => {
			const { container } = renderComponent();

			const dropZone = container.querySelector(".cursor-pointer") as HTMLElement;
			const file = new File(["test"], "test.xlsx", {
				type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			});

			const dataTransfer = {
				files: [file],
			};

			const dropEvent = new Event("drop", { bubbles: true }) as any;
			dropEvent.dataTransfer = dataTransfer;
			dropEvent.preventDefault = vi.fn();

			dropZone.dispatchEvent(dropEvent);

			await waitFor(() => {
				expect(mockOnFileSelect).toHaveBeenCalledWith(file);
			});
		});

		it("should change styling on drag over", async () => {
			renderComponent();

			const dropZone = screen.getByTestId("file-upload-zone") as HTMLElement;

			const dragOverEvent = new Event("dragover", { bubbles: true }) as any;
			dragOverEvent.preventDefault = vi.fn();
			dragOverEvent.dataTransfer = {};

			await waitFor(() => {
				dropZone.dispatchEvent(dragOverEvent);
				expect(dropZone).toHaveClass("border-blue-500", "bg-blue-50");
			});
		});

		it("should revert styling on drag leave", async () => {
			renderComponent();

			const dropZone = screen.getByTestId("file-upload-zone") as HTMLElement;

			// First drag over
			const dragOverEvent = new Event("dragover", { bubbles: true }) as any;
			dragOverEvent.preventDefault = vi.fn();
			dragOverEvent.dataTransfer = {};
			await waitFor(() => {
				dropZone.dispatchEvent(dragOverEvent);
				expect(dropZone).toHaveClass("border-blue-500", "bg-blue-50");
			});

			// Then drag leave
			const dragLeaveEvent = new Event("dragleave", { bubbles: true }) as any;
			dragLeaveEvent.preventDefault = vi.fn();
			dragLeaveEvent.dataTransfer = {};
			await waitFor(() => {
				dropZone.dispatchEvent(dragLeaveEvent);
				expect(dropZone).toHaveClass("border-input/90");
			});
		});

		it("should revert styling after drop", async () => {
			renderComponent();

			const dropZone = screen.getByTestId("file-upload-zone") as HTMLElement;

			// Drag over first
			const dragOverEvent = new Event("dragover", { bubbles: true }) as any;
			dragOverEvent.preventDefault = vi.fn();
			dragOverEvent.dataTransfer = {};

			await waitFor(() => {
				dropZone.dispatchEvent(dragOverEvent);
				expect(dropZone).toHaveClass("border-blue-500", "bg-blue-50");
			});

			// Then drop
			const file = new File(["test"], "test.xlsx", { type: "application/xlsx" });
			const dropEvent = new Event("drop", { bubbles: true }) as any;
			dropEvent.dataTransfer = { files: [file] };
			dropEvent.preventDefault = vi.fn();

			await waitFor(() => {
				dropZone.dispatchEvent(dropEvent);
				expect(dropZone).toHaveClass("border-input/90");
			});
		});

		it("should prevent default on drag over", async () => {
			const { container } = renderComponent();

			const dropZone = screen.getByTestId("file-upload-zone") as HTMLElement;

			const dragOverEvent = new Event("dragover", { bubbles: true }) as any;
			dragOverEvent.preventDefault = vi.fn();
			dragOverEvent.dataTransfer = {};

			await waitFor(() => {
				dropZone.dispatchEvent(dragOverEvent);
				expect(dragOverEvent.preventDefault).toHaveBeenCalled();
			});
		});

		it("should prevent default on drop", async () => {
			const { container } = renderComponent();

			const dropZone = container.querySelector(".cursor-pointer") as HTMLElement;
			const file = new File(["test"], "test.xlsx", { type: "application/xlsx" });

			const dropEvent = new Event("drop", { bubbles: true }) as any;
			dropEvent.dataTransfer = { files: [file] };
			dropEvent.preventDefault = vi.fn();

			await waitFor(() => {
				dropZone.dispatchEvent(dropEvent);
				expect(dropEvent.preventDefault).toHaveBeenCalled();
			});
		});

		it("should handle drop with no files", async () => {
			const { container } = renderComponent();

			const dropZone = container.querySelector(".cursor-pointer") as HTMLElement;

			const dropEvent = new Event("drop", { bubbles: true }) as any;
			dropEvent.dataTransfer = { files: [] };
			dropEvent.preventDefault = vi.fn();

			await waitFor(() => {
				dropZone.dispatchEvent(dropEvent);
				expect(dropEvent.preventDefault).toHaveBeenCalled();
			});

			expect(mockOnFileSelect).not.toHaveBeenCalled();
		});

		it("should only process first file when multiple files are dropped", async () => {
			const { container } = renderComponent();

			const dropZone = container.querySelector(".cursor-pointer") as HTMLElement;
			const file1 = new File(["test1"], "test1.xlsx", { type: "application/xlsx" });
			const file2 = new File(["test2"], "test2.xlsx", { type: "application/xlsx" });

			const dropEvent = new Event("drop", { bubbles: true }) as any;
			dropEvent.dataTransfer = { files: [file1, file2] };
			dropEvent.preventDefault = vi.fn();

			await waitFor(() => {
				dropZone.dispatchEvent(dropEvent);
				expect(mockOnFileSelect).toHaveBeenCalledWith(file1);
				expect(mockOnFileSelect).toHaveBeenCalledTimes(1);
			});
		});
	});

	describe("Edge Cases", () => {
		it("should handle async onFileSelect", async () => {
			const asyncOnFileSelect = vi.fn().mockResolvedValue(undefined);
			renderComponent({ onFileSelect: asyncOnFileSelect });

			const fileInput = screen.getByTestId("file-input") as HTMLInputElement;
			const file = new File(["test"], "test.xlsx", { type: "application/xlsx" });

			await user.upload(fileInput, file);

			await waitFor(() => {
				expect(asyncOnFileSelect).toHaveBeenCalledWith(file);
			});
		});

		it("should handle onFileSelect that throws error", async () => {
			const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
			const errorOnFileSelect = vi.fn().mockRejectedValue(new Error("Upload failed"));

			renderComponent({ onFileSelect: errorOnFileSelect });

			const dropZone = screen.getByTestId("file-upload-zone") as HTMLElement;
			const file = new File(["test"], "test.xlsx", { type: "application/xlsx" });

			const dropEvent = new Event("drop", { bubbles: true }) as any;
			dropEvent.dataTransfer = { files: [file] };
			dropEvent.preventDefault = vi.fn();

			await waitFor(() => {
				dropZone.dispatchEvent(dropEvent);
				expect(errorOnFileSelect).toHaveBeenCalled();
			});

			consoleErrorSpy.mockRestore();
		});

		it("should handle rapid drag over and leave events", async () => {
			const { container } = renderComponent();

			const dropZone = container.querySelector(".cursor-pointer") as HTMLElement;

			for (let i = 0; i < 10; i++) {
				const dragOverEvent = new Event("dragover", { bubbles: true }) as any;
				dragOverEvent.preventDefault = vi.fn();
				dragOverEvent.dataTransfer = {};

				await waitFor(() => {
					dropZone.dispatchEvent(dragOverEvent);
				});

				const dragLeaveEvent = new Event("dragleave", { bubbles: true }) as any;
				dragLeaveEvent.preventDefault = vi.fn();
				dragLeaveEvent.dataTransfer = {};

				await waitFor(() => {
					dropZone.dispatchEvent(dragLeaveEvent);
				});
			}

			await waitFor(() => {
				expect(dropZone).toHaveClass("border-input/90");
			});
		});
	});
});
