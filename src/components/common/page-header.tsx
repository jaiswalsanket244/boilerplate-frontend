import { cn } from "@/lib/utils/class-names";

export type PageHeaderTypes = {
	title: string;
	className?: string;
};

export default function PageHeader({ title, children, className }: React.PropsWithChildren<PageHeaderTypes>) {
	return (
		<header className={cn("border-r border-[#10101014]", className)}>
			<div>
				<p className="m-0 text-2xl font-semibold">{title}</p>
			</div>
			{children}
		</header>
	);
}
