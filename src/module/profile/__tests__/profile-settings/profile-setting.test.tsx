import { apiClient } from "@/lib/api";
import ProfileSettings from "@/module/profile/templates/profile-settings";
import { mockGet, mockPost, mockPut } from "@/tests/utils/mock-api-client";
import { setupCookies } from "@/tests/utils/mock-cookies-next";
import { renderWithProviders } from "@/tests/utils/mock-providers";
import { COOKIES, ROLES } from "@/types";
import { screen, waitFor } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/components/ui/dropdown-menu", async (importOriginal) => {
	const original = await importOriginal();
	return original;
});

const mockUserData = {
	_id: "user-123",
	name: {
		first: "John",
		last: "Doe",
	},
	email: "john.doe@example.com",
	images: ["https://example.com/avatar.jpg"],
	companyRef: {
		_id: "test-company",
		supportEmail: "support@company.com",
	},
};

const renderComponent = () => {
	return renderWithProviders(<ProfileSettings />);
};

const getOpenDropdownMenuButton = () => screen.getByTestId("image-upload-button");
const getFileInputTrigger = () => screen.getByTestId("upload-file-button");

const uploadFile = async (user: UserEvent) => {
	await waitFor(() => {
		expect(getFileInputTrigger()).toBeInTheDocument();
	});

	await user.click(getFileInputTrigger());

	const file = new File(["content"], "test.jpg", { type: "image/jpeg" });
	const input = screen.getByTestId("file-input");

	await user.upload(input, file);
};

const waitForLoadingToFinish = async () => {
	await waitFor(() => {
		expect(screen.queryByTestId("loader2-icon")).not.toBeInTheDocument();
	});
};
const getFormElements = () => {
	return {
		firstNameInput: screen.getByLabelText(/first name/i),
		lastNameInput: screen.getByLabelText(/last name/i),
		emailInput: screen.getByLabelText("Email"),
	};
};

const getSaveChangesButton = () => {
	return screen.getByTestId("save-changes-button");
};

