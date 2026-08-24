import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Pagination } from "@/components/common/pagination/pagination";
import userEvent from "@testing-library/user-event";

const defaultProps = {
	page: 1,
	pageSize: 10,
	totalPages: 5,
	totalItems: 100,
	handlePageChange: vi.fn(),
	handlePageSizeChange: vi.fn(),
};

const renderComponent = (props = {}) => render(<Pagination {...defaultProps} {...props} />);

describe("Pagination Component", () => {
	let user = userEvent.setup();
	beforeEach(() => {
		vi.clearAllMocks();
		user = userEvent.setup();
	});

	describe("Rendering", () => {
		it("renders root pagination component", () => {
			renderComponent();
			expect(screen.getByTestId("pagination-component")).toBeInTheDocument();
		});

		it("shows correct result range text", () => {
			renderComponent({ page: 2, pageSize: 10, totalItems: 42 });
			expect(screen.getByText("Showing 11-20 of 42 results")).toBeInTheDocument();
		});

		it("shows correct ending when fewer results on last page", () => {
			renderComponent({ page: 5, totalItems: 47, totalPages: 5 });
			expect(screen.getByText("Showing 41-47 of 47 results")).toBeInTheDocument();
		});
	});

	describe("Prev / Next buttons", () => {
		it("disables prev button on first page", () => {
			renderComponent({ page: 1 });
			expect(screen.getByTestId("prev-page-button")).toBeDisabled();
		});

		it("disables next button on last page", () => {
			renderComponent({ page: 5 });
			expect(screen.getByTestId("next-page-button")).toBeDisabled();
		});

		it("calls handlePageChange on page number click", async () => {
			renderComponent({ page: 2 });
			await user.click(screen.getByRole("button", { name: "3" }));
			expect(defaultProps.handlePageChange).toHaveBeenCalledWith(3);
		});

		it("calls handlePageChange when clicking Prev", async () => {
			renderComponent({ page: 3 });
			await user.click(screen.getByTestId("prev-page-button"));
			expect(defaultProps.handlePageChange).toHaveBeenCalledWith(2);
		});

		it("calls handlePageChange when clicking Next", async () => {
			renderComponent({ page: 3 });
			await user.click(screen.getByTestId("next-page-button"));
			expect(defaultProps.handlePageChange).toHaveBeenCalledWith(4);
		});
	});

	describe("Page number buttons", () => {
		it("marks current page button as active variant", () => {
			renderComponent({ page: 3 });
			const currentBtn = screen.getByRole("button", { name: "3" });
			expect(currentBtn).toHaveClass("h-8");
		});

		it("renders dots when middle pages are hidden", () => {
			renderComponent({ page: 3, totalPages: 10 });
			expect(screen.getAllByText("...").length).toBeGreaterThan(0);
		});

		it("does NOT show dots when pages are small", () => {
			renderComponent({ page: 2, totalPages: 3 });
			expect(screen.queryByText("...")).not.toBeInTheDocument();
		});
	});

	describe("Page size dropdown", () => {
		it("shows page size select only when handler exists", () => {
			renderComponent();
			expect(screen.getByText("Page size")).toBeInTheDocument();
		});

		it("hides page size select when handler undefined", () => {
			renderComponent({ handlePageSizeChange: undefined });
			expect(screen.queryByText("Page size")).not.toBeInTheDocument();
		});

		it("shows size options when select is available", async () => {
			renderComponent();
			await user.click(screen.getByText("Page size"));
			expect(screen.getByTestId("option-10")).toBeInTheDocument();
			expect(screen.getByTestId("option-100")).toBeInTheDocument();
		});

		it("triggers handlePageSizeChange on select option change", async () => {
			renderComponent({ pageSize: 10 });
			fireEvent.change(screen.getByTestId("page-size-select"), {
				target: { value: "25" },
			});
			expect(defaultProps.handlePageSizeChange).toHaveBeenCalledWith(25);
		});
	});

	describe("Edge cases", () => {
		it("renders only 1 page button when totalPages=1", () => {
			renderComponent({ totalPages: 1, page: 1 });
			expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
			expect(screen.getByTestId("prev-page-button")).toBeDisabled();
			expect(screen.getByTestId("next-page-button")).toBeDisabled();
		});

		it("handles case totalItems < pageSize", () => {
			renderComponent({ totalItems: 5, pageSize: 10 });
			expect(screen.getByText("Showing 1-5 of 5 results")).toBeInTheDocument();
		});

		it("inserts missing page instead of dots when gap = 1", () => {
			renderComponent({ page: 3, totalPages: 4 });
			expect(screen.queryByText("...")).not.toBeInTheDocument();
		});
	});
});
