import { describe, expect, it } from "vitest";
import { filterMenuByPermissions } from "@/module/profile/utils/menu-permissions";
import { PERMISSIONS } from "@/types/permission";
import { ROLES } from "@/types";
import { type MenuItem } from "@/module/profile/types";

const mockAuditMenuItem: MenuItem = {
	href: "/super-admin/audit-logs",
	name: "Audit Logs",
	Icon: null as unknown as React.ReactNode,
	permissions: [PERMISSIONS.AUDIT_LOGS_VIEW],
};

const mockManageGatedMenuItem: MenuItem = {
	href: "/super-admin/some-manage-gated-page",
	name: "Manage-Gated Entry",
	Icon: null as unknown as React.ReactNode,
	permissions: [PERMISSIONS.AUDIT_LOGS_MANAGE],
};

const mockMenuItems: MenuItem[] = [
	{
		href: "/super-admin/companies",
		name: "Companies",
		Icon: null as unknown as React.ReactNode,
	},
	mockAuditMenuItem,
	mockManageGatedMenuItem,
];

describe("audit-logs menu permission gating", () => {
	it("hides audit-logs entry for admin without AUDIT_LOGS_VIEW", () => {
		const filtered = filterMenuByPermissions(mockMenuItems, [], ROLES.ADMIN);

		const auditLogsEntry = filtered.find((item) => item.name === "Audit Logs");
		expect(auditLogsEntry).toBeUndefined();
	});

	it("shows audit-logs entry for admin with AUDIT_LOGS_VIEW", () => {
		const filtered = filterMenuByPermissions(mockMenuItems, [PERMISSIONS.AUDIT_LOGS_VIEW], ROLES.ADMIN);

		const auditLogsEntry = filtered.find((item) => item.name === "Audit Logs");
		expect(auditLogsEntry).toBeDefined();
		expect(auditLogsEntry?.name).toBe("Audit Logs");
	});

	it("shows audit-logs entry for super_admin with empty permissions (wildcard bypass)", () => {
		const filtered = filterMenuByPermissions(mockMenuItems, [], ROLES.SUPER_ADMIN);

		const auditLogsEntry = filtered.find((item) => item.name === "Audit Logs");
		expect(auditLogsEntry).toBeDefined();
	});

	it("hides Manage-Gated Entry for admin without AUDIT_LOGS_MANAGE", () => {
		const filtered = filterMenuByPermissions(mockMenuItems, [PERMISSIONS.AUDIT_LOGS_VIEW], ROLES.ADMIN);

		const manageGatedEntry = filtered.find((item) => item.name === "Manage-Gated Entry");
		expect(manageGatedEntry).toBeUndefined();
	});

	it("shows Manage-Gated Entry for super_admin (wildcard bypass)", () => {
		const filtered = filterMenuByPermissions(mockMenuItems, [], ROLES.SUPER_ADMIN);

		const manageGatedEntry = filtered.find((item) => item.name === "Manage-Gated Entry");
		expect(manageGatedEntry).toBeDefined();
	});
});
