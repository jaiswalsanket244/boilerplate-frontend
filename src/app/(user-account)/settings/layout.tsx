import { getUserCookies } from "@/lib/utils/cookies";
import SettingsTabs from "@/module/profile/components/setting-tabs";

export default function ProfileSettingsLayout({ children }: { children: React.ReactNode }) {
	const { userType } = getUserCookies();

	return (
		<div className="flex w-full flex-col overflow-hidden p-3 md:max-h-[calc(100vh-110px)] md:flex-row md:p-6">
			<SettingsTabs role={userType} />
			<div className="h-full flex-1 overflow-y-auto px-6">{children}</div>
		</div>
	);
}
