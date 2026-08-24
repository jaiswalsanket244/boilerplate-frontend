import { describe, expect, it } from "vitest";
import { AuditCategory, AuditStatus, type IAuditLog } from "@/module/audit-logs/types";

describe("IAuditLog type compatibility", () => {
	it("accepts a backend-shaped JSON sample", () => {
		const sample: IAuditLog = {
			_id: "6650a1b2c3d4e5f6a7b8c9d0",
			companyRef: "6650a1b2c3d4e5f6a7b8c9d1",
			targetType: "user",
			targetId: "6650a1b2c3d4e5f6a7b8c9d2",
			timestamp: "2026-05-20T10:00:00.000Z",
			actorId: "6650a1b2c3d4e5f6a7b8c9d3",
			actorEmail: "admin@example.com",
			actorRole: "admin",
			category: AuditCategory.ADMIN_ACTION,
			action: "user.role.update",
			status: AuditStatus.SUCCESS,
			_sig: "sha256:abc123def456",
			_prevSig: "ROOT",
			subsystemMappingVersion: 1,
			requestId: "550e8400-e29b-41d4-a716-446655440000",
			actor: { name: "Admin User", impersonatedBy: "6650a1b2c3d4e5f6a7b8c9d4" },
			target: { label: "John Doe" },
			context: {
				ip: "192.168.1.1",
				userAgent: "Mozilla/5.0",
				path: "/api/admin/users/role",
				method: "PUT",
			},
			changes: [{ field: "roles", before: "user", after: "admin" }],
			metadata: { source: "admin-panel" },
			failureReason: undefined,
		};

		expect(sample._id).toBe("6650a1b2c3d4e5f6a7b8c9d0");
		expect(sample.category).toBe(AuditCategory.ADMIN_ACTION);
		expect(sample.changes?.[0]?.field).toBe("roles");
	});

	it("accepts nullable fields as null", () => {
		const sample: IAuditLog = {
			_id: "6650a1b2c3d4e5f6a7b8c9d0",
			companyRef: "SYSTEM:cron",
			targetType: null,
			targetId: null,
			timestamp: "2026-05-20T06:00:00.000Z",
			actorId: "000000000000000000000005",
			actorEmail: null,
			actorRole: "user",
			category: AuditCategory.SYSTEM,
			action: "cron.cleanup.run",
			status: AuditStatus.SUCCESS,
			_sig: "sha256:xyz",
			_prevSig: "sha256:abc",
			subsystemMappingVersion: 1,
			requestId: null,
			actor: { name: null },
			target: { label: null },
			context: { ip: null, userAgent: null, path: null, method: null },
		};

		expect(sample.actorEmail).toBeNull();
		expect(sample.targetType).toBeNull();
	});
});
