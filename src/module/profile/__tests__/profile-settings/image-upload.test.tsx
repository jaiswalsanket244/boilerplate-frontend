import { ImageUploadButton } from "@/module/profile/components/image-upload";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockOnImageSelect = vi.fn();
const mockOnImageRemove = vi.fn();

function renderComponent(props = {}) {
	return render(
		<ImageUploadButton
			currentImageUrl={undefined}
			fallbackText="JD"
			onImageSelect={mockOnImageSelect}
			onImageRemove={mockOnImageRemove}
			{...props}
		/>
	);
}
const mockFile = new File(["content"], "test.jpg", { type: "image/jpeg" });
const addFile = async (user: UserEvent, file?: File) => {
	const input = screen.getByTestId("file-input");

	await user.upload(input, file || mockFile);
};

describe("ImageUploadButton Component", () => {
	let user: UserEvent;
	beforeEach(() => {
		vi.clearAllMocks();
		URL.createObjectURL = vi.fn(() => "blob:mock-url");
		user = userEvent.setup();
	});

	describe("Rendering", () => {
		it("should render with fallback text when no image", () => {
			renderComponent();

			expect(screen.getByTestId("avatar-fallback")).toHaveTextContent("JD");
			expect(screen.queryByTestId("avatar-image")).not.toBeInTheDocument();
		});

		it("should render with image when URL provided", () => {
			renderComponent({ currentImageUrl: "https://example.com/avatar.jpg" });

			const image = screen.getByTestId("avatar-image");
			expect(image).toHaveAttribute("src", "https://example.com/avatar.jpg");
		});

		it("should handle array of image URLs", () => {
			renderComponent({ currentImageUrl: ["https://example.com/avatar1.jpg", "https://example.com/avatar2.jpg"] });

			const image = screen.getByTestId("avatar-image");
			expect(image).toHaveAttribute("src", "https://example.com/avatar1.jpg");
		});

		it("should show fallback when array is empty", () => {
			renderComponent({ currentImageUrl: [] });
			expect(screen.getByTestId("avatar-fallback")).toHaveTextContent("JD");
		});

		it("should handle null in image array", () => {
			renderComponent({ currentImageUrl: null });
			expect(screen.getByTestId("avatar-fallback")).toBeInTheDocument();
		});

		it("should handle empty string image URL", () => {
			renderComponent({ currentImageUrl: "" });

			expect(screen.getByTestId("avatar-fallback")).toBeInTheDocument();
		});

		it("should use default fallback text", () => {
			renderComponent({ fallbackText: undefined });

			expect(screen.getByTestId("avatar-fallback")).toHaveTextContent("U");
		});

		it("should apply custom className", () => {
			renderComponent({ className: "h-32 w-32" });

			const avatar = screen.getByTestId("avatar");
			expect(avatar).toHaveClass("h-32", "w-32");
		});

		it("should show loading state when uploading", () => {
			renderComponent({ isUploading: true });

			expect(screen.getByTestId("loader")).toBeInTheDocument();
		});
	});

	describe("File Upload", () => {
		it("should handle file selection", async () => {
			renderComponent();

			await addFile(user);

			await waitFor(() => {
				expect(mockOnImageSelect).toHaveBeenCalledWith(mockFile, "blob:mock-url");
			});
		});
		it("should reject non-image files", async () => {
			renderComponent();
			// 1. Open dropdown
			const trigger = screen.getByTestId("image-upload-button");
			await user.click(trigger);

			// 2. Click "Upload a file"
			const uploadBtn = await screen.findByTestId("upload-file-button");
			await user.click(uploadBtn);

			// 3. Now upload the non-image file
			const fileInput = screen.getByTestId("file-input");
			const nonImage = new File(["content"], "test.pdf", { type: "application/pdf" });
			fileInput.setAttribute("accept", "");

			await user.upload(fileInput, nonImage);

			// 4. Assert error message
			await waitFor(() => {
				expect(screen.getByText(/Please select an image file/i)).toBeInTheDocument();
			});

			// 5. Callback should NOT be called
			expect(mockOnImageSelect).not.toHaveBeenCalled();

			// should clear error message when user selects an valid file
			await user.upload(fileInput, mockFile);

			await waitFor(() => {
				expect(screen.queryByText("Please select an image file")).not.toBeInTheDocument();
				expect(mockOnImageSelect).toHaveBeenCalled();
			});
		});

		it("should reject files larger than 5MB", async () => {
			renderComponent();

			// Create a file larger than 5MB
			const largeContent = new Array(6 * 1024 * 1024).fill("a").join("");

			const file = new File([largeContent], "large.jpg", { type: "image/jpeg" });

			Object.defineProperty(file, "size", { value: 6 * 1024 * 1024 });

			// Upload the file
			const input = screen.getByTestId("file-input");

			await user.upload(input, file);

			await waitFor(() => {
				expect(screen.getByText("Image size should be less than 5MB")).toBeInTheDocument();
				expect(mockOnImageSelect).not.toHaveBeenCalled();
			});
		});

		it("should not call onImageSelect when no file selected", async () => {
			renderComponent();

			const uploadButton = screen.getByText("Upload a file");
			await user.click(uploadButton);

			// Click doesn't actually select a file
			expect(mockOnImageSelect).not.toHaveBeenCalled();
		});
	});

	describe("File Removal", () => {
		it("should call onImageRemove when delete button clicked", async () => {
			renderComponent({ currentImageUrl: "https://example.com/avatar.jpg" });

			const deleteButton = screen.getByRole("button", { name: /delete/i });
			await user.click(deleteButton);

			expect(mockOnImageRemove).toHaveBeenCalled();
		});

		it("should not show delete button when no image", () => {
			renderComponent();

			expect(screen.queryByText("Delete")).not.toBeInTheDocument();
		});

		it("should reset file input after deletion", async () => {
			renderComponent({ currentImageUrl: "https://example.com/avatar.jpg" });

			const input = screen.getByTestId("file-input") as HTMLInputElement;
			const deleteButton = screen.getByText("Delete");

			await user.click(deleteButton);

			expect(input.value).toBe("");
		});
	});

	describe("Image Load Error", () => {
		it("should handle image load error", () => {
			const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

			renderComponent({ currentImageUrl: "https://example.com/broken.jpg" });

			const image = screen.getByTestId("avatar-image");
			const errorEvent = new Event("error");
			image.dispatchEvent(errorEvent);

			expect(consoleError).toHaveBeenCalledWith("Image failed to load:", expect.anything());

			consoleError.mockRestore();
		});
	});
});
