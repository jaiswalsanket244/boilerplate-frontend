import { renderWithProviders } from "@/tests/utils/mock-providers";
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AuditLogDrawer from "@/module/audit-logs/components/audit-log-drawer";
import { AuditCategory, AuditStatus, type IAuditLog } from "@/module/audit-logs/types";

const makeAuditLog = (overrides: Partial<IAuditLog> = {}): IAuditLog => ({
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
	...overrides,
});

describe("AuditLogDrawer", () => {
	it("redacts password field in changes", () => {
		const auditLog = makeAuditLog({
			changes: [
				{ field: "password", before: "old-secret-123", after: "new-secret-456" },
				{ field: "name", before: "Old Name", after: "New Name" },
			],
		});

		renderWithProviders(<AuditLogDrawer auditLog={auditLog} open={true} onOpenChange={vi.fn()} />);

		expect(screen.getAllByText("<redacted>")).toHaveLength(1);

		expect(screen.queryByText("old-secret-123")).not.toBeInTheDocument();
		expect(screen.queryByText("new-secret-456")).not.toBeInTheDocument();

		expect(screen.getByText("Old Name")).toBeInTheDocument();
		expect(screen.getByText("New Name")).toBeInTheDocument();
	});

	it("redacts fields matching token/secret/hash patterns", () => {
		const auditLog = makeAuditLog({
			changes: [
				{ field: "apiToken", before: "tok_abc", after: "tok_def" },
				{ field: "secretKey", before: "sk_old", after: "sk_new" },
				{ field: "passwordHash", before: "hash_old", after: "hash_new" },
			],
		});

		renderWithProviders(<AuditLogDrawer auditLog={auditLog} open={true} onOpenChange={vi.fn()} />);

		expect(screen.queryByText("tok_abc")).not.toBeInTheDocument();
		expect(screen.queryByText("sk_old")).not.toBeInTheDocument();
		expect(screen.queryByText("hash_old")).not.toBeInTheDocument();

		expect(screen.getAllByText("<redacted>")).toHaveLength(3);
	});

	it("shows failure reason when status is failure", () => {
		const auditLog = makeAuditLog({
			status: AuditStatus.FAILURE,
			failureReason: "Insufficient permissions for role update",
		});

		renderWithProviders(<AuditLogDrawer auditLog={auditLog} open={true} onOpenChange={vi.fn()} />);

		expect(screen.getByText("Insufficient permissions for role update")).toBeInTheDocument();
	});

	it("shows system placeholder when actorEmail is null", () => {
		const auditLog = makeAuditLog({ actorEmail: null });

		renderWithProviders(<AuditLogDrawer auditLog={auditLog} open={true} onOpenChange={vi.fn()} />);

		expect(screen.getByText("system")).toBeInTheDocument();
	});

	it("omits metadata section when metadata is undefined", () => {
		const auditLog = makeAuditLog({ metadata: undefined });

		renderWithProviders(<AuditLogDrawer auditLog={auditLog} open={true} onOpenChange={vi.fn()} />);

		expect(screen.queryByText("Metadata")).not.toBeInTheDocument();
	});

	it("omits changes section when changes is undefined", () => {
		const auditLog = makeAuditLog({ changes: undefined });

		renderWithProviders(<AuditLogDrawer auditLog={auditLog} open={true} onOpenChange={vi.fn()} />);

		expect(screen.queryByText("Changes")).not.toBeInTheDocument();
	});
});
