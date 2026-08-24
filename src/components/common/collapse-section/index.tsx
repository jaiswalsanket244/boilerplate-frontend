"use client";

import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils/class-names";
import { ChevronRight } from "lucide-react";
import { useState, type ReactNode } from "react";

interface CollapsibleSectionProps {
	title: string;
	children: ReactNode;
	collapseClassName?: string;
	titleClassName?: string;
	defaultOpen?: boolean;
}

export function CollapsibleSection({
	title,
	titleClassName,
	collapseClassName,
	defaultOpen = false,
	children,
}: CollapsibleSectionProps) {
	const [isOpen, setIsOpen] = useState(defaultOpen);

	return (
		<Collapsible
			defaultOpen={defaultOpen}
			open={isOpen}
			onOpenChange={setIsOpen}
			className={cn(
				"mb-5 rounded-[16px] border border-gray-100 bg-white px-4 py-3 lg:px-6",
				collapseClassName,
				isOpen && "border-txt-primary"
			)}
		>
			<CollapsibleTrigger className="flex w-full items-center justify-between py-2">
				<span className={cn("flex-1 text-left font-inter text-base font-bold text-txt-primary", titleClassName)}>
					{title}
				</span>
				<div
					className={cn(
						"flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-secondary-foreground lg:h-8 lg:w-8",
						isOpen && "bg-primary text-primary-foreground"
					)}
				>
					<ChevronRight className={cn("h-6 w-6 transition-transform duration-200", isOpen && "rotate-90")} />
				</div>
			</CollapsibleTrigger>
			<CollapsibleContent>
				<div className="font-roboto text-base font-normal leading-6 text-txt-primary lg:text-base">{children}</div>
			</CollapsibleContent>
		</Collapsible>
	);
}
