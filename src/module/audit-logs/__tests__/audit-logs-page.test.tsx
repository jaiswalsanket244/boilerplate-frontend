import { renderWithProviders } from "@/tests/utils/mock-providers";
import { mockGet } from "@/tests/utils/mock-api-client";
import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { AuditLogsPage } from "@/module/audit-logs/templates/audit-logs-page";
import { AuditCategory, AuditStatus } from "@/module/audit-logs/types";

let mockRole = "super-admin";

vi.mock("@/module/profile/hooks/useProfile", () => ({
	useProfileAPI: () => ({
		useGetUserData: () => ({
			data: { roles: mockRole, permissions: [] },
			isLoading: false,
			isError: false,
		}),
	}),
}));

const mockAuditLogs = [
	{
		_id: "log-1",
		companyRef: "company-abc",
		targetType: "user",
		targetId: "user-123",
		timestamp: "2026-05-20T10:00:00.000Z",
		actorId: "actor-1",
		actorEmail: "admin@test.com",
		actorRole: "admin",
		category: AuditCategory.ADMIN_ACTION,
		action: "user.role.update",
		status: AuditStatus.SUCCESS,
		_sig: "abc123",
		_prevSig: "ROOT",
		subsystemMappingVersion: 1,
		requestId: "req-1",
		actor: { name: "Admin User" },
		target: { label: "John Doe" },
		context: { ip: "127.0.0.1", userAgent: "Mozilla", path: "/api/users", method: "PUT" },
	},
	{
		_id: "log-2",
		companyRef: "company-abc",
		targetType: "role",
		targetId: "role-456",
		timestamp: "2026-05-20T09:00:00.000Z",
		actorId: "actor-2",
		actorEmail: "super@test.com",
		actorRole: "super-admin",
		category: AuditCategory.RBAC,
		action: "role.permission.update",
		status: AuditStatus.SUCCESS,
		_sig: "def456",
		_prevSig: "abc123",
		subsystemMappingVersion: 1,
		requestId: "req-2",
		actor: { name: "Super Admin" },
		target: { label: "Editor Role" },
		context: { ip: "10.0.0.1", userAgent: "Chrome", path: "/api/roles", method: "PATCH" },
	},
	{
		_id: "log-3",
		companyRef: "company-abc",
		targetType: null,
		targetId: null,
		timestamp: "2026-05-20T08:00:00.000Z",
		actorId: "actor-3",
		actorEmail: "user@test.com",
		actorRole: "user",
		category: AuditCategory.AUTHENTICATION,
		action: "user.login.success",
		status: AuditStatus.SUCCESS,
		_sig: "ghi789",
		_prevSig: "def456",
		subsystemMappingVersion: 1,
		requestId: "req-3",
		actor: { name: "Regular User" },
		target: { label: null },
		context: { ip: "192.168.1.1", userAgent: "Safari", path: "/api/auth/login", method: "POST" },
	},
	{
		_id: "log-4",
		companyRef: "company-abc",
		targetType: "company",
		targetId: "company-abc",
		timestamp: "2026-05-20T07:00:00.000Z",
		actorId: "actor-1",
		actorEmail: null,
		actorRole: "admin",
		category: AuditCategory.SYSTEM,
		action: "company.status.update",
		status: AuditStatus.FAILURE,
		_sig: "jkl012",
		_prevSig: "ghi789",
		subsystemMappingVersion: 1,
		requestId: null,
		actor: { name: null },
		target: { label: "Test Company" },
		context: { ip: null, userAgent: null, path: null, method: null },
		failureReason: "Insufficient permissions",
	},
	{
		_id: "log-5",
		companyRef: "SYSTEM:cron",
		targetType: null,
		targetId: null,
		timestamp: "2026-05-20T06:00:00.000Z",
		actorId: "actor-system",
		actorEmail: null,
		actorRole: "admin",
		category: AuditCategory.TENANT,
		action: "tenant.cleanup",
		status: AuditStatus.SUCCESS,
		_sig: "mno345",
		_prevSig: "jkl012",
		subsystemMappingVersion: 1,
		requestId: null,
		actor: { name: null },
		target: { label: null },
		context: { ip: null, userAgent: null, path: null, method: null },
	},
];

const mockPaginatedResponse = {
	data: {
		success: true,
		message: "Audit logs fetched",
		data: {
			data: mockAuditLogs,
			pagination: {
				currentPage: 1,
				pageSize: 10,
				totalCount: 5,
				totalPages: 1,
				hasNextPage: false,
				hasPreviousPage: false,
				nextPage: null,
				previousPage: null,
			},
		},
	},
};

describe("AuditLogsPage", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockRole = "super-admin";
	});

	it("shows the Archived Logs link for super-admin", async () => {
		mockGet.mockResolvedValue(mockPaginatedResponse);

		renderWithProviders(<AuditLogsPage />);

		const link = await screen.findByRole("link", { name: /archived logs/i });
		expect(link).toHaveAttribute("href", "/super-admin/audit-logs/archive");
	});

	it("does not show the Archived Logs link for admin", async () => {
		mockRole = "admin";
		mockGet.mockResolvedValue(mockPaginatedResponse);

		renderWithProviders(<AuditLogsPage />);

		await waitFor(() => expect(mockGet).toHaveBeenCalled());
		expect(screen.queryByRole("link", { name: /archived logs/i })).not.toBeInTheDocument();
	});

	it("renders 5 rows with correct column values", async () => {
		mockGet.mockResolvedValue(mockPaginatedResponse);

		renderWithProviders(<AuditLogsPage />);

		await waitFor(() => {
			expect(screen.getByText("user.role.update")).toBeInTheDocument();
		});

		expect(screen.getByText("role.permission.update")).toBeInTheDocument();
		expect(screen.getByText("user.login.success")).toBeInTheDocument();
		expect(screen.getByText("company.status.update")).toBeInTheDocument();
		expect(screen.getByText("tenant.cleanup")).toBeInTheDocument();

		const rows = screen.getAllByRole("button", { name: /—/ });
		expect(rows).toHaveLength(5);
	});

	it("shows error state when API fails", async () => {
		mockGet.mockRejectedValue(new Error("Network error"));

		renderWithProviders(<AuditLogsPage />);

		await waitFor(() => {
			expect(screen.getByText(/failed to load audit logs/i)).toBeInTheDocument();
		});
	});
});
