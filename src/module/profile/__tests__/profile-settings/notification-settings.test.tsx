import { screen, waitFor } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import NotificationSettings from "@/module/profile/templates/notification-settings";
import { mockGet, mockPut } from "@/tests/utils/mock-api-client";
import { renderWithProviders } from "@/tests/utils/mock-providers";

const buildPreferences = (overrides: Record<string, unknown> = {}) => ({
	_id: "pref-1",
	userRef: "user-123",
	preferences: {
		// notificationSettings renders profile_and_password first, chat_message second.
		profile_and_password: { email: false, push: true, inApp: false, digestFrequency: "daily" },
		chat_message: { email: false, push: true, inApp: false, digestFrequency: "off" },
		...overrides,
	},
});

const renderComponent = () => renderWithProviders(<NotificationSettings />);

const waitForLoadingToFinish = async () => {
	await waitFor(() => {
		expect(screen.queryByTestId("loader2-icon")).not.toBeInTheDocument();
	});
};

// The design-system Select is globally mocked as a native <select> (role "combobox").
// notificationSettings renders profile_and_password first, chat_message second.
const getProfileSelect = () => screen.getAllByRole("combobox")[0] as HTMLSelectElement;
const getChatSelect = () => screen.getAllByRole("combobox")[1] as HTMLSelectElement;

describe("NotificationSettings — digest frequency", () => {
	let user: UserEvent;

	beforeEach(() => {
		user = userEvent.setup();
		vi.clearAllMocks();
		mockGet.mockResolvedValue({ data: { data: buildPreferences() } });
		mockPut.mockResolvedValue({ data: { data: buildPreferences() } });
	});

	it("renders each category's current digest frequency from the API", async () => {
		renderComponent();
		await waitForLoadingToFinish();

		await waitFor(() => {
			expect(getProfileSelect().value).toBe("daily");
			expect(getChatSelect().value).toBe("off");
		});
	});

	it("defaults a missing digestFrequency to off", async () => {
		mockGet.mockResolvedValue({
			data: {
				data: buildPreferences({
					chat_message: { email: false, push: true, inApp: false },
				}),
			},
		});

		renderComponent();
		await waitForLoadingToFinish();

		await waitFor(() => {
			expect(getChatSelect().value).toBe("off");
		});
	});

	it("issues PUT with {type, digestFrequency} when the frequency changes", async () => {
		renderComponent();
		await waitForLoadingToFinish();

		await user.selectOptions(getChatSelect(), "weekly");

		await waitFor(() => {
			expect(mockPut).toHaveBeenCalledWith("/notification/preferences", {
				type: "chat_message",
				digestFrequency: "weekly",
			});
		});

		await waitFor(() => {
			expect(getChatSelect().value).toBe("weekly");
		});
	});

	it("rolls back the selection when the update fails", async () => {
		mockPut.mockRejectedValue(new Error("Network error"));

		renderComponent();
		await waitForLoadingToFinish();

		await user.selectOptions(getChatSelect(), "weekly");

		await waitFor(() => {
			expect(mockPut).toHaveBeenCalled();
		});

		await waitFor(() => {
			expect(getChatSelect().value).toBe("off");
		});
	});

	it("keeps the push toggle working with a channel-only PUT", async () => {
		renderComponent();
		await waitForLoadingToFinish();

		const profileToggle = screen.getAllByRole("switch")[0] as HTMLElement;
		await user.click(profileToggle);

		await waitFor(() => {
			expect(mockPut).toHaveBeenCalledWith("/notification/preferences", {
				type: "profile_and_password",
				channels: { push: false },
			});
		});
	});
});
