"use client";

import { useState } from "react";
import { useAuditLogsAPI } from "@/module/audit-logs/hooks/useAuditLogs";
import { type IChainVerifyReport } from "@/module/audit-logs/types";
import { ERROR_CODES } from "@/lib/constants/error-codes";
import { ARIA_ROLE } from "@/lib/constants/aria";
import { isAxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, ShieldCheck } from "lucide-react";
import { format } from "date-fns";

const SYSTEM_SUBSYSTEMS = ["auth", "migration", "athena", "rbac", "cron", "other"] as const;

const COMPANY_ID_PATTERN = /^[a-f0-9]{24}$/;

const INVALID_REF_MESSAGE = "Enter a valid company ID, or pick a subsystem from the system logs dropdown.";

const formatTimestamp = (value: string | null) => {
	if (!value) return "—";
	const parsed = new Date(value);
	return isNaN(parsed.getTime()) ? value : format(parsed, "yyyy-MM-dd HH:mm:ss");
};

const resolveErrorMessage = (error: unknown): string => {
	const axiosError = isAxiosError<{ messageCode?: string }>(error) ? error : undefined;
	const messageCode = axiosError?.response?.data?.messageCode;
	const httpStatus = axiosError?.response?.status;
	if (messageCode === ERROR_CODES.RATE_LIMIT_EXCEEDED || httpStatus === 429) {
		return "Verify rate limit reached. Please try again later.";
	}
	if (messageCode === ERROR_CODES.VERIFY_RETENTION_SWEEP_ACTIVE || httpStatus === 409) {
		return "Retention sweep in progress — retry once it completes (≤30 min).";
	}
	if (messageCode === ERROR_CODES.VERIFY_ROW_LIMIT_EXCEEDED || httpStatus === 413) {
		return "Chain too large to verify inline (over the row cap).";
	}
	if (httpStatus === 400) {
		return INVALID_REF_MESSAGE;
	}
	return "Verification failed. Please try again.";
};

function ReportStat({ label, value }: { label: string; value: string | number }) {
	return (
		<div>
			<p className="text-muted-foreground text-xs">{label}</p>
			<p className="text-sm font-medium">{value}</p>
		</div>
	);
}

