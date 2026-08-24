import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { ISortOptionsProps, TSortOption } from "@/module/profile/types";
import { Check } from "lucide-react";
import { MdOutlineSwapVert } from "react-icons/md";

const sortOptions: TSortOption[] = [
	{ label: "Date Newest to Oldest", value: "createdAt", order: "desc" },
	{ label: "Date Oldest to Newest", value: "createdAt", order: "asc" },
];

const SortOptions = ({ onSortChange, sortBy, sortOrder }: ISortOptionsProps) => {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					data-testid="sort-options-trigger"
					variant="outline"
					className={cn(
						"size-10 gap-2 rounded-md border-none bg-muted p-0 text-xs shadow-none hover:bg-muted/50 [&_svg]:size-6 [&_svg]:text-txt-primary"
					)}
				>
					<MdOutlineSwapVert size={25} className="text-lg" />
				</Button>
			</PopoverTrigger>
			<PopoverContent>
				{sortOptions.map((option, index) => (
					<div key={`${option.value}-${index}`} className="flex items-center space-x-2 border-b py-1">
						{option.value === sortBy && option.order === sortOrder ? (
							<Check className="size-5 text-primary" />
						) : (
							<div className="size-5" />
						)}
						<Button
							data-testid={`sort-option-${option.value}-${option.order}`}
							onClick={() => onSortChange(option.value, option.order)}
							variant="ghost"
							size="sm"
							className="flex h-10 w-full justify-start rounded-none border-none bg-transparent px-0 text-left text-base hover:bg-transparent"
						>
							{option.label}
						</Button>
					</div>
				))}
			</PopoverContent>
		</Popover>
	);
};

export default SortOptions;
