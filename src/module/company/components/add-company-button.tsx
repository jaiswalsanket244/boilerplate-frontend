import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { isSuperAdminUser } from "@/lib/utils/access-check";
import Link from "next/link";
import { PiPlusBold } from "react-icons/pi";

export default function AddCompanyButton() {
	return (
		<div className="mt-4 flex items-center gap-3 @lg:mt-0">
			{isSuperAdminUser() && (
				<Link href={routes.superAdmin.companies.invite} className="w-full @lg:w-auto">
					<Button className="bg-gray-900 text-white hover:bg-gray-900 hover:text-white">
						<PiPlusBold className="me-1.5 h-[17px] w-[17px]" />
						Add Company
					</Button>
				</Link>
			)}
		</div>
	);
}
