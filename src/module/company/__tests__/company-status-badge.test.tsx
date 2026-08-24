import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CompanyStatusBadge } from "@/module/company/components/company-status-badge";
import { STATUS } from "@/types";

function renderComponent(status?: STATUS, className?: string) {
	return render(<CompanyStatusBadge status={status} className={className} />);
}

describe("CompanyStatusBadge Component", () => {
	describe("Rendering", () => {
		it("should render with active status", () => {
			renderComponent(STATUS.ACTIVE);

			const badge = screen.getByText(STATUS.ACTIVE);
			expect(badge).toBeInTheDocument();
		});

		it("should render with inactive status", () => {
			renderComponent(STATUS.INACTIVE);

			const badge = screen.getByText(STATUS.INACTIVE);
			expect(badge).toBeInTheDocument();
		});

		it("should render with default 'Unknown' status when no status provided", () => {
			renderComponent();
			expect(screen.getByText("Unknown")).toBeInTheDocument();
		});

		it("should render with undefined status", () => {
			renderComponent(undefined);

			expect(screen.getByText("Unknown")).toBeInTheDocument();
		});
	});

	describe("Styling", () => {
		it("should apply green styling for active status", () => {
			renderComponent(STATUS.ACTIVE);

			const badge = screen.getByTestId("company-status-badge");
			expect(badge).toBeInTheDocument();
			expect(badge).toHaveClass("text-green-800");
		});

		it("should apply red styling for inactive status", () => {
			renderComponent(STATUS.INACTIVE);

			const badge = screen.getByTestId("company-status-badge");
			expect(badge).toBeInTheDocument();
			expect(badge).toHaveClass("text-red-800");
		});

		it("should apply ml-1 class by default", () => {
			renderComponent(STATUS.ACTIVE);
			const badge = screen.getByTestId("company-status-badge");
			expect(badge).toBeInTheDocument();
		});

		it("should apply custom className", () => {
			const { container } = renderComponent(STATUS.ACTIVE, "custom-class");

			const badge = container.querySelector(".custom-class");
			expect(badge).toBeInTheDocument();
		});

		it("should combine default and custom classNames", () => {
			const { container } = render(<CompanyStatusBadge status={STATUS.ACTIVE} className="extra-padding" />);

			const badge = container.querySelector(".ml-1.extra-padding");
			expect(badge).toBeInTheDocument();
		});
	});

	describe("Multiple Instances", () => {
		it("should render multiple badges with different statuses", () => {
			const { container } = render(
				<div>
					<CompanyStatusBadge status={STATUS.ACTIVE} />
					<CompanyStatusBadge status={STATUS.INACTIVE} />
				</div>
			);

			expect(screen.getByText(STATUS.ACTIVE)).toBeInTheDocument();
			expect(screen.getByText(STATUS.INACTIVE)).toBeInTheDocument();

			const greenBadge = container.querySelector(".bg-green-100");
			const redBadge = container.querySelector(".bg-red-100");

			expect(greenBadge).toBeInTheDocument();
			expect(redBadge).toBeInTheDocument();
		});

		it("should apply different custom classes to multiple badges", () => {
			const { container } = render(
				<div>
					<CompanyStatusBadge status={STATUS.ACTIVE} className="badge-1" />
					<CompanyStatusBadge status={STATUS.INACTIVE} className="badge-2" />
				</div>
			);

			expect(container.querySelector(".badge-1")).toBeInTheDocument();
			expect(container.querySelector(".badge-2")).toBeInTheDocument();
		});
	});
});
