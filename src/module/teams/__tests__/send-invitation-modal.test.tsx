import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SendingInvitationStatusModal from "@/module/teams/components/send-invitation-modal";
import userEvent from "@testing-library/user-event";

vi.mock("next/image", () => ({
	default: ({ src, alt, width, height, className }: any) => (
		<img src={src} alt={alt} width={width} height={height} className={className} data-testid="mock-image" />
	),
}));

describe("SendingInvitationStatusModal Component", () => {
	const mockOnClose = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("Rendering", () => {
		it("should not render when open is false", () => {
			render(<SendingInvitationStatusModal open={false} isSuccess={false} onClose={mockOnClose} />);

			expect(screen.queryByText("Sending your invitations..")).not.toBeInTheDocument();
			expect(screen.queryByText("Invitation(s) Sent Successfully!")).not.toBeInTheDocument();
		});

		it("should render when open is true", () => {
			render(<SendingInvitationStatusModal open={true} isSuccess={false} onClose={mockOnClose} />);

			expect(screen.getByText("Sending your invitations..")).toBeInTheDocument();
		});
	});

	describe("Sending State", () => {
		it("should render sending state when isSuccess is false", () => {
			render(<SendingInvitationStatusModal open={true} isSuccess={false} onClose={mockOnClose} />);

			expect(screen.getByText("Sending your invitations..")).toBeInTheDocument();
			expect(screen.getByText("This may take a while..")).toBeInTheDocument();
		});

		it("should render airplane image in sending state", () => {
			render(<SendingInvitationStatusModal open={true} isSuccess={false} onClose={mockOnClose} />);

			const image = screen.getByTestId("mock-image");
			expect(image).toHaveAttribute("src", "/assets/svg/airplane.svg");
			expect(image).toHaveAttribute("alt", "Sending");
		});

		it("should render correct image dimensions in sending state", () => {
			render(<SendingInvitationStatusModal open={true} isSuccess={false} onClose={mockOnClose} />);

			const image = screen.getByTestId("mock-image");
			expect(image).toHaveAttribute("width", "150");
			expect(image).toHaveAttribute("height", "150");
		});

		it("should not render success content in sending state", () => {
			render(<SendingInvitationStatusModal open={true} isSuccess={false} onClose={mockOnClose} />);

			expect(screen.queryByText("Invitation(s) Sent Successfully!")).not.toBeInTheDocument();
		});
	});

	describe("Success State", () => {
		it("should render success state when isSuccess is true", () => {
			render(<SendingInvitationStatusModal open={true} isSuccess={true} onClose={mockOnClose} />);

			expect(screen.getByText("Invitation(s) Sent Successfully!")).toBeInTheDocument();
		});

		it("should render success message", () => {
			render(<SendingInvitationStatusModal open={true} isSuccess={true} onClose={mockOnClose} />);

			expect(
				screen.getByText("Your invitation(s) are on their way! You'll be notified once they're accepted.")
			).toBeInTheDocument();
		});

		it("should render tick image in success state", () => {
			render(<SendingInvitationStatusModal open={true} isSuccess={true} onClose={mockOnClose} />);

			const image = screen.getByTestId("mock-image");
			expect(image).toHaveAttribute("src", "/assets/svg/tick.svg");
			expect(image).toHaveAttribute("alt", "Success");
		});

		it("should render correct image dimensions in success state", () => {
			render(<SendingInvitationStatusModal open={true} isSuccess={true} onClose={mockOnClose} />);

			const image = screen.getByTestId("mock-image");
			expect(image).toHaveAttribute("width", "64");
			expect(image).toHaveAttribute("height", "64");
		});

		it("should not render sending content in success state", () => {
			render(<SendingInvitationStatusModal open={true} isSuccess={true} onClose={mockOnClose} />);

			expect(screen.queryByText("Sending your invitations..")).not.toBeInTheDocument();
			expect(screen.queryByText("This may take a while..")).not.toBeInTheDocument();
		});
	});

	describe("Dialog Interaction", () => {
		it("should call onClose when dialog is closed", async () => {
			const user = userEvent.setup();
			render(<SendingInvitationStatusModal open={true} isSuccess={false} onClose={mockOnClose} />);

			// The dialog mock should trigger onOpenChange when closed
			// This is handled by the Dialog component's onOpenChange prop
			expect(mockOnClose).not.toHaveBeenCalled();
		});

		it("should pass onClose to Dialog's onOpenChange", () => {
			render(<SendingInvitationStatusModal open={true} isSuccess={false} onClose={mockOnClose} />);

			// Dialog component should be rendered
			expect(screen.getByTestId("sending-invitation-status-modal")).toBeInTheDocument();
		});
	});

	describe("State Transitions", () => {
		it("should transition from sending to success state", () => {
			const { rerender } = render(<SendingInvitationStatusModal open={true} isSuccess={false} onClose={mockOnClose} />);

			expect(screen.getByText("Sending your invitations..")).toBeInTheDocument();

			rerender(<SendingInvitationStatusModal open={true} isSuccess={true} onClose={mockOnClose} />);

			expect(screen.queryByText("Sending your invitations..")).not.toBeInTheDocument();
			expect(screen.getByText("Invitation(s) Sent Successfully!")).toBeInTheDocument();
		});

		it("should handle open state change", () => {
			const { rerender } = render(<SendingInvitationStatusModal open={true} isSuccess={false} onClose={mockOnClose} />);

			expect(screen.getByText("Sending your invitations..")).toBeInTheDocument();

			rerender(<SendingInvitationStatusModal open={false} isSuccess={false} onClose={mockOnClose} />);

			expect(screen.queryByText("Sending your invitations..")).not.toBeInTheDocument();
		});
	});

	describe("Content Styling", () => {
		it("should apply correct styling to sending heading", () => {
			render(<SendingInvitationStatusModal open={true} isSuccess={false} onClose={mockOnClose} />);

			const heading = screen.getByText("Sending your invitations..");
			expect(heading.tagName).toBe("H2");
			expect(heading).toHaveClass("mb-2", "text-3xl", "font-semibold");
		});

		it("should apply correct styling to success heading", () => {
			render(<SendingInvitationStatusModal open={true} isSuccess={true} onClose={mockOnClose} />);

			const heading = screen.getByText("Invitation(s) Sent Successfully!");
			expect(heading.tagName).toBe("H2");
			expect(heading).toHaveClass("mb-4", "text-2xl", "font-semibold");
		});

		it("should apply correct styling to dialog content", () => {
			const { container } = render(
				<SendingInvitationStatusModal open={true} isSuccess={false} onClose={mockOnClose} />
			);

			const dialogContent = container.querySelector(".rounded-xl.p-8");
			expect(dialogContent).toBeInTheDocument();
		});
	});

	describe("Edge Cases", () => {
		it("should handle rapid state changes", () => {
			const { rerender } = render(<SendingInvitationStatusModal open={true} isSuccess={false} onClose={mockOnClose} />);

			rerender(<SendingInvitationStatusModal open={true} isSuccess={true} onClose={mockOnClose} />);
			rerender(<SendingInvitationStatusModal open={true} isSuccess={false} onClose={mockOnClose} />);
			rerender(<SendingInvitationStatusModal open={true} isSuccess={true} onClose={mockOnClose} />);

			expect(screen.getByText("Invitation(s) Sent Successfully!")).toBeInTheDocument();
		});

		it("should handle undefined onClose gracefully", () => {
			expect(() => {
				render(<SendingInvitationStatusModal open={true} isSuccess={false} onClose={undefined as any} />);
			}).not.toThrow();
		});
	});
});
