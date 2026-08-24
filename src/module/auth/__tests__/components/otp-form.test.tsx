import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { vi } from "vitest";

import OtpForm from "@/module/auth/components/otp-form";
import type { InputOTPGroupMockProps, InputOTPMockProps, InputOTPSlotMockProps } from "@/tests/types/input-otp-mock";

// Mock the input-otp UI primitives used by the component to a simple controlled input.
// The real implementation uses multiple slots; for unit testing OtpForm's behavior
// it's enough to simulate a single input that accepts digits and calls onChange/onKeyDown.

vi.mock("@/components/ui/input-otp", () => ({
	InputOTP: ({ value, onChange, onKeyDown, id, children, "data-testid": dataTestId }: InputOTPMockProps) => (
		<div>
			<input
				data-testid={dataTestId ?? "input-otp"}
				id={id}
				value={value ?? ""}
				onChange={(e) => onChange?.(e.target.value)}
				onKeyDown={onKeyDown}
				aria-label="otp-input"
			/>
			{children}
		</div>
	),
	InputOTPGroup: ({ children }: InputOTPGroupMockProps) => <div data-testid="input-otp-group">{children}</div>,
	InputOTPSeparator: () => <span data-testid="input-otp-sep">-</span>,
	InputOTPSlot: ({ index }: InputOTPSlotMockProps) => <span data-testid={`otp-slot-${index}`}>{index}</span>,
}));

