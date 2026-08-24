import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import ExcelUserImport from "@/module/teams/components/invite-users/excel-user-import";
import type { IExcelUserImportProps, UserInviteDetails } from "@/module/teams/types";

describe("ExcelUserImport Component", () => {
	const mockSetUsers = vi.fn();
	const user = userEvent.setup();

	const mockUsers: UserInviteDetails[] = [
		{
			id: "1",
			email: "john@example.com",
			firstName: "John",
			lastName: "Doe",
		},
		{
			id: "2",
			email: "jane@example.com",
			firstName: "Jane",
			lastName: "Smith",
		},
	];

	const renderComponent = (props?: Partial<IExcelUserImportProps>) =>
		render(<ExcelUserImport users={mockUsers} setUsers={mockSetUsers} {...props} />);

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("Rendering", () => {
		it("should render FileUploadZone when no file is attached", () => {
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

			expect(screen.getByText(/\.xlsx\/\.xls/)).toBeInTheDocument();
			expect(screen.getByText(/Max/)).toBeInTheDocument();
		});
	});

	describe("File Upload", () => {
		it("should have file input element", () => {
			renderComponent();

			const fileInput = screen.getByTestId("file-input");
			expect(fileInput).toBeInTheDocument();
		});

		it("should accept xlsx and xls files", () => {
			renderComponent();

			const fileInput = screen.getByTestId("file-input") as HTMLInputElement;
			const acceptAttr = fileInput.getAttribute("accept");

			expect(acceptAttr).toContain(".xlsx");
			expect(acceptAttr).toContain(".xls");
		});

		it("should trigger file selection when Browse Files is clicked", async () => {
			renderComponent();

			const browseButton = screen.getByText("Browse Files");
			const fileInput = screen.getByTestId("file-input") as HTMLInputElement;

			const clickSpy = vi.spyOn(fileInput, "click");

			await user.click(browseButton);

			expect(clickSpy).toHaveBeenCalled();
		});
	});

	describe("Drag and Drop", () => {
		it("should handle drag over event", async () => {
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

			// Drag over
			const dragOverEvent = new Event("dragover", { bubbles: true }) as any;
			dragOverEvent.preventDefault = vi.fn();
			dragOverEvent.dataTransfer = {};

			await waitFor(() => {
				dropZone.dispatchEvent(dragOverEvent);
			});
			// Drag leave
			const dragLeaveEvent = new Event("dragleave", { bubbles: true }) as any;
			dragLeaveEvent.preventDefault = vi.fn();
			dragLeaveEvent.dataTransfer = {};

			await waitFor(() => {
				dropZone.dispatchEvent(dragLeaveEvent);

				expect(dropZone).toHaveClass("border-input/90");
			});
		});
	});

	describe("Users Display", () => {
		it("should not render users table when upload is not complete", () => {
			renderComponent();

			// Without file upload, table should not be visible
			expect(screen.queryByPlaceholderText("Search users...")).not.toBeInTheDocument();
		});

		it("should render container with correct styling", () => {
			const { container } = renderComponent({ users: [] });

			const mainDiv = container.querySelector(".mx-auto.max-w-6xl.space-y-6.p-6");
			expect(mainDiv).toBeInTheDocument();
		});
	});

	describe("Edge Cases", () => {
		it("should return null when users is null", () => {
			const { container } = renderComponent({ users: null as any });

			expect(container.firstChild).toBeNull();
		});

		it("should handle empty users array", () => {
			renderComponent({ users: [] });

			expect(screen.getByText("Drag & drop your Excel file or")).toBeInTheDocument();
		});

		it("should handle users with default empty array", () => {
			// Component has default users = []
			renderComponent({ users: undefined as any });

			// Should still render without crashing
			expect(screen.queryByText("Drag & drop your Excel file or")).toBeInTheDocument();
		});

		it("should handle large number of users", () => {
			const manyUsers = Array.from({ length: 100 }, (_, i) => ({
				id: `${i}`,
				email: `user${i}@example.com`,
				firstName: `User${i}`,
				lastName: `Last${i}`,
			}));

			renderComponent({ users: manyUsers });

			// Should render without crashing
			expect(screen.getByText("Drag & drop your Excel file or")).toBeInTheDocument();
		});

		it("should handle users with errors", () => {
			const usersWithErrors: UserInviteDetails[] = [
				{
					id: "1",
					email: "invalid",
					firstName: "",
					lastName: "Doe",
					errors: ["Invalid email", "First name required"],
				},
			];

			renderComponent({ users: usersWithErrors });

			// Should render without crashing
			expect(screen.getByText("Drag & drop your Excel file or")).toBeInTheDocument();
		});

		it("should handle users with special characters", () => {
			const specialUsers: UserInviteDetails[] = [
				{
					id: "1",
					email: "test+tag@example.com",
					firstName: "José",
					lastName: "O'Brien-Smith",
				},
			];

			renderComponent({ users: specialUsers });

			expect(screen.getByText("Drag & drop your Excel file or")).toBeInTheDocument();
		});

		it("should handle users without id", () => {
			const usersWithoutId: UserInviteDetails[] = [
				{
					email: "test@example.com",
					firstName: "Test",
					lastName: "User",
				} as any,
			];

			renderComponent({ users: usersWithoutId });

			expect(screen.getByText("Drag & drop your Excel file or")).toBeInTheDocument();
		});
	});

	describe("Initial State", () => {
		it("should show upload zone on initial render", () => {
			renderComponent();

			expect(screen.getByText("Drag & drop your Excel file or")).toBeInTheDocument();
		});

		it("should not show validation status on initial render", () => {
			renderComponent();

			expect(screen.queryByText("Validating data...")).not.toBeInTheDocument();
			expect(screen.queryByText(/invalid/)).not.toBeInTheDocument();
		});

		it("should not show users table on initial render", () => {
			renderComponent();

			expect(screen.queryByPlaceholderText("Search users...")).not.toBeInTheDocument();
		});
	});

	describe("Accessibility", () => {
		it("should have accessible file input", () => {
			renderComponent();

			const fileInput = screen.getByTestId("file-input");
			expect(fileInput).toBeInTheDocument();
		});

		it("should have accessible button", () => {
			renderComponent();

			const browseButton = screen.getByRole("button", { name: "Browse Files" });
			expect(browseButton).toBeInTheDocument();
		});

		it("should be keyboard navigable", async () => {
			renderComponent();

			const browseButton = screen.getByRole("button", { name: "Browse Files" });

			await user.tab();

			expect(browseButton).toHaveFocus();
		});
	});
});
