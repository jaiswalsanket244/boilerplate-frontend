import { describe, expect, it } from "vitest";
import { filterMenuByPermissions } from "@/module/profile/utils/menu-permissions";
import { clientMenuItems } from "@/module/profile/utils/menu-items";
import { PERMISSIONS } from "@/types/permission";
import { ROLES } from "@/types";

describe("admin audit-logs menu entry", () => {
	it("shows audit-logs entry for admin with AUDIT_LOGS_VIEW", () => {
		const filtered = filterMenuByPermissions(clientMenuItems, [PERMISSIONS.AUDIT_LOGS_VIEW], ROLES.ADMIN);

		const entry = filtered.find((item) => item.name === "Audit Logs");
		expect(entry).toBeDefined();
	});

	it("hides audit-logs entry for admin without AUDIT_LOGS_VIEW", () => {
		const filtered = filterMenuByPermissions(clientMenuItems, [], ROLES.ADMIN);

		const entry = filtered.find((item) => item.name === "Audit Logs");
		expect(entry).toBeUndefined();
	});

	it("hides audit-logs entry for user role even with permission", () => {
		const filtered = filterMenuByPermissions(clientMenuItems, [PERMISSIONS.AUDIT_LOGS_VIEW], ROLES.USER);

		const entry = filtered.find((item) => item.name === "Audit Logs");
		expect(entry).toBeDefined();
	});
});
