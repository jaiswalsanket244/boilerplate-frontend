import { renderWithProviders } from "@/tests/utils/mock-providers";
import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AuditLogDrawer from "@/module/audit-logs/components/audit-log-drawer";
import { AuditCategory, AuditStatus, type IAuditLog } from "@/module/audit-logs/types";

const fixture: IAuditLog = {
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
};

describe("AuditLogDrawer (admin role)", () => {
	it("hides chain integrity section when isSuperAdmin is false", () => {
		renderWithProviders(<AuditLogDrawer auditLog={fixture} isSuperAdmin={false} open={true} onOpenChange={vi.fn()} />);

		expect(screen.queryByText("Chain Integrity")).not.toBeInTheDocument();
		expect(screen.queryByText("Signature (_sig)")).not.toBeInTheDocument();
	});

	it("shows chain integrity section when isSuperAdmin is true", () => {
		renderWithProviders(<AuditLogDrawer auditLog={fixture} isSuperAdmin={true} open={true} onOpenChange={vi.fn()} />);

		expect(screen.getByText("Chain Integrity")).toBeInTheDocument();
	});

	it("hides the company reference for admin", () => {
		renderWithProviders(<AuditLogDrawer auditLog={fixture} isSuperAdmin={false} open={true} onOpenChange={vi.fn()} />);

		expect(screen.queryByText("Company")).not.toBeInTheDocument();
		expect(screen.queryByText(fixture.companyRef)).not.toBeInTheDocument();
	});

	it("shows the company reference for super-admin", () => {
		renderWithProviders(<AuditLogDrawer auditLog={fixture} isSuperAdmin={true} open={true} onOpenChange={vi.fn()} />);

		expect(screen.getByText("Company")).toBeInTheDocument();
		expect(screen.getByText(fixture.companyRef)).toBeInTheDocument();
	});
});
