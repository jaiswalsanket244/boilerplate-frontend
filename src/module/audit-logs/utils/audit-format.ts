import { formatDistanceToNow } from "date-fns";
import { Pencil, Plus, Trash2, type LucideIcon } from "lucide-react";
import { AuditCategory, type IAuditLog, type IAuditLogChange } from "@/module/audit-logs/types";

export type RecordChangeVerb = "created" | "updated" | "deleted";

export interface RecordChangeAction {
	model: string;
	verb: RecordChangeVerb;
}

const VERB_SET = new Set<RecordChangeVerb>(["created", "updated", "deleted"]);

/** "Products.updated" -> { model: "Products", verb: "updated" }; null for non-record-change actions. */
export function parseRecordChangeAction(action: string): RecordChangeAction | null {
	const dot = action.lastIndexOf(".");
	if (dot <= 0) return null;
	const verb = action.slice(dot + 1) as RecordChangeVerb;
	if (!VERB_SET.has(verb)) return null;
	return { model: action.slice(0, dot), verb };
}

export function isRecordChange(log: IAuditLog): boolean {
	return log.category === AuditCategory.RECORD_CHANGE;
}

export interface VerbStyle {
	label: string;
	icon: LucideIcon;
	/** Badge background/text for the action chip. */
	badgeClass: string;
	/** Accent used by the drawer header bar. */
	accentClass: string;
}

export const VERB_STYLES: Record<RecordChangeVerb, VerbStyle> = {
	created: {
		label: "Created",
		icon: Plus,
		badgeClass: "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-950 dark:text-green-300",
		accentClass: "bg-green-500",
	},
	updated: {
		label: "Updated",
		icon: Pencil,
		badgeClass: "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300",
		accentClass: "bg-amber-500",
	},
	deleted: {
		label: "Deleted",
		icon: Trash2,
		badgeClass: "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-950 dark:text-red-300",
		accentClass: "bg-red-500",
	},
};

/** Display names for the category filter dropdown. */
export const CATEGORY_LABELS: Record<AuditCategory, string> = {
	[AuditCategory.AUTHENTICATION]: "Authentication",
	[AuditCategory.ADMIN_ACTION]: "Admin action",
	[AuditCategory.RBAC]: "RBAC",
	[AuditCategory.TENANT]: "Tenant",
	[AuditCategory.SYSTEM]: "System",
	[AuditCategory.AUDIT_META]: "Audit meta",
	[AuditCategory.RECORD_CHANGE]: "Record change",
};

export const CATEGORY_BADGE_CLASSES: Record<AuditCategory, string> = {
	[AuditCategory.AUTHENTICATION]: "bg-blue-100 text-blue-800 hover:bg-blue-100",
	[AuditCategory.ADMIN_ACTION]: "bg-amber-100 text-amber-800 hover:bg-amber-100",
	[AuditCategory.RBAC]: "bg-purple-100 text-purple-800 hover:bg-purple-100",
	[AuditCategory.TENANT]: "bg-slate-100 text-slate-800 hover:bg-slate-100",
	[AuditCategory.SYSTEM]: "bg-zinc-100 text-zinc-800 hover:bg-zinc-100",
	[AuditCategory.AUDIT_META]: "bg-teal-100 text-teal-800 hover:bg-teal-100",
	[AuditCategory.RECORD_CHANGE]: "bg-slate-100 text-slate-800 hover:bg-slate-100",
};

/** Solid dot color used as the quiet type indicator in list rows. */
export const CATEGORY_DOT_CLASSES: Record<AuditCategory, string> = {
	[AuditCategory.AUTHENTICATION]: "bg-blue-500",
	[AuditCategory.ADMIN_ACTION]: "bg-amber-500",
	[AuditCategory.RBAC]: "bg-purple-500",
	[AuditCategory.TENANT]: "bg-slate-400",
	[AuditCategory.SYSTEM]: "bg-zinc-400",
	[AuditCategory.AUDIT_META]: "bg-teal-500",
	[AuditCategory.RECORD_CHANGE]: "bg-slate-400",
};

export interface ActionDisplay {
	label: string;
	badgeClass: string;
	dotClass: string;
	icon: LucideIcon | null;
	verb: RecordChangeVerb | null;
}