describe("OtpForm component", () => {
	// The optional flags are deliberately absent here so tests can render the component
	// without them and exercise the parameter defaults.
	const requiredProps = {
		email: "user@example.test",
		title: "Verify Email",
		description: "We've sent you an email with an OTP on",
		submitButtonText: "Verify Email",
		otpLength: 4,
		onSubmit: vi.fn(),
	};
	const defaultProps = {
		...requiredProps,
		setIsIncorrectOtp: vi.fn(),
		isIncorrectOtp: false,
		isCorrectOtp: false,
		isLoading: false,
	};
	let user: UserEvent;

	beforeEach(() => {
		vi.clearAllMocks();
		user = userEvent.setup();
	});

	it("renders title, description and email", () => {
		render(<OtpForm {...defaultProps} />);
		expect(screen.getByRole("heading", { name: defaultProps.title })).toBeInTheDocument();
		expect(screen.getByText(/we've sent you an email with an otp on/i)).toBeInTheDocument();
		expect(screen.getByText(`${defaultProps.email}.`)).toBeInTheDocument();
	});

	it("submit button disabled until otp length is reached", async () => {
		render(<OtpForm {...defaultProps} />);
		const btn = screen.getByRole("button", { name: defaultProps.submitButtonText }) as HTMLButtonElement;

		// initially disabled because otp empty
		expect(btn).toBeDisabled();

		// type shorter than otpLength -> still disabled
		const input = screen.getByTestId("input-otp");
		await user.type(input, "12");
		expect(btn).toBeDisabled();

		// type until length equals otpLength -> enabled
		await user.clear(input);
		await user.type(input, "1234");
		await waitFor(() => expect(btn).not.toBeDisabled());
	});

	it("calls onSubmit with form value on button submit", async () => {
		const onSubmit = vi.fn();
		render(<OtpForm {...defaultProps} onSubmit={onSubmit} />);
		const input = screen.getByTestId("input-otp");

		// enter otp of required length
		await user.type(input, "9876");

		// click submit
		const btn = screen.getByRole("button", { name: defaultProps.submitButtonText });
		await user.click(btn);

		await waitFor(() => {
			expect(onSubmit).toHaveBeenCalledTimes(1);
			// onSubmit receives an object typed as OtpFormData { otp: string }
			expect(onSubmit).toHaveBeenCalledWith({ otp: "9876" }, expect.anything());
		});
	});

	it("submits when Enter pressed and otp length equals otpLength", async () => {
		const onSubmit = vi.fn();

		render(<OtpForm {...defaultProps} onSubmit={onSubmit} />);
		const input = screen.getByTestId("input-otp");

		await user.type(input, "1234");

		await waitFor(() => {
			expect(input).toHaveValue("1234");
			expect(onSubmit).not.toHaveBeenCalled();
		});

		user.keyboard("{Enter}");

		await waitFor(() => {
			expect(onSubmit).toHaveBeenCalledTimes(1);
		});
	});

	it("shows error message when isIncorrectOtp prop is true", async () => {
		// When isIncorrectOtp is true component sets a form error message via useEffect
		render(<OtpForm {...defaultProps} isIncorrectOtp={true} />);

		// The FieldError uses the message "Incorrect OTP. Please try again"
		expect(await screen.findByText(/incorrect otp\. please try again/i)).toBeInTheDocument();
	});

	it("shows success message and icon when isCorrectOtp is true", async () => {
		render(<OtpForm {...defaultProps} isCorrectOtp={true} />);

		// The success banner "OTP verified!" and mocked CheckCircle should be visible
		expect(screen.getByText(/otp verified!/i)).toBeInTheDocument();
		expect(screen.getByTestId("check-circle")).toBeInTheDocument();
	});

	it("clears incorrect state (calls setIsIncorrectOtp) when input changes after incorrect", async () => {
		const setIsIncorrectOtp = vi.fn();
		render(<OtpForm {...defaultProps} isIncorrectOtp={true} setIsIncorrectOtp={setIsIncorrectOtp} />);

		const input = screen.getByTestId("input-otp");
		// User types something -> component's handleOtpChange should call setIsIncorrectOtp(false)
		await user.type(input, "2");

		// setIsIncorrectOtp should be invoked by the component's handler during onChange
		expect(setIsIncorrectOtp).toHaveBeenCalledWith(false);
	});

	it("does not allow submit when otp length is not equal to otpLength even if input value present", async () => {
		const onSubmit = vi.fn();
		render(<OtpForm {...defaultProps} onSubmit={onSubmit} />);
		const input = screen.getByTestId("input-otp") as HTMLInputElement;

		// type too-short otp and press Enter
		await user.type(input, "12");
		fireEvent.keyDown(input, { key: "Enter", code: "Enter", charCode: 13 });

		await waitFor(() => {
			expect(onSubmit).not.toHaveBeenCalled();
		});

		// Click submit button should also be disabled
		const btn = screen.getByRole("button", { name: defaultProps.submitButtonText }) as HTMLButtonElement;
		expect(btn).toBeDisabled();
	});

	describe("optional prop defaults", () => {
		it("defaults both otp status flags to false when the props are omitted", () => {
			render(<OtpForm {...requiredProps} />);

			expect(screen.queryByText(/incorrect otp\. please try again/i)).not.toBeInTheDocument();
			expect(screen.queryByText(/otp verified!/i)).not.toBeInTheDocument();
		});

		it("does not set a field error while isIncorrectOtp is false", () => {
			render(<OtpForm {...defaultProps} isIncorrectOtp={false} />);

			expect(screen.queryByText(/incorrect otp\. please try again/i)).not.toBeInTheDocument();
		});

		it("does not render the verified banner while isCorrectOtp is false", () => {
			render(<OtpForm {...defaultProps} isCorrectOtp={false} />);

			expect(screen.queryByText(/otp verified!/i)).not.toBeInTheDocument();
			expect(screen.queryByTestId("check-circle")).not.toBeInTheDocument();
		});
	});

	describe("clearing the error on change", () => {
		const changeOtp = (value: string) => fireEvent.change(screen.getByTestId("input-otp"), { target: { value } });

		it("clears the otp error once the user retypes", async () => {
			render(<OtpForm {...defaultProps} isIncorrectOtp />);
			expect(await screen.findByText(/incorrect otp\. please try again/i)).toBeInTheDocument();

			changeOtp("1");

			await waitFor(() => {
				expect(screen.queryByText(/incorrect otp\. please try again/i)).not.toBeInTheDocument();
			});
		});

		it("leaves setIsIncorrectOtp alone when there is no error to clear", () => {
			const setIsIncorrectOtp = vi.fn();
			render(<OtpForm {...defaultProps} setIsIncorrectOtp={setIsIncorrectOtp} />);

			changeOtp("12");

			expect(setIsIncorrectOtp).not.toHaveBeenCalled();
		});

		it("clears the error without setIsIncorrectOtp supplied", async () => {
			// The callback is optional; the handler must not blow up when it is absent.
			render(<OtpForm {...requiredProps} isIncorrectOtp />);
			expect(await screen.findByText(/incorrect otp\. please try again/i)).toBeInTheDocument();

			expect(() => changeOtp("1")).not.toThrow();

			await waitFor(() => {
				expect(screen.queryByText(/incorrect otp\. please try again/i)).not.toBeInTheDocument();
			});
		});
	});

	describe("invalid marker on the field wrapper", () => {
		it("flags the field invalid only while an otp error is present", async () => {
			const { rerender } = render(<OtpForm {...defaultProps} />);

			expect(screen.getByRole("group")).toHaveAttribute("data-invalid", "false");

			rerender(<OtpForm {...defaultProps} isIncorrectOtp />);

			await waitFor(() => {
				expect(screen.getByRole("group")).toHaveAttribute("data-invalid", "true");
			});
		});
	});

	describe("Enter key handling", () => {
		// fireEvent.keyDown exercises handleKeyDown in isolation. userEvent's Enter also
		// triggers the browser's implicit form submission, which would submit even if
		// handleKeyDown did nothing.
		const pressKey = (key: string) => fireEvent.keyDown(screen.getByTestId("input-otp"), { key, code: key });
		const enterOtp = (value: string) => fireEvent.change(screen.getByTestId("input-otp"), { target: { value } });

		// handleSubmit resolves the zod schema asynchronously. `waitFor` returns on the first
		// tick when the assertion already passes, so a bare `not.toHaveBeenCalled()` inside it
		// proves nothing — the queue has to be drained first.
		const settle = async () => {
			await act(async () => {
				await new Promise((resolve) => setTimeout(resolve, 0));
			});
		};

		// A blocked keypress never reaches validation, so the schema error must stay absent too.
		const expectNotSubmitted = async (onSubmit: ReturnType<typeof vi.fn>) => {
			await settle();
			expect(onSubmit).not.toHaveBeenCalled();
			expect(screen.queryByText(/otp must be exactly 4 digits/i)).not.toBeInTheDocument();
		};

		it("submits on Enter once the otp is exactly otpLength long", async () => {
			const onSubmit = vi.fn();
			render(<OtpForm {...defaultProps} onSubmit={onSubmit} />);

			enterOtp("1234");
			pressKey("Enter");

			await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
			// handleSubmit is invoked without an event here, unlike the click path.
			expect(onSubmit).toHaveBeenCalledWith({ otp: "1234" }, undefined);
		});

		it("ignores Enter while the otp is shorter than otpLength", async () => {
			const onSubmit = vi.fn();
			render(<OtpForm {...defaultProps} onSubmit={onSubmit} />);

			enterOtp("123");
			pressKey("Enter");

			await expectNotSubmitted(onSubmit);
		});

		it("ignores Enter while the otp is empty", async () => {
			const onSubmit = vi.fn();
			render(<OtpForm {...defaultProps} onSubmit={onSubmit} />);

			pressKey("Enter");

			await expectNotSubmitted(onSubmit);
		});

		it("ignores a non-Enter key even with a complete otp", async () => {
			const onSubmit = vi.fn();
			render(<OtpForm {...defaultProps} onSubmit={onSubmit} />);

			enterOtp("1234");
			pressKey("a");

			await expectNotSubmitted(onSubmit);
		});
	});

	/*
	  A second press while the first request is still running would verify the same code
	  twice — two logins, or two OTP verifications. There are two ways to submit this form,
	  the button and the Enter key, and Enter does not go through the button, so both have
	  to be blocked separately.
	*/
	describe("while a request is in flight", () => {
		const settle = async () => {
			await act(async () => {
				await new Promise((resolve) => setTimeout(resolve, 0));
			});
		};

		const fillOtp = () => fireEvent.change(screen.getByTestId("input-otp"), { target: { value: "1234" } });

		it("replaces the button label with a spinner and blocks the button", () => {
			render(<OtpForm {...defaultProps} isLoading />);
			fillOtp();

			expect(screen.queryByRole("button", { name: defaultProps.submitButtonText })).not.toBeInTheDocument();
			expect(screen.getByTestId("loader2-icon")).toBeInTheDocument();
			expect(screen.getByTestId("loader2-icon").closest("button")).toBeDisabled();
		});

		it("does not submit when the button is clicked", async () => {
			const onSubmit = vi.fn();
			render(<OtpForm {...defaultProps} isLoading onSubmit={onSubmit} />);
			fillOtp();

			await user.click(screen.getByTestId("loader2-icon").closest("button") as HTMLButtonElement);

			await settle();
			expect(onSubmit).not.toHaveBeenCalled();
		});

		it("does not submit when Enter is pressed", async () => {
			const onSubmit = vi.fn();
			render(<OtpForm {...defaultProps} isLoading onSubmit={onSubmit} />);
			fillOtp();

			fireEvent.keyDown(screen.getByTestId("input-otp"), { key: "Enter", code: "Enter" });

			await settle();
			expect(onSubmit).not.toHaveBeenCalled();
		});

		// handleKeyDown only calls preventDefault on the path it handles, so a real Enter
		// keystroke can still reach the browser's own "submit the form" behaviour.
		it("does not submit when a real Enter keystroke falls through to the form", async () => {
			const onSubmit = vi.fn();
			render(<OtpForm {...defaultProps} isLoading onSubmit={onSubmit} />);
			fillOtp();

			screen.getByTestId("input-otp").focus();
			await user.keyboard("{Enter}");

			await settle();
			expect(onSubmit).not.toHaveBeenCalled();
		});

		it("submits normally once the request has finished", async () => {
			const onSubmit = vi.fn();
			render(<OtpForm {...defaultProps} isLoading={false} onSubmit={onSubmit} />);
			fillOtp();

			await user.click(screen.getByRole("button", { name: defaultProps.submitButtonText }));

			await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
		});
	});

	describe("slot and separator layout", () => {
		const slots = () => screen.getAllByTestId(/^otp-slot-/);
		const separators = () => screen.queryAllByTestId("input-otp-sep");

		it("renders one slot per digit with a separator between each pair", () => {
			render(<OtpForm {...defaultProps} otpLength={4} />);

			expect(slots()).toHaveLength(4);
			expect(separators()).toHaveLength(3);
		});

		it("does not render a separator after the last slot", () => {
			render(<OtpForm {...defaultProps} otpLength={4} />);

			const children = Array.from(screen.getByTestId("input-otp-group").children);
			expect(children.at(-1)).toHaveAttribute("data-testid", "otp-slot-3");
		});

		it("keeps the separator count at otpLength - 1 for a longer code", () => {
			render(<OtpForm {...defaultProps} otpLength={6} />);

			expect(slots()).toHaveLength(6);
			expect(separators()).toHaveLength(5);
		});
	});
});
