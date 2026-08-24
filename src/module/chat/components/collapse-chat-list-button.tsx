import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

const CollapseChatListButton = ({
	handleClick,
	alignment,
}: {
	handleClick: () => void;
	alignment: "right" | "left";
}) => {
	return (
		<Button
			onClick={handleClick}
			variant={"ghost"}
			size={"icon"}
			className={cn(
				"absolute z-50 size-10 cursor-pointer p-0 hover:bg-transparent",
				alignment === "left" ? "top-38 -left-6" : "top-20 -right-[1.2rem]"
			)}
		>
			<Image src="/assets/svg/arrow_menu_close.svg" fill alt="logo" />
		</Button>
	);
};

export default CollapseChatListButton;
