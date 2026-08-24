import { QueryCard } from "@/module/profile/components/previous-queries/query-card";
import { ITicketCardProps, IUserQuery, USER_QUERY_STATUS, USER_QUERY_SUBJECT } from "@/module/profile/types";
import { render, screen } from "@testing-library/react";
import { format } from "date-fns";
import { describe, expect, it } from "vitest";

const mockQuery: IUserQuery = {
	_id: "123",
	subject: USER_QUERY_SUBJECT.GENERAL,
	status: USER_QUERY_STATUS.PENDING,
	message: "This is a test message",
	createdAt: "2023-01-01T12:00:00Z",
	email: "test@example.com",
	name: { first: "John", last: "Doe" },
	userName: "John Doe",
};

function renderComponent(props?: Partial<ITicketCardProps>) {
	return render(<QueryCard query={mockQuery} isNew={false} {...props} />);
}

describe("QueryCard Component", () => {
	it("should render query details correctly", () => {
		renderComponent();

		const createdAt = format(new Date(mockQuery.createdAt), "dd/MM/yyyy");

		expect(screen.getByText(mockQuery.subject)).toBeInTheDocument();
		expect(screen.getByText(mockQuery.message)).toBeInTheDocument();
		expect(screen.getByText(`#${mockQuery._id}`)).toBeInTheDocument();
		expect(screen.getByText(`Date: ${createdAt}`)).toBeInTheDocument();
	});

	it("should render status badge", () => {
		renderComponent();
		expect(screen.getByText(mockQuery.status)).toBeInTheDocument();
	});

	it("should apply 'new' styling when isNew is true", () => {
		renderComponent({ isNew: true });

		// The component uses relative positioning on the main div
		// We can find the element that contains the subject or message and check its parent
		// Or we can query by text and traverse up
		const card = screen.getByText(mockQuery.message).closest("div.relative");

		expect(card).toHaveClass("border-info/40", "bg-blue-50/60");
	});

	it("should not apply 'new' styling when isNew is false", () => {
		renderComponent({ isNew: false });

		const card = screen.getByText(mockQuery.message).closest("div.relative");

		expect(card).not.toHaveClass("border-info/40", "bg-blue-50/60");
	});
});
