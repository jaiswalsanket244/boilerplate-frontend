import { StatusBadge } from "@/module/profile/components/previous-queries/status-badge";
import { USER_QUERY_STATUS } from "@/module/profile/types";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("StatusBadge Component", () => {
	it("should render the status text", () => {
		render(<StatusBadge status={USER_QUERY_STATUS.PENDING} />);
		expect(screen.getByText(USER_QUERY_STATUS.PENDING)).toBeInTheDocument();
	});

	it("should apply correct styles for PENDING status", () => {
		render(<StatusBadge status={USER_QUERY_STATUS.PENDING} />);
		const badge = screen.getByText(USER_QUERY_STATUS.PENDING);
		expect(badge).toHaveClass("bg-yellow-50", "text-yellow-700", "border-yellow-100");
	});

	it("should apply correct styles for RESOLVED status", () => {
		render(<StatusBadge status={USER_QUERY_STATUS.RESOLVED} />);
		const badge = screen.getByText(USER_QUERY_STATUS.RESOLVED);
		expect(badge).toHaveClass("bg-green-50", "text-green-700", "border-green-100");
	});

	it("should apply correct styles for IN_PROGRESS status", () => {
		render(<StatusBadge status={USER_QUERY_STATUS.IN_PROGRESS} />);
		const badge = screen.getByText(USER_QUERY_STATUS.IN_PROGRESS);
		expect(badge).toHaveClass("bg-blue-50", "text-blue-700", "border-blue-100");
	});

	it("should apply correct styles for CLOSED status", () => {
		render(<StatusBadge status={USER_QUERY_STATUS.CLOSED} />);
		const badge = screen.getByText(USER_QUERY_STATUS.CLOSED);
		expect(badge).toHaveClass("bg-gray-100", "text-gray-900", "border-gray-200");
	});

	it("should merge custom className", () => {
		render(<StatusBadge status={USER_QUERY_STATUS.PENDING} className="custom-class" />);
		const badge = screen.getByText(USER_QUERY_STATUS.PENDING);
		expect(badge).toHaveClass("custom-class");
	});
});
