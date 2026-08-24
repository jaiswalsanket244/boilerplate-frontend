import { Card, CardContent } from "@/components/ui/card";
import { IoIosInformationCircle } from "react-icons/io";

// Define the interface for metric data
interface MetricData {
	totalEarnings: string;
	pendingTransfer: string;
	transferred: string;
}

interface MetricCardsProps {
	data: MetricData;
	isLoading?: boolean;
}

export function MetricCards({ data }: MetricCardsProps) {
	const metrics = [
		{
			title: "Total Earnings",
			value: data.totalEarnings,
			bgColor: "bg-[#EAF6ED]",
			textColor: "text-[#F6BC2F]",
		},
		{
			title: "Pending Transfer",
			value: data.pendingTransfer,
			bgColor: "bg-[#FDF2DC]",
			textColor: "text-[#F6BC2F]",
		},
		{
			title: "Transferred",
			value: data.transferred,
			bgColor: "bg-[#EFF4FE]",
			textColor: "text-[#F6BC2F]",
		},
	];

	return (
		<div className="flex h-full flex-col justify-between">
			{metrics.map((metric, index) => (
				<Card key={index} className={`${metric.bgColor} border-0 shadow-none`}>
					<CardContent className="p-6">
						<div className="mb-2 flex items-center gap-2">
							<h3 className="text-sm font-medium text-[#5E5E5E]">{metric.title}</h3>
							<IoIosInformationCircle className={`h-4 w-4 ${metric.textColor}`} />
						</div>
						<p className="text-3xl font-bold">{metric.value}</p>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
