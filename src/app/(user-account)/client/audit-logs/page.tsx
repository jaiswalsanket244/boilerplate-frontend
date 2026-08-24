import { AuditLogsPage } from "@/module/audit-logs/templates/audit-logs-page";
import { type Metadata } from "next";

export const metadata: Metadata = {
	title: "Audit Logs",
	description: "View and filter audit logs for your organization",
};

export default function Page() {
	return <AuditLogsPage />;
}
