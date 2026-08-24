import { Breadcrumb } from "@/module/profile/components/previous-queries/breadcrumb";
import { render, screen } from "@testing-library/react";
import { MemoryRouterProvider } from "next-router-mock/MemoryRouterProvider";
import { describe, expect, it } from "vitest";

const mockItems = [{ label: "Home", href: "/" }, { label: "Profile", href: "/profile" }, { label: "Queries" }];

function renderComponent() {
	return render(<Breadcrumb items={mockItems} />, { wrapper: MemoryRouterProvider });
}

describe("Breadcrumb Component", () => {
	it("should render all breadcrumb items", () => {
		renderComponent();

		expect(screen.getByText("Home")).toBeInTheDocument();
		expect(screen.getByText("Profile")).toBeInTheDocument();
		expect(screen.getByText("Queries")).toBeInTheDocument();
	});

	it("should render links for items with href", () => {
		renderComponent();

		const homeLink = screen.getByRole("link", { name: "Home" });
		expect(homeLink).toHaveAttribute("href", "/");

		const profileLink = screen.getByRole("link", { name: "Profile" });
		expect(profileLink).toHaveAttribute("href", "/profile");
	});

	it("should render text for items without href", () => {
		renderComponent();

		const queriesText = screen.getByText("Queries");
		expect(queriesText.closest("a")).toBeNull();
	});

	it("should render separators between items", () => {
		renderComponent();

		const separators = screen.getAllByTestId("chevron-right-icon");
		expect(separators.length).toBe(2);
	});

	it("should apply active style to the last item", () => {
		renderComponent();

		const lastItem = screen.getByText("Queries");
		expect(lastItem).toHaveClass("text-xl font-bold text-txt-primary-900");
	});
});
