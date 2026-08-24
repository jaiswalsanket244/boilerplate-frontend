"use client";

import { useState } from "react";
import { ArrowRight, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { type IAuditLogChange } from "@/module/audit-logs/types";
import { maskSecrets, SENSITIVE_FIELD_PATTERN } from "@/module/audit-logs/utils/audit-format";

type DiffState = "added" | "removed" | "changed";

function diffState(change: IAuditLogChange): DiffState {
	if (change.before == null && change.after != null) return "added";
	if (change.after == null && change.before != null) return "removed";
	return "changed";
}

function isScalar(v: unknown): v is string | number | boolean | null {
	return v === null || ["string", "number", "boolean"].includes(typeof v);
}

function scalarText(v: unknown): string {
	if (v === null || v === undefined) return "null";
	return String(v);
}

const STATE_BADGE: Record<DiffState, string> = {
	added: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
	removed: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
	changed: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
};

/** Monospace value pill; collapsible when the value is an object/array. */
function ValueBlock({ value, tone }: { value: unknown; tone: "before" | "after" }) {
	const [open, setOpen] = useState(false);
	const toneClass =
		tone === "before"
			? "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
			: "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300";

	if (isScalar(value)) {
		return (
			<code
				className={cn(
					"inline-block max-w-full overflow-x-auto rounded border px-1.5 py-0.5 font-mono text-xs whitespace-pre-wrap",
					toneClass,
					tone === "before" && "line-through decoration-red-400/70"
				)}
			>
				{scalarText(value)}
			</code>
		);
	}

	return (
		<div className="min-w-0">
			<button
				type="button"
				onClick={() => setOpen((o) => !o)}
				className={cn("flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-xs", toneClass)}
			>
				<ChevronRight className={cn("h-3 w-3 transition-transform", open && "rotate-90")} />
				{Array.isArray(value) ? `Array(${value.length})` : "Object"}
			</button>
			{open && (
				<pre className={cn("mt-1 max-h-64 overflow-auto rounded border p-2 font-mono text-xs", toneClass)}>
					{JSON.stringify(maskSecrets(value), null, 2)}
				</pre>
			)}
		</div>
	);
}

function DiffRow({ change }: { change: IAuditLogChange }) {
	const state = diffState(change);
	const redacted = SENSITIVE_FIELD_PATTERN.test(change.field);

	return (
		<div className="bg-muted/40 space-y-2 rounded-lg border p-3">
			<div className="flex items-center gap-2">
				<code className="text-foreground font-mono text-xs font-semibold break-all">{change.field}</code>
				<Badge variant="secondary" className={cn("text-[10px] capitalize", STATE_BADGE[state])}>
					{state}
				</Badge>
			</div>
			{redacted ? (
				<code className="text-muted-foreground inline-block rounded border px-1.5 py-0.5 font-mono text-xs">
					&lt;redacted&gt;
				</code>
			) : (
				<div className="flex flex-wrap items-start gap-2">
					{state !== "added" && <ValueBlock value={change.before} tone="before" />}
					{state === "changed" && <ArrowRight className="text-muted-foreground mt-1 h-3.5 w-3.5 shrink-0" />}
					{state !== "removed" && <ValueBlock value={change.after} tone="after" />}
				</div>
			)}
		</div>
	);
}

export function ChangeDiff({ changes }: { changes: IAuditLogChange[] }) {
	if (!changes.length) return null;
	return (
		<div className="space-y-2">
			{changes.map((change, i) => (
				<DiffRow key={`${change.field}-${i}`} change={change} />
			))}
		</div>
	);
}
