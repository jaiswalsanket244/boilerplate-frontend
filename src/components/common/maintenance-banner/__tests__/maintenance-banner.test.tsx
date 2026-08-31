import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { MaintenanceBanner } from "@/components/common/maintenance-banner/maintenance-banner";
import { mockGet } from "@/tests/utils/mock-api-client";
import { renderWithProviders } from "@/tests/utils/mock-providers";

const makeResponse = (maintenanceMode: boolean, maintenanceMessage = "") => ({
	data: {
		success: true,
		message: "Maintenance status",
		data: { maintenanceMode, maintenanceMessage },
		errors: {},
	},
});

describe("MaintenanceBanner", () => {
	beforeEach(() => {
		window.sessionStorage.clear();
		mockGet.mockReset();
	});

	it("renders the maintenance message when maintenanceMode is on", async () => {
		mockGet.mockResolvedValue(makeResponse(true, "Scheduled maintenance in progress"));

		renderWithProviders(<MaintenanceBanner />);

		expect(await screen.findByText("Scheduled maintenance in progress")).toBeInTheDocument();
		expect(mockGet).toHaveBeenCalledWith("/maintenance");
	});

	it("falls back to a default message when maintenanceMessage is empty", async () => {
		mockGet.mockResolvedValue(makeResponse(true, ""));

		renderWithProviders(<MaintenanceBanner />);

		expect(await screen.findByRole("alert")).toBeInTheDocument();
		expect(screen.getByText(/scheduled maintenance/i)).toBeInTheDocument();
	});

	it("renders nothing when maintenanceMode is off", async () => {
		mockGet.mockResolvedValue(makeResponse(false));

		renderWithProviders(<MaintenanceBanner />);

		await waitFor(() => expect(mockGet).toHaveBeenCalledWith("/maintenance"));
		expect(screen.queryByRole("alert")).not.toBeInTheDocument();
	});

	it("renders nothing when the maintenance request errors", async () => {
		mockGet.mockRejectedValue(new Error("network error"));

		renderWithProviders(<MaintenanceBanner />);

		await waitFor(() => expect(mockGet).toHaveBeenCalled());
		expect(screen.queryByRole("alert")).not.toBeInTheDocument();
	});

	it("stays hidden after dismiss and persists the choice to sessionStorage", async () => {
		mockGet.mockResolvedValue(makeResponse(true, "Down for maintenance"));
		const user = userEvent.setup();

		renderWithProviders(<MaintenanceBanner />);

		expect(await screen.findByRole("alert")).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: /dismiss maintenance banner/i }));

		expect(screen.queryByRole("alert")).not.toBeInTheDocument();
		expect(window.sessionStorage.getItem("maintenance-banner-dismissed")).toBe("true");
	});

	it("does not render when already dismissed earlier in the session", async () => {
		window.sessionStorage.setItem("maintenance-banner-dismissed", "true");
		mockGet.mockResolvedValue(makeResponse(true, "Down for maintenance"));

		renderWithProviders(<MaintenanceBanner />);

		await waitFor(() => expect(mockGet).toHaveBeenCalled());
		expect(screen.queryByRole("alert")).not.toBeInTheDocument();
	});
});
