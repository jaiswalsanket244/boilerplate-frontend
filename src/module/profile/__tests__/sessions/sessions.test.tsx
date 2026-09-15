import { screen, waitFor, within } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Sessions from "@/module/profile/templates/sessions";
import { mockDelete, mockGet, mockPost } from "@/tests/utils/mock-api-client";
import { renderWithProviders } from "@/tests/utils/mock-providers";

// Use the real useQueryClient so mutation invalidation actually refetches and rows update.
vi.mock("@tanstack/react-query", async () => {
	const actual = await vi.importActual("@tanstack/react-query");
	return actual;
});

const currentSession = {
	id: "session-current",
	device: "Desktop",
	browser: "Chrome",
	os: "macOS",
	ipDisplay: "1.2.3.4",
	lastActiveAt: "2026-09-14T10:00:00.000Z",
	createdAt: "2026-09-01T10:00:00.000Z",
	isCurrent: true,
};

const otherSession = {
	id: "session-other",
	device: "Mobile",
	browser: "Safari",
	os: "iOS",
	ipDisplay: "5.6.7.8",
	lastActiveAt: "2026-09-10T10:00:00.000Z",
	createdAt: "2026-09-02T10:00:00.000Z",
	isCurrent: false,
};

const sessionsResponse = (sessions: unknown[]) => ({ data: { data: { sessions } } });

const renderComponent = () => renderWithProviders(<Sessions />);

describe("Sessions template", () => {
	let user: UserEvent;

	beforeEach(() => {
		user = userEvent.setup();
		vi.clearAllMocks();
		mockGet.mockResolvedValue(sessionsResponse([currentSession, otherSession]));
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("shows a loading state while fetching", () => {
		mockGet.mockImplementation(() => new Promise(() => {}));
		renderComponent();
		expect(screen.getByTestId("sessions-loading")).toBeInTheDocument();
	});

	it("lists sessions, badges the current device, and disables its sign-out button", async () => {
		renderComponent();

		await waitFor(() => expect(screen.getByText("Chrome · macOS · Desktop")).toBeInTheDocument());

		expect(screen.getByText("This device")).toBeInTheDocument();
		expect(mockGet).toHaveBeenCalledWith("/auth/sessions");

		expect(screen.getByRole("button", { name: "Sign out Chrome · macOS · Desktop" })).toBeDisabled();
		expect(screen.getByRole("button", { name: "Sign out Safari · iOS · Mobile" })).toBeEnabled();
	});

	it("signs out a single other session and removes its row", async () => {
		mockGet
			.mockResolvedValueOnce(sessionsResponse([currentSession, otherSession]))
			.mockResolvedValueOnce(sessionsResponse([currentSession]));
		mockDelete.mockResolvedValue({ data: { data: { success: true } } });

		renderComponent();

		await waitFor(() => expect(screen.getByText("Safari · iOS · Mobile")).toBeInTheDocument());

		await user.click(screen.getByRole("button", { name: "Sign out Safari · iOS · Mobile" }));

		await waitFor(() => expect(mockDelete).toHaveBeenCalledWith("/auth/sessions/session-other"));
		await waitFor(() => expect(screen.queryByText("Safari · iOS · Mobile")).not.toBeInTheDocument());
	});

	it("signs out all other sessions through the confirmation dialog", async () => {
		mockGet
			.mockResolvedValueOnce(sessionsResponse([currentSession, otherSession]))
			.mockResolvedValueOnce(sessionsResponse([currentSession]));
		mockPost.mockResolvedValue({ data: { data: { revokedCount: 1 } } });

		renderComponent();

		await waitFor(() => expect(screen.getByText("Safari · iOS · Mobile")).toBeInTheDocument());

		const dialog = screen.getByTestId("alert-content");
		await user.click(within(dialog).getByRole("button", { name: "Sign out other sessions" }));

		await waitFor(() => expect(mockPost).toHaveBeenCalledWith("/auth/sessions/revoke-others"));
		await waitFor(() => expect(screen.queryByText("Safari · iOS · Mobile")).not.toBeInTheDocument());
	});

	it("shows the empty state when only the current device is signed in", async () => {
		mockGet.mockResolvedValue(sessionsResponse([currentSession]));

		renderComponent();

		await waitFor(() => expect(screen.getByText("Only this device is signed in.")).toBeInTheDocument());
	});

	it("hides sessions with a missing id", async () => {
		mockGet.mockResolvedValue(sessionsResponse([currentSession, { ...otherSession, id: "" }]));

		renderComponent();

		await waitFor(() => expect(screen.getByText("Only this device is signed in.")).toBeInTheDocument());
		expect(screen.queryByText("Safari · iOS · Mobile")).not.toBeInTheDocument();
	});

	it("shows an inline error when fetching sessions fails", async () => {
		mockGet.mockRejectedValue({ response: { data: { message: "Failed to load sessions" } } });

		renderComponent();

		await waitFor(() => expect(screen.getByText("Failed to load sessions")).toBeInTheDocument());
	});

	it("shows an inline error when a sign-out fails", async () => {
		mockDelete.mockRejectedValue({ response: { data: { message: "Could not sign out session" } } });

		renderComponent();

		await waitFor(() => expect(screen.getByText("Safari · iOS · Mobile")).toBeInTheDocument());

		await user.click(screen.getByRole("button", { name: "Sign out Safari · iOS · Mobile" }));

		await waitFor(() => expect(screen.getByText("Could not sign out session")).toBeInTheDocument());
	});
});