/** Color-coded action chip: data-change uses verb color + "Updated Products"; others keep category color + raw action. */
export function getActionDisplay(log: IAuditLog): ActionDisplay {
	const parsed = parseRecordChangeAction(log.action);
	if (isRecordChange(log) && parsed) {
		const style = VERB_STYLES[parsed.verb];
		return {
			label: `${style.label} ${parsed.model}`,
			badgeClass: style.badgeClass,
			dotClass: style.accentClass,
			icon: style.icon,
			verb: parsed.verb,
		};
	}
	return {
		label: log.action,
		badgeClass: CATEGORY_BADGE_CLASSES[log.category] ?? CATEGORY_BADGE_CLASSES[AuditCategory.SYSTEM],
		dotClass: CATEGORY_DOT_CLASSES[log.category] ?? CATEGORY_DOT_CLASSES[AuditCategory.SYSTEM],
		icon: null,
		verb: null,
	};
}

/** A value we can safely render inline (i.e. not an object or array). */
function isSimpleValue(value: unknown): value is string | number | boolean | null {
	return value === null || ["string", "number", "boolean"].includes(typeof value);
}

/** Render a simple value for inline display; empty values show as "∅". */
function formatValue(value: unknown): string {
	if (value === null || value === undefined) return "∅";
	return String(value);
}

/** " — Label" (or " — id") suffix identifying which record the change applies to. */
function targetSuffix(log: IAuditLog): string {
	const identifier = log.target?.label || log.targetId;
	return identifier ? ` — ${identifier}` : "";
}

/** Describe one field change. Sensitive fields show only the field name, never their values. */
function describeSingleChange(change: IAuditLogChange): string {
	if (SENSITIVE_FIELD_PATTERN.test(change.field)) return `Changed ${change.field}`;
	if (isSimpleValue(change.before) && isSimpleValue(change.after)) {
		return `${change.field}: ${formatValue(change.before)} → ${formatValue(change.after)}`;
	}
	return `Changed ${change.field}`;
}

/** One-line, human-readable description generated client-side from action + changes. */
export function summarizeLog(log: IAuditLog): string {
	const parsed = parseRecordChangeAction(log.action);

	// Non-record-change events keep their raw action sentence.
	if (!isRecordChange(log) || !parsed) return log.action;

	const suffix = targetSuffix(log);
	if (parsed.verb === "created") return `Created ${parsed.model}${suffix}`;
	if (parsed.verb === "deleted") return `Deleted ${parsed.model}${suffix}`;

	// verb === "updated": describe the fields that changed.
	const changes = log.changes ?? [];
	if (changes.length === 0) return `Updated ${parsed.model}${suffix}`;
	if (changes.length === 1) return describeSingleChange(changes[0]!);
	return `Changed ${changes.map((change) => change.field).join(", ")}`;
}

/** "2h ago"; pass absolute via title for the hover tooltip. */
export function relativeTime(iso: string): string {
	return formatDistanceToNow(new Date(iso), { addSuffix: true });
}

/** Initials for the avatar fallback. */
export function initials(name: string | null, email: string | null): string {
	const source = name?.trim() || email?.trim() || "";
	if (!source) return "?";
	const parts = source.split(/[\s@._-]+/).filter(Boolean);
	const first = parts[0];
	if (!first) return "?";
	if (parts.length === 1) return first.slice(0, 2).toUpperCase();
	return (first[0]! + parts[1]![0]!).toUpperCase();
}

/**
 * Static list of audited models for the model/targetType filter.
 * Values must match the backend auditPlugin registrations exactly —
 * the targetType filter is a case-sensitive match.
 */
export const AUDITED_MODELS = [
	"company",
	"invitedUser",
	"order",
	"product",
	"refund",
	"subscription",
	"subscriptionPlan",
	"user",
	"vendor",
] as const;

/** "subscriptionPlan" → "Subscription Plan" for display. */
export function modelLabel(model: string): string {
	const spaced = model.replace(/([a-z])([A-Z])/g, "$1 $2");
	return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export const SENSITIVE_FIELD_PATTERN = /password|token|secret|hash/i;

/** Recursively replace values under secret-looking keys with "<redacted>" before display. */
export function maskSecrets(value: unknown): unknown {
	if (Array.isArray(value)) return value.map(maskSecrets);
	if (value === null || typeof value !== "object") return value;
	return Object.fromEntries(
		Object.entries(value).map(([key, v]) => [key, SENSITIVE_FIELD_PATTERN.test(key) ? "<redacted>" : maskSecrets(v)])
	);
}
