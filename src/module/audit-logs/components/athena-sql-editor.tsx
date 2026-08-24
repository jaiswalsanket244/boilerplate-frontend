"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Play } from "lucide-react";

interface AthenaSqlEditorProps {
	query: string;
	manual: boolean;
	running: boolean;
	onChange: (value: string) => void;
	onRun: () => void;
}

export function AthenaSqlEditor({ query, manual, running, onChange, onRun }: AthenaSqlEditorProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					SQL Editor
					{manual && (
						<Badge variant="secondary" className="font-normal">
							Manual Mode
						</Badge>
					)}
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<Textarea
					placeholder="SELECT * FROM audit_archive LIMIT 10"
					className="min-h-[150px] font-mono text-sm"
					value={query}
					onChange={(e) => onChange(e.target.value)}
				/>
				<div className="flex justify-end gap-2">
					<Button onClick={onRun} disabled={running} className="w-32">
						{running ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
						Run Query
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
