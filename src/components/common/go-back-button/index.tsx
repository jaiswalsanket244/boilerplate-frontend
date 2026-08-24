import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/class-names";

interface GoBackButtonProps {
	onClick?: () => void;
	label?: string;
	className?: string;
}

const GoBackButton = ({ onClick, label = "Go Back", className = "" }: GoBackButtonProps) => {
	return (
		<Button
			type="button"
			variant="plain"
			onClick={onClick}
			className={cn("px-0 text-base font-medium leading-6 text-gray-700", className)}
			data-testid="go-back-button"
		>
			<ArrowLeft size={20} />
			{label}
		</Button>
	);
};

export default GoBackButton;
