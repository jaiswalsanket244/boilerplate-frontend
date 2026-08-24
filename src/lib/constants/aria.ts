// ARIA role attribute values, centralized to avoid repeating magic strings.
// See: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles

export const ARIA_ROLE = {
	STATUS: "status",
	ALERT: "alert",
} as const;

export type TAriaRole = (typeof ARIA_ROLE)[keyof typeof ARIA_ROLE];
