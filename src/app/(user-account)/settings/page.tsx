import { routes } from "@/config/routes";
import { redirect } from "next/navigation";

export default function ProfileSettingsFormPage() {
	return redirect(routes.settings.profile);
}
