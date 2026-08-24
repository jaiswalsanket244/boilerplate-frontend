"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Check, ChevronRight, Copy } from "lucide-react";
import { AuditStatus, type IAuditLog } from "@/module/audit-logs/types";
import { ChangeDiff } from "@/module/audit-logs/components/change-diff";
import {
	getActionDisplay,
	initials,
	isRecordChange,
	maskSecrets,
	relativeTime,
} from "@/module/audit-logs/utils/audit-format";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

function CopyButton({ value }: { value: string }) {
	const [copied, setCopied] = useState(false);
	return (
		<Button
			type="button"
			variant="ghost"
			size="icon"
			aria-label="Copy to clipboard"
			className="text-muted-foreground hover:text-foreground h-5 w-5 [&_svg]:size-3"
			onClick={() => {
				void navigator.clipboard?.writeText(value);
				setCopied(true);
				setTimeout(() => setCopied(false), 1200);
			}}
		>
			{copied ? <Check /> : <Copy />}
		</Button>
	);
}

function SectionTitle({ children }: { children: React.ReactNode }) {
	return <h4 className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">{children}</h4>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div className="min-w-0">
			<p className="text-muted-foreground text-xs">{label}</p>
			<div className="text-sm font-medium wrap-break-word">{children}</div>
		</div>
	);
}

interface AuditLogDrawerProps {
	auditLog: IAuditLog | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	isSuperAdmin?: boolean;
}

