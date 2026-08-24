import React from "react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { IBreadcrumbProps } from "@/module/profile/types";

export function Breadcrumb({ items }: IBreadcrumbProps) {
	return (
		<nav className="mb-6 flex items-center space-x-2 text-xl text-txt-secondary-900">
			{items.map((item, index) => (
				<React.Fragment key={index}>
					{index > 0 && <ChevronRight className="size-5 text-txt-tertiary" />}
					{item.href ? (
						<Link href={item.href} className="transition-colors hover:text-txt-primary-900">
							{item.label}
						</Link>
					) : (
						<span className={index === items.length - 1 ? "text-xl font-bold text-txt-primary-900" : ""}>
							{item.label}
						</span>
					)}
				</React.Fragment>
			))}
		</nav>
	);
}
