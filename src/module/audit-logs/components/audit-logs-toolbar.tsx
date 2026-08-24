"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RotateCcw, Database, Download, Loader2 } from "lucide-react";
import { routes } from "@/config/routes";
import { ChainVerifyDialog } from "@/module/audit-logs/components/chain-verify-dialog";
import { type AuditExportFormat } from "@/module/audit-logs/types";

interface AuditLogsToolbarProps {
	isSuperAdmin: boolean;
	hasActiveFilters: boolean;
	onReset: () => void;
	exportFormat: AuditExportFormat;
	onExportFormatChange: (format: AuditExportFormat) => void;
	onExport: () => void;
	isExporting: boolean;
}

export function AuditLogsToolbar({
	isSuperAdmin,
	hasActiveFilters,
	onReset,
	exportFormat,
	onExportFormatChange,
	onExport,
	isExporting,
}: AuditLogsToolbarProps) {
	return (
		<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
				<p className="text-muted-foreground">Track and monitor all activities across the system.</p>
			</div>
			<div className="flex items-center gap-2">
				<Button variant="outline" size="sm" onClick={onReset} disabled={!hasActiveFilters}>
					<RotateCcw className="mr-2 h-4 w-4" />
					Reset Filters
				</Button>
				{isSuperAdmin && (
					<Button asChild variant="outline" size="sm">
						<Link href={routes.superAdmin.auditLogs.archive}>
							<Database className="mr-2 h-4 w-4" />
							Archived Logs
						</Link>
					</Button>
				)}
				{isSuperAdmin && <ChainVerifyDialog />}
				<Select value={exportFormat} onValueChange={(val) => onExportFormatChange(val as AuditExportFormat)}>
					<SelectTrigger className="w-[110px]" aria-label="Export format">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="json">JSON</SelectItem>
						<SelectItem value="csv">CSV</SelectItem>
					</SelectContent>
				</Select>
				<Button size="sm" onClick={onExport} disabled={isExporting}>
					{isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
					Export
				</Button>
			</div>
		</div>
	);
}
