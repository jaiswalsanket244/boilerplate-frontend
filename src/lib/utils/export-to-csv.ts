/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment  */
export function exportToCSV(data: Record<string, any>[], header: string, fileName: string): void {
	const keys = header.split(",").map((key) => key.trim());

	const csvRows = [
		header, // Add header row first
		...data.map((row) =>
			keys
				.map((key) => {
					const val = row[key];
					if (val === null || val === undefined) return "";
					// Escape double quotes by doubling them
					const escaped = String(val).replace(/"/g, '""');
					return `"${escaped}"`;
				})
				.join(",")
		),
	];

	const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
	const encodedUri = encodeURI(csvContent);

	const link = document.createElement("a");
	link.setAttribute("href", encodedUri);
	link.setAttribute("download", `${fileName}.csv`);
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}
