import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/class-names";

interface StatsCardProps {
	title: string;
	value: string;
	change: string;
	isPositive: boolean;
}

export function StatsCard({ title, value, change, isPositive }: StatsCardProps) {
	return (
		<Card className="rounded-lg border-border bg-muted shadow-none">
			<CardContent className="p-6 sm:p-6">
				<div className="space-y-2">
					<p className="text-sm font-medium ">{title}</p>
					<div className="flex items-baseline justify-between">
						<h3 className="text-2xl font-bold text-foreground sm:text-3xl">{value}</h3>
						{change && (
							<div
								className={cn(
									"flex items-center space-x-2 text-sm font-medium",
									isPositive ? "text-green" : "text-red"
								)}
							>
								<span>{change + "%"}</span>
								{isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
							</div>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