describe("ProfileSettings component", () => {
	let user: UserEvent;
	beforeEach(() => {
		user = userEvent.setup();
		vi.clearAllMocks();
		mockGet.mockResolvedValue({
			data: { data: mockUserData },
		});

		setupCookies({
			[COOKIES.USER_TYPE]: ROLES.ADMIN,
			[COOKIES.COMPANY_REF]: "test-company",
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("Initial Render", () => {
		it("should show loading spinner while fetching user data", () => {
			mockGet.mockImplementation(
				() => new Promise(() => {}) // Never resolves
			);

			renderComponent();

			expect(screen.getByTestId("loader2-icon")).toBeInTheDocument();
		});

		it("should render profile details form with user data", async () => {
			renderComponent();

			await waitFor(() => {
				expect(screen.getByDisplayValue("John")).toBeInTheDocument();
			});

			expect(screen.getByDisplayValue("Doe")).toBeInTheDocument();
			expect(screen.getByDisplayValue("john.doe@example.com")).toBeInTheDocument();
		});

		it("should display profile card title", async () => {
			renderComponent();
			await waitFor(() => {
				expect(screen.getByText("Profile Settings")).toBeInTheDocument();
			});
		});

		it("should render image upload button", async () => {
			renderComponent();

			await waitFor(() => {
				expect(getOpenDropdownMenuButton()).toBeInTheDocument();
			});
		});

		it("should show all form fields from config", async () => {
			renderComponent();

			await waitFor(() => {
				expect(screen.getByDisplayValue("John")).toBeInTheDocument();
			});

			expect(screen.getByDisplayValue("Doe")).toBeInTheDocument();
			expect(screen.getByDisplayValue("john.doe@example.com")).toBeInTheDocument();
		});
	});

	describe("Image Upload", () => {
		it("should show success message when image is selected", async () => {
			renderComponent();

			await waitForLoadingToFinish();

			const openMenuButton = getOpenDropdownMenuButton();
			await user.click(openMenuButton);

			await uploadFile(user);

			expect(screen.getByText(/Image selected!/)).toBeInTheDocument();

			// should display delete option in dropdown if image is selected
			await user.click(openMenuButton);

			const deleteButton = screen.getByTestId("delete-file-button");

			expect(deleteButton).toBeInTheDocument();

			await user.click(deleteButton);
			// after deletion, success message should be gone
			expect(screen.queryByText(/Image selected!/)).not.toBeInTheDocument();
		});

		it("should clear success message when image is removed", async () => {
			renderComponent();

			await waitForLoadingToFinish();

			const openMenuButton = getOpenDropdownMenuButton();
			await user.click(openMenuButton);

			await uploadFile(user);

			// should display delete option in dropdown if image is selected and the menu is opened
			await user.click(openMenuButton);

			const deleteButton = screen.getByTestId("delete-file-button");

			await user.click(deleteButton);
			// after deletion, success message should be gone
			expect(screen.queryByText(/Image selected!/)).not.toBeInTheDocument();
		});
	});

	describe("Form Submission", () => {
		it("should validate required fields", async () => {
			renderComponent();

			await waitForLoadingToFinish();

			const { firstNameInput } = getFormElements();
			await user.clear(firstNameInput);

			await user.click(getSaveChangesButton());

			// Form should not submit with empty required field
			await waitFor(() => {
				expect(apiClient.put).not.toHaveBeenCalled();
			});
		});

		it("should successfully submit profile update", async () => {
			mockPut.mockResolvedValue({
				data: { success: true },
			});

			renderComponent();

			await waitForLoadingToFinish();

			const { firstNameInput } = getFormElements();
			await user.clear(firstNameInput);

			await user.type(firstNameInput, "Jane");

			await user.click(screen.getByText("Save Changes"));

			await waitFor(() => {
				expect(screen.getByText("Saved Successfully")).toBeInTheDocument();
			});

			expect(mockPut).toHaveBeenCalledWith("/user/profile", {
				name: {
					first: "Jane",
					last: "Doe",
				},
			});
		});

		it("should upload image to S3 before profile update", async () => {
			const user = userEvent.setup();
			const mockPresignedUrl = "https://s3.amazonaws.com/presigned-url";
			const mockKeyFile = "images/test-123.jpg";

			mockPost.mockResolvedValue({
				data: {
					data: {
						url: mockPresignedUrl,
						keyFile: mockKeyFile,
					},
				},
			});

			mockPut.mockResolvedValue({
				data: { success: true },
			});

			global.fetch = vi.fn().mockResolvedValue({ ok: true });

			renderComponent();
			await waitForLoadingToFinish();
			const openMenuButton = getOpenDropdownMenuButton();
			await user.click(openMenuButton);

			await uploadFile(user);

			await user.click(getSaveChangesButton());

			await waitFor(() => {
				expect(mockPost).toHaveBeenCalledWith("/aws/presigned-url", {
					fileName: "test.jpg",
					fileType: "image/jpeg",
				});
			});

			expect(global.fetch).toHaveBeenCalledWith(mockPresignedUrl, {
				method: "PUT",
				headers: { "Content-Type": "image/jpeg" },
				body: expect.any(File),
			});

			expect(mockPut).toHaveBeenCalledWith("/user/profile", {
				name: {
					first: "John",
					last: "Doe",
				},
				images: `https://boilerplate-s3-bucket.s3.us-east-2.amazonaws.com/${mockKeyFile}`,
			});
		});

		it("should show error message on submission failure", async () => {
			const errorMessage = "Failed to update profile";

			mockPut.mockRejectedValue({
				response: {
					data: { message: errorMessage },
				},
			});

			renderComponent();

			await waitForLoadingToFinish();

			await user.click(getSaveChangesButton());

			await waitFor(() => {
				expect(screen.getByText(errorMessage)).toBeInTheDocument();
			});
		});

		it("should show generic error message when no specific error provided", async () => {
			mockPut.mockRejectedValue(new Error("Network error"));

			renderComponent();
			await waitForLoadingToFinish();

			await user.click(getSaveChangesButton());

			await waitFor(() => {
				expect(screen.getByText("Network error")).toBeInTheDocument();
			});
		});

		it("should disable submit button while submitting", async () => {
			mockPut.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

			renderComponent();

			await waitForLoadingToFinish();

			const submitButton = getSaveChangesButton();
			await user.click(submitButton);

			await waitFor(() => {
				expect(screen.getByText("Saving...")).toBeInTheDocument();
				expect(submitButton).toBeDisabled();
			});
		});

		it("should clear success message after 3 seconds", async () => {
			vi.useFakeTimers({ shouldAdvanceTime: true });

			mockPut.mockResolvedValue({
				data: { success: true },
			});

			renderComponent();

			await waitForLoadingToFinish();

			await user.click(getSaveChangesButton());

			await waitFor(() => {
				expect(screen.getByText("Saved Successfully")).toBeInTheDocument();
			});

			vi.advanceTimersByTime(3000);

			await waitFor(() => {
				expect(screen.queryByText("Saved Successfully")).not.toBeInTheDocument();
			});

			vi.useRealTimers();
		});
	});

	describe("Edge Cases", () => {
		it("should handle missing user data gracefully", async () => {
			mockGet.mockResolvedValue({
				data: { data: null },
			});

			renderComponent();

			await waitForLoadingToFinish();

			await waitFor(() => {
				expect(screen.getByText("Profile Settings")).toBeInTheDocument();
			});

			// Should render empty form
			const inputs = screen.getAllByRole("textbox");
			inputs.forEach((input) => {
				expect(input).toHaveValue("");
			});
		});

		it("should handle user without company reference", async () => {
			const userWithoutCompany = {
				...mockUserData,
				companyRef: null,
			};

			mockGet.mockResolvedValue({
				data: { data: userWithoutCompany },
			});

			renderComponent();

			await waitForLoadingToFinish();

			await waitFor(() => {
				expect(screen.getByDisplayValue("John")).toBeInTheDocument();
			});

			expect(screen.queryByDisplayValue("support@company.com")).not.toBeInTheDocument();
		});

		it("should handle empty images array", async () => {
			const userWithoutImages = {
				...mockUserData,
				images: [],
			};

			mockGet.mockResolvedValue({
				data: { data: userWithoutImages },
			});

			renderComponent();

			await waitForLoadingToFinish();
			await waitFor(() => {
				expect(screen.getByDisplayValue("John")).toBeInTheDocument();
			});

			expect(screen.getByTestId("image-upload-button")).toBeInTheDocument();
		});

		it("should handle network errors on initial load", async () => {
			mockGet.mockRejectedValue(new Error("Network error"));

			renderComponent();

			await waitForLoadingToFinish();

			await waitFor(() => {
				expect(screen.getByText("Network error")).toBeInTheDocument();
			});
		});

		it("should prevent submission without user or company data", async () => {
			vi.mocked(apiClient.get).mockResolvedValue({
				data: { data: { ...mockUserData, companyRef: null } },
			});

			renderComponent();

			await waitForLoadingToFinish();

			await waitFor(() => {
				expect(screen.getByDisplayValue("John")).toBeInTheDocument();
			});

			await user.click(screen.getByText("Save Changes"));

			// Should not call API
			expect(apiClient.put).not.toHaveBeenCalled();
		});
	});
});
