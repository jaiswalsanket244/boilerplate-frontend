import { screen, waitFor } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import type { AxiosError } from "axios";
import { vi } from "vitest";

import { renderWithProviders } from "@/tests/utils/mock-providers";

import { apiClient } from "@/lib/api";
import { ERROR_CODES } from "@/lib/constants/error-codes";
import { mockUserData } from "@/module/profile/__tests__/utils";
import ChangePassword from "@/module/profile/templates/change-password";

const mockChangePasswordMutate = vi.fn();
let isPending = false;

vi.mock("@/module/profile/hooks/useProfile", async (importOriginal) => {
	const actual = await importOriginal<typeof import("@/module/profile/hooks/useProfile")>();
	return {
		...actual,
		useProfileAPI: () => ({
			...actual.useProfileAPI(),
			useChangePassword: {
				mutate: mockChangePasswordMutate,
				isLoading: isPending,
				get isPending() {
					return isPending;
				},
			},
		}),
	};
});

const renderComponent = () => renderWithProviders(<ChangePassword />);

const fillForm = async (user: ReturnType<typeof userEvent.setup>) => {
	await user.type(screen.getByLabelText("Current Password"), "OldPass1!");

	await user.type(screen.getByLabelText("Password"), "NewPass1!");
	await user.type(screen.getByLabelText("Confirm Password"), "NewPass1!");
};

const getSubmitButton = () => screen.getByRole("button", { name: /change password/i });
const getFormElements = () => ({
	currentPasswordInput: screen.getByLabelText("Current Password") as HTMLInputElement,
	passwordInput: screen.getByLabelText("Password") as HTMLInputElement,
	confirmPasswordInput: screen.getByLabelText("Confirm Password") as HTMLInputElement,
});

describe("ChangePassword Component", () => {
	let user: UserEvent;
	beforeEach(() => {
		user = userEvent.setup();

		vi.clearAllMocks();
		isPending = false;
		vi.mocked(apiClient.get).mockResolvedValue({
			data: { data: mockUserData },
		});
	});

	describe("Rendering", () => {
		it("should render all form fields correctly", () => {
			renderComponent();
			expect(screen.getByRole("heading", { name: /change password/i })).toBeInTheDocument();
			expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
			expect(screen.getByLabelText("Password")).toBeInTheDocument();
			expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
		});

		it("should render action buttons", () => {
			renderComponent();

			expect(screen.getByRole("button", { name: /^change password$/i })).toBeInTheDocument();
		});

		it("should render without error or success messages initially", () => {
			renderComponent();

			expect(screen.queryByText(/password changed successfully/i)).not.toBeInTheDocument();
			expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
		});
	});

	describe("Form Validation", () => {
		it("should handle form submission with valid data", async () => {
			renderComponent();

			await fillForm(user);

			const submitButton = screen.getByRole("button", { name: /^change password$/i });
			await user.click(submitButton);

			await waitFor(() => {
				expect(mockChangePasswordMutate).toHaveBeenCalledWith(
					expect.objectContaining({
						currentPassword: "OldPass1!",
						newPassword: "NewPass1!",
						confirmedPassword: "NewPass1!",
					}),
					expect.anything()
				);
			});
		});

		it("should not submit form with empty fields", async () => {
			renderComponent();
			const submitButton = screen.getByRole("button", { name: /^change password$/i });
			await user.click(submitButton);

			expect(apiClient.post).not.toHaveBeenCalled();
		});
	});

	describe("Success Handling", () => {
		it("should display success message on successful password change", async () => {
			mockChangePasswordMutate.mockImplementation((data, { onSuccess }) => {
				onSuccess();
			});
			renderComponent();

			await fillForm(user);

			await user.click(getSubmitButton());

			await waitFor(() => {
				expect(screen.getByText(/password changed successfully!/i)).toBeInTheDocument();
			});
		});

		it("should reset form fields after successful submission", async () => {
			mockChangePasswordMutate.mockImplementation((_data, { onSuccess }) => {
				onSuccess();
			});

			renderComponent();

			const { currentPasswordInput, passwordInput, confirmPasswordInput } = getFormElements();

			await fillForm(user);

			await user.click(getSubmitButton());

			await waitFor(() => {
				expect(currentPasswordInput.value).toBe("");
				expect(passwordInput.value).toBe("");
				expect(confirmPasswordInput.value).toBe("");
			});
		});
	});

	describe("Error Handling", () => {
		it("should display error message for invalid current password", async () => {
			const mockError: AxiosError = {
				response: {
					data: {
						messageCode: ERROR_CODES.INVALID_PASSWORD,
						message: "Invalid password",
					},
					status: 400,
				},
			} as AxiosError;

			mockChangePasswordMutate.mockImplementation((data, { onError }) => {
				onError(mockError);
			});

			renderComponent();

			await fillForm(user);

			await user.click(getSubmitButton());

			await waitFor(() => {
				expect(screen.getByText(/password mismatch/i)).toBeInTheDocument();
			});
		});

		it("should display generic error message for other errors", async () => {
			const mockError: AxiosError = {
				response: {
					data: {
						messageCode: "GENERIC_ERROR",
						message: "Server error occurred",
					},
					status: 500,
					statusText: "Internal Server Error",
				},
			} as AxiosError;

			mockChangePasswordMutate.mockImplementation((data, { onError }) => {
				onError(mockError);
			});

			renderComponent();

			await fillForm(user);

			const submitButton = screen.getByRole("button", { name: /^change password$/i });
			await user.click(submitButton);

			await waitFor(() => {
				expect(screen.getByText(/server error occurred/i)).toBeInTheDocument();
			});
		});

		it("should display fallback error message when no message in response", async () => {
			const user = userEvent.setup();
			const mockError: AxiosError = {
				response: {
					data: {},
					status: 500,
					statusText: "Internal Server Error",
				},
			} as AxiosError;

			mockChangePasswordMutate.mockImplementation((_data, { onError }) => {
				onError(mockError);
			});

			renderComponent();

			await fillForm(user);

			await user.click(getSubmitButton());

			await waitFor(() => {
				expect(screen.getByText(/something went wrong! please try again/i)).toBeInTheDocument();
			});
		});
	});

	describe("Loading State", () => {
		it("should disable submit button when mutation is pending", () => {
			isPending = true;
			renderComponent();

			const submitButton = screen.getByRole("button", { name: /changing password/i });
			expect(submitButton).toBeDisabled();
		});

		it("should show loading text when submitting", () => {
			isPending = true;

			renderComponent();

			expect(screen.getByText(/changing password\.\.\./i)).toBeInTheDocument();
		});
	});

	describe("User Data Handling", () => {
		it("should use empty email when user data is not available", async () => {
			vi.mocked(apiClient.get).mockResolvedValue({
				data: { data: null },
			});

			renderComponent();

			await fillForm(user);

			await user.click(getSubmitButton());

			await waitFor(() => {
				expect(mockChangePasswordMutate).toHaveBeenCalledWith(
					expect.objectContaining({
						email: "",
					}),
					expect.any(Object)
				);
			});
		});
	});
});
