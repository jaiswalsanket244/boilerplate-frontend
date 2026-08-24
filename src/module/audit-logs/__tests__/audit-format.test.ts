import { describe, expect, it } from "vitest";
import { AuditCategory, AuditStatus, type IAuditLog, type IAuditLogChange } from "@/module/audit-logs/types";
import { maskSecrets, summarizeLog } from "@/module/audit-logs/utils/audit-format";

const makeLog = (overrides: Partial<IAuditLog> = {}): IAuditLog => ({
	_id: "log-1",
	companyRef: "company-abc",
	targetType: "user",
	targetId: "user-123",
	timestamp: "2026-05-20T10:00:00.000Z",
	actorId: "actor-1",
	actorEmail: "admin@test.com",
	actorRole: "admin",
	category: AuditCategory.RECORD_CHANGE,
	action: "user.updated",
	status: AuditStatus.SUCCESS,
	_sig: "abc123",
	_prevSig: "ROOT",
	subsystemMappingVersion: 1,
	requestId: "req-1",
	actor: { name: "Admin User" },
	target: { label: null },
	context: { ip: "127.0.0.1", userAgent: "Mozilla", path: "/api/users", method: "PUT" },
	...overrides,
});

const change = (field: string, before: unknown, after: unknown): IAuditLogChange => ({ field, before, after });

describe("summarizeLog redaction", () => {
	it("shows before → after values for a non-sensitive scalar change", () => {
		const log = makeLog({ changes: [change("name", "Old Name", "New Name")] });
		expect(summarizeLog(log)).toBe("name: Old Name → New Name");
	});

	it("never leaks values for a sensitive single-field change", () => {
		const secretValues = ["s3cr3t-old", "s3cr3t-new"];
		for (const field of ["password", "apiToken", "clientSecret", "passwordHash"]) {
			const summary = summarizeLog(makeLog({ changes: [change(field, secretValues[0], secretValues[1])] }));
			expect(summary).toBe(`Changed ${field}`);
			for (const value of secretValues) {
				expect(summary).not.toContain(value);
			}
		}
	});

	it("lists only field names (no values) for multi-field changes", () => {
		const log = makeLog({
			changes: [change("password", "old", "new"), change("email", "a@x.com", "b@x.com")],
		});
		expect(summarizeLog(log)).toBe("Changed password, email");
	});
});

describe("maskSecrets", () => {
	it("redacts nested secret-looking keys inside object values", () => {
		const masked = maskSecrets({ profile: { name: "Jane", apiToken: "tok_123" }, passwordHash: "hash_x" });
		expect(masked).toEqual({ profile: { name: "Jane", apiToken: "<redacted>" }, passwordHash: "<redacted>" });
	});

	it("recurses into arrays", () => {
		const masked = maskSecrets([{ secret: "a" }, { keep: "b" }]);
		expect(masked).toEqual([{ secret: "<redacted>" }, { keep: "b" }]);
	});
});
