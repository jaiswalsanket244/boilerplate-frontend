import { render, screen, waitFor } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { vi } from "vitest";

import { routes } from "@/config/routes";
import type { VerifyOtpCallbacks } from "@/module/auth/__tests__/types/mutation-types";
import VerifySignupOtpForm from "@/module/auth/templates/verify-signup-otp-form";
import { type IVerifyOtpParams, OTP_PURPOSE } from "@/module/auth/types";
import type { InputOTPGroupMockProps, InputOTPMockProps } from "@/tests/types/input-otp-mock";
import { mutationCallbacks } from "@/tests/utils/mock-mutation";
import { mockRouter } from "@/tests/utils/mock-next-navigation";
import { renderWithProviders } from "@/tests/utils/mock-providers";
import { mockQueryClient } from "@/tests/utils/mock-react-query";

const mutateMock = vi.fn<(payload: IVerifyOtpParams, callbacks: VerifyOtpCallbacks) => void>();
const mutateCallbacks = () => mutationCallbacks(mutateMock, "verify-otp mutation");

vi.mock("@/module/auth/hooks/useAuth", () => ({
	useAuthAPI: () => ({
		useVerifyOtpMutation: () => ({
			mutate: mutateMock,
			isPending: false,
		}),
	}),
}));

vi.mock("@/components/ui/input-otp", () => {
	return {
		InputOTP: ({ value, onChange, onKeyDown }: Pick<InputOTPMockProps, "value" | "onChange" | "onKeyDown">) => (
			<input
				data-testid={"input-otp"}
				value={value ?? ""}
				onChange={(e) => onChange?.(e.target.value)}
				onKeyDown={onKeyDown}
			/>
		),
		InputOTPGroup: ({ children }: InputOTPGroupMockProps) => <div>{children}</div>,
		InputOTPSeparator: () => <span>-</span>,
		InputOTPSlot: () => <span></span>,
	};
});

const renderUI = () => {
	mockQueryClient.getQueryData.mockReturnValue({ email: "user@test.com" });
	return renderWithProviders(<VerifySignupOtpForm />);
};

describe("VerifySignupOtpForm template", () => {
	let user: UserEvent;

	beforeEach(() => {
		vi.clearAllMocks();
		user = userEvent.setup();
	});

	it("renders error message when user data is missing", () => {
		mockQueryClient.getQueryData.mockReturnValue(undefined);

		render(<VerifySignupOtpForm />);

		expect(screen.getByText(/user data not found\. please start the signup process again\./i)).toBeInTheDocument();
	});

	it("shows correct OtpForm UI", () => {
		renderUI();

		expect(screen.getByRole("heading", { name: /verify email/i, level: 1 })).toBeInTheDocument();

		expect(screen.getByText("user@test.com.")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Verify Email" })).toBeInTheDocument();
	});

	it("shows neither the verified banner nor an error before anything is submitted", () => {
		renderUI();

		expect(screen.queryByText(/otp verified/i)).not.toBeInTheDocument();
		expect(screen.queryByText(/incorrect otp/i)).not.toBeInTheDocument();
	});

	it("submits OTP → calls mutate → success → navigates", async () => {
		renderUI();

		const input = screen.getByTestId("input-otp");
		const button = screen.getByRole("button", { name: "Verify Email" });

		await user.type(input, "1234");
		await user.click(button);

		expect(mutateMock).toHaveBeenCalledTimes(1);

		expect(mutateMock.mock.calls[0]?.[0]).toEqual({
			identifier: "user@test.com",
			otp: "1234",
			purpose: OTP_PURPOSE.SIGNUP,
		});

		const { onSuccess } = mutateCallbacks();

		await waitFor(() => {
			onSuccess();
		});

		await waitFor(() => {
			expect(mockRouter.push).toHaveBeenCalledWith(routes.auth.setPassword);
		});

		expect(await screen.findByText(/otp verified/i)).toBeInTheDocument();
		expect(screen.queryByText(/incorrect otp/i)).not.toBeInTheDocument();
	});

	it("shows incorrect OTP message when mutation fails", async () => {
		renderUI();

		const input = screen.getByTestId("input-otp");
		const button = screen.getByRole("button", { name: "Verify Email" });

		await user.type(input, "1234");
		await user.click(button);

		const { onError } = mutateCallbacks();

		await waitFor(() => {
			onError();
		});

		// Real OtpForm renders this text
		expect(await screen.findByText(/incorrect otp/i)).toBeInTheDocument();
		expect(screen.queryByText(/otp verified/i)).not.toBeInTheDocument();
	});

	it("clears incorrect state when user edits OTP", async () => {
		renderUI();

		const input = screen.getByTestId("input-otp");
		const button = screen.getByRole("button", { name: "Verify Email" });

		// Step 1: cause failure
		await user.type(input, "1234");
		await user.click(button);

		const { onError } = mutateCallbacks();
		await waitFor(() => onError());

		expect(await screen.findByText(/incorrect otp/i)).toBeInTheDocument();

		// Step 2: type new digit → should clear incorrect message
		await user.clear(input);
		await user.type(input, "9");

		await waitFor(() => expect(screen.queryByText(/incorrect otp/i)).not.toBeInTheDocument());
		// Clearing the error must not be mistaken for a pass.
		expect(screen.queryByText(/otp verified/i)).not.toBeInTheDocument();
	});
});
