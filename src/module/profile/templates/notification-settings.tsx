"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useProfileAPI } from "@/module/profile/hooks/useProfile";
import { type IUserNotificationPreference, NOTIFICATION_CHANNELS, NOTIFICATION_TYPES } from "@/module/profile/types";
import { Loader2 } from "lucide-react";
import { getDefaultNotificationPreferences } from "@/module/profile/utils/helpers";

const notificationSettings = [
	{
		type: NOTIFICATION_TYPES.PROFILE_AND_PASSWORD,
		label: "Profile and password updates",
		description: "Receive notifications about your profile updates and password changes.",
		channel: NOTIFICATION_CHANNELS.PUSH,
	},
	{
		type: NOTIFICATION_TYPES.CHAT_MESSAGE,
		label: "Chat messages",
		description: "Receive instant push notifications for chat messages.",
		channel: NOTIFICATION_CHANNELS.PUSH,
	},
];

const NotificationSettings = () => {
	const { useGetNotificationPreferences, useUpdateNotificationPreferences } = useProfileAPI();

	const { data: preferences, isLoading, refetch } = useGetNotificationPreferences();
	const updateMutation = useUpdateNotificationPreferences();

	const [localPrefs, setLocalPrefs] = useState<IUserNotificationPreference["preferences"]>(
		getDefaultNotificationPreferences()
	);

	useEffect(() => {
		if (preferences) {
			setLocalPrefs(preferences["preferences"] || getDefaultNotificationPreferences());
		}
	}, [preferences]);

	const handleToggle = (type: NOTIFICATION_TYPES, channel: NOTIFICATION_CHANNELS) => {
		if (updateMutation.isPending) return;

		const newValue = !localPrefs?.[type]?.[channel];

		setLocalPrefs((prev) => ({
			...prev,
			[type]: {
				...prev?.[type],
				[channel]: newValue,
			},
		}));

		updateMutation.mutate(
			{
				type,
				channels: { [channel]: newValue },
			},
			{
				onSuccess: () => {
					void refetch();
				},
				onError: () => {
					setLocalPrefs((prev) => ({
						...prev,
						[type]: {
							...prev?.[type],
							[channel]: !newValue,
						},
					}));
				},
			}
		);
	};

	if (isLoading) {
		return (
			<div className="flex h-40 items-center justify-center">
				<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="mx-auto h-full max-w-4xl flex-1 overflow-y-auto pb-10 pr-5">
			<div className="mb-6">
				<h1 className="text-xl font-semibold text-txt-primary-900">Notification Settings</h1>
			</div>

			<div className="flex flex-col space-y-1.5 p-6 pl-0 pt-0">
				<h3 className="text-text-primary-900 text-lg font-semibold">Push Notification Preferences</h3>
				<p className="text-sm text-txt-secondary-700">Manage alerts sent directly to your browser or mobile app.</p>
			</div>

			<Card className="bg-muted/60 p-6 pb-0">
				<CardContent className="space-y-6 pb-0">
					{notificationSettings.map((item, index) => (
						<div key={item.type}>
							<div className="flex items-start justify-between gap-4 pb-6">
								<div className="flex-1">
									<h3 className="text-sm font-medium text-txt-primary">{item.label}</h3>
									<p className="mt-0.5 text-sm text-txt-secondary-600">{item.description}</p>
								</div>
								<Switch
									className="mt-1"
									checked={!!localPrefs?.[item.type]?.[item.channel]}
									onCheckedChange={() => handleToggle(item.type, item.channel)}
								/>
							</div>

							{index < notificationSettings.length - 1 && <Separator />}
						</div>
					))}
				</CardContent>
			</Card>
		</div>
	);
};

export default NotificationSettings;
