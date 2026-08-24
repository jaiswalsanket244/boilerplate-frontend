"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { type IAthenaQueryResult } from "@/module/audit-logs/types";
import { downloadResultsCsv } from "@/module/audit-logs/utils/athena";

export function AthenaResultsCard({
	results,
	truncated = false,
}: {
	results: IAthenaQueryResult[];
	truncated?: boolean;
}) {
	const columns = results.length > 0 ? Object.keys(results[0]!) : [];

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0">
				<CardTitle>
					Results ({results.length}
					{truncated ? "+" : ""} rows)
				</CardTitle>
				<Button variant="outline" size="sm" onClick={() => downloadResultsCsv(results)} disabled={results.length === 0}>
					<Download className="mr-2 h-4 w-4" />
					Download CSV
				</Button>
			</CardHeader>
			<CardContent>
				{truncated && (
					<div className="mb-3 rounded-md border border-amber-200 bg-amber-50 p-2 text-sm text-amber-700">
						Showing the first {results.length} rows only — refine your filters or add a tighter query to see the rest.
					</div>
				)}
				{results.length > 0 ? (
					<div className="overflow-x-auto rounded-md border">
						<Table>
							<TableHeader>
								<TableRow className="bg-slate-50">
									{columns.map((col) => (
										<TableHead key={col} className="font-bold whitespace-nowrap">
											{col}
										</TableHead>
									))}
								</TableRow>
							</TableHeader>
							<TableBody>
								{results.map((row, i) => (
									<TableRow key={i}>
										{columns.map((col) => (
											<TableCell key={`${i}-${col}`} className="whitespace-nowrap">
												{String(row[col] ?? "")}
											</TableCell>
										))}
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				) : (
					<div className="text-muted-foreground flex h-32 items-center justify-center">No results returned.</div>
				)}
			</CardContent>
		</Card>
	);
}
