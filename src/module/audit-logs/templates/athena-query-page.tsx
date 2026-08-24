"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAthenaAPI } from "@/module/audit-logs/hooks/useAthena";
import { type IAthenaQueryResultSet, type IAthenaQueryRequest } from "@/module/audit-logs/types";
import { type AthenaFilters, EMPTY_ATHENA_FILTERS, buildPreviewQuery } from "@/module/audit-logs/utils/athena";
import { AthenaFiltersCard } from "@/module/audit-logs/components/athena-filters";
import { AthenaSqlEditor } from "@/module/audit-logs/components/athena-sql-editor";
import { AthenaResultsCard } from "@/module/audit-logs/components/athena-results";
import GoBackButton from "@/components/common/go-back-button";
import { routes } from "@/config/routes";
import { ARIA_ROLE } from "@/lib/constants/aria";

export function AthenaQueryPage() {
	const router = useRouter();
	const [query, setQuery] = useState("SELECT * FROM audit_archive LIMIT 100;");
	const [isQueryManual, setIsQueryManual] = useState(false);
	const [filters, setFilters] = useState<AthenaFilters>(EMPTY_ATHENA_FILTERS);
	const [results, setResults] = useState<IAthenaQueryResultSet | null>(null);
	const [queryError, setQueryError] = useState<string | null>(null);

	const { useRunQueryMutation } = useAthenaAPI();
	const runQuery = useRunQueryMutation();

	useEffect(() => {
		if (isQueryManual) return;
		setQuery(buildPreviewQuery(filters));
	}, [filters, isQueryManual]);

	const updateFilter = <K extends keyof AthenaFilters>(key: K, value: AthenaFilters[K]) => {
		setFilters((prev) => ({ ...prev, [key]: value }));
		setIsQueryManual(false);
	};

	const resetFilters = () => {
		setFilters(EMPTY_ATHENA_FILTERS);
		setIsQueryManual(false);
	};

	const handleManualChange = (value: string) => {
		setQuery(value);
		setIsQueryManual(true);
	};

	const handleRunQuery = () => {
		if (runQuery.isPending) return;
		if (isQueryManual && !query.trim()) return;
		setQueryError(null);

		const request: IAthenaQueryRequest = isQueryManual
			? { query }
			: {
					filters: {
						...filters,
						startDate: filters.startDate?.toISOString(),
						endDate: filters.endDate?.toISOString(),
					},
				};

		runQuery.mutate(request, {
			onSuccess: (data) => setResults(data),
			onError: () => setQueryError("Query failed. Check the SQL or filters and try again."),
		});
	};

	return (
		<div className="font-inter space-y-6 p-6">
			<GoBackButton label="Back to Audit Logs" onClick={() => router.push(routes.superAdmin.auditLogs.list)} />

			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Audit Log Archive</h1>
					<p className="text-muted-foreground">Search audit logs that have been archived to cold storage.</p>
				</div>
			</div>

			<AthenaFiltersCard filters={filters} onChange={updateFilter} onReset={resetFilters} />

			<AthenaSqlEditor
				query={query}
				manual={isQueryManual}
				running={runQuery.isPending}
				onChange={handleManualChange}
				onRun={handleRunQuery}
			/>

			{queryError && (
				<div
					role={ARIA_ROLE.STATUS}
					className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
				>
					{queryError}
				</div>
			)}

			{results && <AthenaResultsCard results={results.rows} truncated={results.truncated} />}
		</div>
	);
}
