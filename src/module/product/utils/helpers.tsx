export function formatPrice(value: number | string): string {
	const numberValue = typeof value === "string" ? Number(value.replace(/[^\d.-]/g, "")) : value;

	if (!Number.isFinite(numberValue)) return "";

	return `${numberValue.toLocaleString("en-US", {
		maximumFractionDigits: 2,
	})}`;
}
