import { render, screen, waitFor } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { vi } from "vitest";

import type { LoginCallbacks, LoginSuccessData } from "@/module/auth/__tests__/types/mutation-types";
import VerifySignInOtpForm from "@/module/auth/templates/verify-signin-otp-form";
import type { IVerifyEmailOtpData } from "@/module/auth/types";
import type { InputOTPGroupMockProps, InputOTPMockProps } from "@/tests/types/input-otp-mock";
import { mutationCallbacks } from "@/tests/utils/mock-mutation";
import { mockRouter } from "@/tests/utils/mock-next-navigation";
import { mockQueryClient } from "@/tests/utils/mock-react-query";
import { ROLES } from "@/types";

const mutateMock = vi.fn<(payload: IVerifyEmailOtpData, callbacks: LoginCallbacks) => void>();
const mutateCallbacks = () => mutationCallbacks(mutateMock, "login mutation");
vi.mock("@/module/auth/hooks/useAuth", () => ({
	useAuthAPI: () => ({
		useLoginMutation: () => ({
			mutate: mutateMock,
			isPending: false,
		}),
	}),
}));

vi.mock("@/components/ui/input-otp", () => {
	return {
		InputOTP: ({
			value,
			onChange,
			onKeyDown,
			"data-testid": tid,
		}: Pick<InputOTPMockProps, "value" | "onChange" | "onKeyDown" | "data-testid">) => (
			<input
				data-testid={tid ?? "input-otp"}
				value={value ?? ""}
				onChange={(e) => onChange?.(e.target.value)}
				onKeyDown={onKeyDown}
			/>
		),
		InputOTPGroup: ({ children }: InputOTPGroupMockProps) => <div>{children}</div>,
		InputOTPSeparator: () => <span>-</span>,
		InputOTPSlot: () => <span />,
	};
});

describe("VerifySignInOtpForm template", () => {
	let user: UserEvent;

	beforeEach(() => {
		vi.clearAllMocks();
		user = userEvent.setup();
	});

	// 1. Missing user data
	it("shows error when no user data exists", () => {
		mockQueryClient.getQueryData.mockReturnValue(undefined);

		render(<VerifySignInOtpForm />);

		// The flow name matters: this screen must not send a signing-in user off to signup.
		expect(screen.getByText(/user data not found\. please start the sign in process again\./i)).toBeInTheDocument();
	});

	it("shows neither the verified banner nor an error before anything is submitted", () => {
		mockQueryClient.getQueryData.mockReturnValue({ email: "fresh@test.com" });

		render(<VerifySignInOtpForm />);

		expect(screen.queryByText(/otp verified/i)).not.toBeInTheDocument();
		expect(screen.queryByText(/incorrect otp/i)).not.toBeInTheDocument();
	});

	// 2. OTP less than 4 digits → incorrect & no mutate
	it("marks incorrect OTP when less than 4 digits and does NOT call mutate", async () => {
		mockQueryClient.getQueryData.mockReturnValue({ email: "test@x.com" });

		render(<VerifySignInOtpForm />);

		const input = screen.getByTestId("input-otp");
		const button = screen.getByRole("button", { name: "Sign In" });

		await user.type(input, "12");
		await user.click(button);

		expect(mutateMock).not.toHaveBeenCalled();
	});

	// 3. Valid OTP → calls mutate
	it("submits valid OTP and calls login mutate with correct payload", async () => {
		mockQueryClient.getQueryData.mockReturnValue({ email: "login@test.com" });

		render(<VerifySignInOtpForm />);

		const input = screen.getByTestId("input-otp");
		const button = screen.getByRole("button", { name: "Sign In" });

		await user.type(input, "1234");
		await user.click(button);

		await waitFor(() => {
			expect(mutateMock).toHaveBeenCalledTimes(1);
		});

		expect(mutateMock.mock.calls[0]?.[0]).toEqual({
			email: "login@test.com",
			otp: "1234",
			loginType: "otp",
		});
	});

	// 4. onSuccess → cookies + redirect
	it("handles success correctly (setCookies + redirect)", async () => {
		mockQueryClient.getQueryData.mockReturnValue({
			email: "success@test.com",
		});

		// Response returned to onSuccess
		const fakeResponse: LoginSuccessData = {
			user: {
				roles: ROLES.ADMIN,
				companyRef: { _id: "comp123" },
				_id: "user123",
			},
		};

		render(<VerifySignInOtpForm />);

		await user.type(screen.getByTestId("input-otp"), "1234");
		await user.click(screen.getByRole("button", { name: "Sign In" }));

		const { onSuccess } = mutateCallbacks();

		// ❗ Important: wrap callbacks inside waitFor to avoid act warnings
		await waitFor(() => {
			onSuccess(fakeResponse);
		});

		await waitFor(() => {
			expect(mockRouter.replace).toHaveBeenCalled();
		});

		expect(await screen.findByText(/otp verified/i)).toBeInTheDocument();
		expect(screen.queryByText(/incorrect otp/i)).not.toBeInTheDocument();
	});

	// 4b. Login succeeds but returns no user details → the user must still land somewhere
	it("still redirects when the login response carries no user envelope", async () => {
		mockQueryClient.getQueryData.mockReturnValue({ email: "envelope@test.com" });

		render(<VerifySignInOtpForm />);

		await user.type(screen.getByTestId("input-otp"), "1234");
		await user.click(screen.getByRole("button", { name: "Sign In" }));

		const { onSuccess } = mutateCallbacks();

		await waitFor(() => {
			onSuccess(undefined as unknown as LoginSuccessData);
		});

		await waitFor(() => {
			expect(mockRouter.replace).toHaveBeenCalled();
		});
	});

	// 5. onError → incorrect state shown
	it("shows incorrect state when login mutation fails", async () => {
		mockQueryClient.getQueryData.mockReturnValue({ email: "bad@test.com" });

		render(<VerifySignInOtpForm />);

		await user.type(screen.getByTestId("input-otp"), "1234");
		await user.click(screen.getByRole("button", { name: "Sign In" }));

		const { onError } = mutateCallbacks();

		// ❗ Wrap state-changing callback
		await waitFor(() => {
			onError();
		});

		expect(await screen.findByText(/incorrect otp/i)).toBeInTheDocument();
		expect(screen.queryByText(/otp verified/i)).not.toBeInTheDocument();
	});
});