export default function AuditLogDrawer({ auditLog, open, onOpenChange, isSuperAdmin = false }: AuditLogDrawerProps) {
	if (!auditLog) return null;

	const log = auditLog;
	const action = getActionDisplay(log);
	const ActionIcon = action.icon;
	const recordChange = isRecordChange(log);
	const changes = log.changes ?? [];
	const snapshot = log.metadata?.snapshot as Record<string, unknown> | undefined;
	const parsedModel = log.targetType;

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="w-full p-0 sm:max-w-xl">
				<SheetHeader className="border-b px-6 py-4">
					<SheetTitle className="flex items-center gap-2">
						<Badge variant="secondary" className={cn("gap-1 text-xs", action.badgeClass)}>
							{ActionIcon && <ActionIcon className="h-3 w-3" />}
							{action.label}
						</Badge>
						{log.status === AuditStatus.FAILURE && (
							<Badge variant="destructive" className="text-xs">
								Failed
							</Badge>
						)}
					</SheetTitle>
					<div className="flex items-center gap-3 pt-1">
						<Avatar className="h-9 w-9">
							<AvatarFallback className="text-xs">{initials(log.actor.name, log.actorEmail)}</AvatarFallback>
						</Avatar>
						<div className="min-w-0">
							<p className="truncate text-sm font-medium">
								{log.actor.name || log.actorEmail || <span className="italic">system</span>}
							</p>
							<p className="text-muted-foreground flex items-center gap-1.5 text-xs">
								<Badge variant="outline" className="text-[10px]">
									{log.actorRole}
								</Badge>
								<span title={format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss")}>
									{relativeTime(log.timestamp)}
								</span>
							</p>
						</div>
					</div>
				</SheetHeader>

				<ScrollArea className="h-[calc(100vh-104px)]">
					<div className="space-y-6 px-6 py-5">
						{/* Changes — the hero */}
						{changes.length > 0 && (
							<section>
								<SectionTitle>Changes</SectionTitle>
								<ChangeDiff changes={changes} />
							</section>
						)}

						{/* Snapshot — create/delete full record */}
						{snapshot && Object.keys(snapshot).length > 0 && (
							<section>
								<Collapsible>
									<CollapsibleTrigger className="group text-muted-foreground hover:text-foreground flex w-full items-center gap-1 text-xs font-semibold tracking-wider uppercase">
										<ChevronRight className="h-3.5 w-3.5 transition-transform group-data-[state=open]:rotate-90" />
										Snapshot
									</CollapsibleTrigger>
									<CollapsibleContent>
										<pre className="bg-muted/50 mt-2 max-h-80 overflow-auto rounded-lg border p-3 font-mono text-xs">
											{JSON.stringify(maskSecrets(snapshot), null, 2)}
										</pre>
									</CollapsibleContent>
								</Collapsible>
							</section>
						)}

						{(parsedModel || log.targetId || log.target.label) && (
							<section>
								<SectionTitle>Record</SectionTitle>
								<div className="grid grid-cols-2 gap-4">
									<Field label="Model">{parsedModel ?? "—"}</Field>
									{log.target.label && <Field label="Label">{log.target.label}</Field>}
									{log.targetId && (
										<div className="col-span-2 min-w-0">
											<p className="text-muted-foreground text-xs">Record ID</p>
											<p className="flex items-center gap-1.5 font-mono text-xs break-all">
												{log.targetId}
												<CopyButton value={log.targetId} />
											</p>
										</div>
									)}
								</div>
							</section>
						)}

						<section>
							<SectionTitle>Actor</SectionTitle>
							<div className="grid grid-cols-2 gap-4">
								<Field label="Name">{log.actor.name ?? "—"}</Field>
								<Field label="Email">{log.actorEmail ?? <span className="italic">system</span>}</Field>
								<Field label="Role">
									<Badge variant="outline">{log.actorRole}</Badge>
								</Field>
								{log.actor.impersonatedBy && (
									<Field label="Impersonated by">
										<span className="font-mono text-xs">{log.actor.impersonatedBy}</span>
									</Field>
								)}
								{isSuperAdmin && log.companyRef && (
									<div className="col-span-2 min-w-0">
										<p className="text-muted-foreground text-xs">Company</p>
										<p className="font-mono text-xs break-all">{log.companyRef}</p>
									</div>
								)}
							</div>
						</section>

						<section>
							<SectionTitle>Context</SectionTitle>
							<div className="grid grid-cols-2 gap-4">
								<Field label="IP Address">{log.context.ip ?? "—"}</Field>
								<Field label="Method">{log.context.method ?? "—"}</Field>
								<div className="col-span-2">
									<Field label="Path">{log.context.path ?? "—"}</Field>
								</div>
								<div className="col-span-2">
									<p className="text-muted-foreground text-xs">User Agent</p>
									<p className="text-xs wrap-break-word">{log.context.userAgent ?? "—"}</p>
								</div>
								{log.requestId && (
									<div className="col-span-2 min-w-0">
										<p className="text-muted-foreground text-xs">Request ID</p>
										<p className="flex items-center gap-1.5 font-mono text-xs break-all">
											{log.requestId}
											<CopyButton value={log.requestId} />
										</p>
									</div>
								)}
							</div>
						</section>

						{log.status === AuditStatus.FAILURE && log.failureReason && (
							<section>
								<SectionTitle>Failure Reason</SectionTitle>
								<div className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border p-3 text-sm">
									{log.failureReason}
								</div>
							</section>
						)}

						{/* Chain integrity — legacy; hidden for data-change rows, super-admin only */}
						{isSuperAdmin && !recordChange && log._sig && (
							<details className="rounded-lg border p-3">
								<summary className="text-muted-foreground cursor-pointer text-xs font-semibold tracking-wider uppercase">
									Chain Integrity
								</summary>
								<div className="mt-3 space-y-3">
									<div className="min-w-0">
										<p className="text-muted-foreground text-xs">Signature (_sig)</p>
										<p className="truncate font-mono text-xs" title={log._sig}>
											{log._sig}
										</p>
									</div>
									<div className="min-w-0">
										<p className="text-muted-foreground text-xs">Previous Signature (_prevSig)</p>
										<p className="truncate font-mono text-xs" title={log._prevSig}>
											{log._prevSig}
										</p>
									</div>
								</div>
							</details>
						)}
					</div>
				</ScrollArea>
			</SheetContent>
		</Sheet>
	);
}