function VerifyReport({ report }: { report: IChainVerifyReport }) {
	return (
		<div className="space-y-4">
			<div className="flex items-center gap-2">
				<Badge variant={report.status === "clean" ? "default" : "destructive"} className="capitalize">
					{report.status}
				</Badge>
				<Badge variant="outline">{report.coldTier ? "Hot + cold tiers" : "Hot tier only"}</Badge>
			</div>

			{report.totalEntries === 0 && report.breaksFound === 0 && (
				<p className="text-muted-foreground text-sm">No entries — chain empty and clean.</p>
			)}

			<div className="grid grid-cols-2 gap-3 md:grid-cols-4">
				<ReportStat label="Total entries" value={report.totalEntries} />
				<ReportStat label="Hot entries" value={report.hotEntries} />
				<ReportStat label="Cold entries" value={report.coldEntries} />
				<ReportStat label="Breaks found" value={report.breaksFound} />
			</div>

			<div className="grid grid-cols-1 gap-3 md:grid-cols-3">
				<ReportStat label="First entry" value={formatTimestamp(report.firstEntry)} />
				<ReportStat label="Last entry" value={formatTimestamp(report.lastEntry)} />
				<ReportStat label="Verified at" value={formatTimestamp(report.verifiedAt)} />
			</div>

			{report.anchorUnverified && (
				<div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
					Chain anchor unverified — the first walked row does not start at the chain root.
				</div>
			)}

			{report.retentionLag && (
				<div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
					Retention lag: {report.retentionLag.count} row(s) awaiting archive (oldest{" "}
					{formatTimestamp(report.retentionLag.oldestTimestamp)}, newest{" "}
					{formatTimestamp(report.retentionLag.newestTimestamp)}) — informational, not a tamper signal.
				</div>
			)}

			{report.duplicatesSkipped !== undefined && report.duplicatesSkipped > 0 && (
				<div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
					{report.duplicatesSkipped} duplicate row(s) skipped (crash-residue twins, fully verified).
				</div>
			)}

			{report.breaksFound > 0 && (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Entry</TableHead>
							<TableHead>Position</TableHead>
							<TableHead>Tier</TableHead>
							<TableHead>Type</TableHead>
							<TableHead>Expected</TableHead>
							<TableHead>Actual</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{/* one row can carry multiple breaks at the same entryId+position (e.g. signature + payload_drift) — key needs type+index */}
						{report.breaks.map((chainBreak, index) => (
							<TableRow key={`${chainBreak.entryId}-${chainBreak.position}-${chainBreak.type}-${index}`}>
								<TableCell className="max-w-35 truncate font-mono text-xs" title={chainBreak.entryId}>
									{chainBreak.entryId}
								</TableCell>
								<TableCell>{chainBreak.position}</TableCell>
								<TableCell>{chainBreak.tier}</TableCell>
								<TableCell>{chainBreak.type}</TableCell>
								<TableCell className="max-w-35 truncate font-mono text-xs" title={chainBreak.expected}>
									{chainBreak.expected}
								</TableCell>
								<TableCell className="max-w-35 truncate font-mono text-xs" title={chainBreak.actual}>
									{chainBreak.actual}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			)}
		</div>
	);
}

export function ChainVerifyDialog() {
	const [open, setOpen] = useState(false);
	const [companyId, setCompanyId] = useState("");
	const [subsystem, setSubsystem] = useState("");
	const [validationError, setValidationError] = useState<string | null>(null);
	const [errorNotice, setErrorNotice] = useState<string | null>(null);
	const [report, setReport] = useState<IChainVerifyReport | null>(null);

	const { useVerifyChainMutation } = useAuditLogsAPI();
	const verifyMutation = useVerifyChainMutation();

	const handleOpenChange = (nextOpen: boolean) => {
		setOpen(nextOpen);
		setCompanyId("");
		setSubsystem("");
		setValidationError(null);
		setErrorNotice(null);
		setReport(null);
	};

	const handleRunVerify = () => {
		if (verifyMutation.isPending) return;
		setValidationError(null);
		setErrorNotice(null);
		setReport(null);

		const trimmedRef = subsystem ? `SYSTEM:${subsystem}` : companyId.trim();
		// Only the free-text company ID needs validating; subsystem comes from a controlled dropdown.
		if (!subsystem && !COMPANY_ID_PATTERN.test(trimmedRef)) {
			setValidationError(INVALID_REF_MESSAGE);
			return;
		}

		verifyMutation.mutate(
			{ companyRef: trimmedRef },
			{
				onSuccess: (data) => setReport(data),
				onError: (error) => setErrorNotice(resolveErrorMessage(error)),
			}
		);
	};

	return (
		<>
			<Button variant="outline" size="sm" onClick={() => handleOpenChange(true)}>
				<ShieldCheck className="mr-2 h-4 w-4" />
				Verify Chain
			</Button>
			<Dialog open={open} onOpenChange={handleOpenChange}>
				<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
					<DialogHeader>
						<DialogTitle>Verify Audit Chain</DialogTitle>
						<DialogDescription>
							Walk a company&apos;s full audit chain across hot and cold tiers and check its tamper-evidence.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						<div className="space-y-2">
							<label className="text-sm font-medium" htmlFor="chain-verify-company-ref">
								Company
							</label>
							<Input
								id="chain-verify-company-ref"
								aria-label="Company reference"
								placeholder="Company Id"
								value={companyId}
								onChange={(e) => setCompanyId(e.target.value)}
								disabled={Boolean(subsystem)}
							/>
						</div>

						<div className="flex items-center gap-3">
							<div className="bg-border h-px flex-1" />
							<span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
								or for system logs
							</span>
							<div className="bg-border h-px flex-1" />
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium">System</label>
							<Select
								value={subsystem || "none"}
								onValueChange={(val) => setSubsystem(val === "none" ? "" : val)}
								disabled={companyId.trim() !== ""}
							>
								<SelectTrigger className="w-full" aria-label="System logs">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="none">Select a subsystem</SelectItem>
									{SYSTEM_SUBSYSTEMS.map((sub) => (
										<SelectItem key={sub} value={sub}>
											SYSTEM:{sub}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{validationError && <p className="text-sm text-red-700">{validationError}</p>}
					</div>

					{errorNotice && (
						<div
							role={ARIA_ROLE.STATUS}
							className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
						>
							<span>{errorNotice}</span>
						</div>
					)}

					{report && <VerifyReport report={report} />}

					<div className="flex justify-end gap-2">
						<Button variant="outline" onClick={() => handleOpenChange(false)}>
							Cancel
						</Button>
						<Button onClick={handleRunVerify} disabled={verifyMutation.isPending}>
							{verifyMutation.isPending ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : (
								<ShieldCheck className="mr-2 h-4 w-4" />
							)}
							Run Verify
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}

export default ChainVerifyDialog;
