import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import CardList from "@/module/cards/components/card-list";
import Link from "next/link";
import { PiPlusBold } from "react-icons/pi";

function CardManagement() {
	return (
		<div>
			<div className="items-centre mb-6 flex justify-between">
				<h1 className="text-3xl font-semibold">Cards</h1>
				<div className="items-centre mt-4 flex gap-3 @lg:mt-0">
					<Link href={routes.cards.add} className="w-full @lg:w-auto">
						<Button className="w-full @lg:w-auto dark:bg-gray-100 dark:text-white dark:active:bg-gray-100">
							<PiPlusBold className="me-1.5 h-[17px] w-[17px]" />
							Add Card
						</Button>
					</Link>
				</div>
			</div>
			<CardList />
		</div>
	);
}

export default CardManagement;
