import { type AuditStatus, type IAthenaQueryResult } from "@/module/audit-logs/types";

export interface AthenaFilters {
	action: string;
	resource: string;
	resourceId: string;
	actor: string;
	status: AuditStatus | undefined;
	startDate: Date | undefined;
	endDate: Date | undefined;
}

export const EMPTY_ATHENA_FILTERS: AthenaFilters = {
	action: "",
	resource: "",
	resourceId: "",
	actor: "",
	status: undefined,
	startDate: undefined,
	endDate: undefined,
};

/**
 * Read-only SQL preview shown in the editor — mirrors the query the backend builds from filters.
 * It is only executed if the user edits it (manual mode); filter-mode runs send the filters, not this string.
 */
export function buildPreviewQuery(filters: AthenaFilters): string {
	let sql = "SELECT * FROM audit_archive\nWHERE 1=1";
	if (filters.action) sql += `\n  AND action LIKE '${filters.action}%' ESCAPE '\\'`;
	if (filters.resource) sql += `\n  AND targetType = '${filters.resource}'`;
	if (filters.resourceId) sql += `\n  AND targetId = '${filters.resourceId}'`;
	if (filters.status) sql += `\n  AND status = '${filters.status}'`;
	if (filters.actor)
		sql += `\n  AND (actor_name LIKE '%${filters.actor}%' OR actorEmail LIKE '%${filters.actor}%' OR actorId = '${filters.actor}')`;
	if (filters.startDate) sql += `\n  AND timestamp >= CAST('${filters.startDate.toISOString()}' AS TIMESTAMP)`;
	if (filters.endDate) sql += `\n  AND timestamp <= CAST('${filters.endDate.toISOString()}' AS TIMESTAMP)`;
	sql += "\nLIMIT 100;";
	return sql;
}

export function downloadResultsCsv(results: IAthenaQueryResult[]): void {
	if (results.length === 0) return;

	const headers = Object.keys(results[0]!);
	const csv = [
		headers.join(","),
		...results.map((row) => headers.map((header) => JSON.stringify(row[header] ?? "")).join(",")),
	].join("\n");

	const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
	const link = document.createElement("a");
	link.href = url;
	link.download = `archive_results_${Date.now()}.csv`;
	link.style.visibility = "hidden";
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}
