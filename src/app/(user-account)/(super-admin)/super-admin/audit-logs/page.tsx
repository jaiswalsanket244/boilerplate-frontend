import { AuditLogsPage } from "@/module/audit-logs/templates/audit-logs-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Audit Logs | System",
	description: "View and filter system audit logs",
};

export default function Page() {
	return <AuditLogsPage />;
}
