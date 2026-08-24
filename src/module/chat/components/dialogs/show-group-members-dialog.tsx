import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import ChatAvatar from "@/module/chat/components/chat-avatar";
import UploadGroupChatAvatar from "@/module/chat/components/upload-group-chat-avatar";
import { useStreamChat } from "@/module/chat/hooks/useStreamChat";
import type { IShowGroupMembersDialogProps } from "@/module/chat/types";
import { format } from "date-fns";
import { Pencil, UserMinus } from "lucide-react";
import { useState } from "react";
import { FiPlus } from "react-icons/fi";

const Header = ({ setIsOpen }: { setIsOpen: IShowGroupMembersDialogProps["setIsOpen"] }) => {
	const { channel, updateGroupInfo } = useStreamChat();

	const [isEditingGroupInfo, setIsEditingGroupInfo] = useState(false);
	const [groupData, setGroupData] = useState({
		groupName: channel?.data?.name ?? "",
		avatar: channel?.data?.avatar ?? "",
	});
	const [errors, setErrors] = useState({
		rename: "",
		groupName: "",
	});

	const handleUpdateGroup = async () => {
		if (!groupData.groupName && groupData.groupName.trim().length === 0) {
			setErrors((prev) => ({ ...prev, groupName: "Group name cannot be empty" }));
			return;
		}
		try {
			await updateGroupInfo(String(channel?.id), {
				name: groupData.groupName,
				avatar: groupData.avatar,
			});
			setIsOpen(false);
		} catch (error) {
			setErrors((prev) => ({ ...prev, rename: "Failed to rename group. Try again" }));
		} finally {
			setIsEditingGroupInfo(false);
		}
	};

	return (
		<DialogHeader className="flex">
			{isEditingGroupInfo && (
				<div className="flex items-center gap-4">
					<UploadGroupChatAvatar
						avatar={groupData?.avatar}
						onAvatarChange={(avatar) => {
							void updateGroupInfo(String(channel?.id), { avatar: avatar ?? "" });

							setGroupData((prev) => ({ ...prev, avatar: avatar ?? "" }));
						}}
						size="md"
					/>
					<div className="flex-1">
						<Input
							value={groupData.groupName}
							onChange={(e) =>
								setGroupData({
									...groupData,
									groupName: e.target.value,
								})
							}
							required
							placeholder="Enter Group Name"
							className="text-txt-primary mt-3"
							data-testid="group-name-input"
						/>
						{errors.groupName && <p className="text-sm text-red-500">{errors.groupName}</p>}

						<div className="mt-2 flex items-center justify-end gap-2">
							<Button
								variant="outline"
								onClick={() => {
									setIsEditingGroupInfo(false);
								}}
								className="h-8 rounded-md p-[10px]"
								data-testid="cancel-button"
							>
								Cancel
							</Button>
							<Button
								disabled={groupData.groupName?.trim().length === 0}
								onClick={() => void handleUpdateGroup()}
								className="h-8 rounded-md bg-linear-to-r p-[10px]"
								data-testid="rename-group-button"
							>
								Confirm
							</Button>
						</div>
					</div>
				</div>
			)}
			{!isEditingGroupInfo && (
				<div className="flex items-center gap-4">
					<UploadGroupChatAvatar
						avatar={channel?.data?.avatar}
						onAvatarChange={(avatar) => setGroupData((prev) => ({ ...prev, avatar: avatar ?? "" }))}
						size="md"
					/>
					<div className="space-y-1">
						<DialogTitle className="text-lg font-semibold">
							{channel?.data?.name}

							<Button
								variant="ghost"
								size="icon"
								className="rounded-full"
								onClick={() => setIsEditingGroupInfo(true)}
								data-testid="rename-group-button"
							>
								<Pencil className="size-2" />
							</Button>
						</DialogTitle>
						{errors.rename && (
							<p data-testid="rename-error" className="text-sm text-red-500">
								{errors.rename}
							</p>
						)}
					</div>
				</div>
			)}
		</DialogHeader>
	);
};

const ShowGroupMembersDialog = ({
	isOpen,
	setIsOpen,
	setIsSelectMemberDialogOpen,
	handleRemoveMember,
}: IShowGroupMembersDialogProps) => {
	const { client, members, channel } = useStreamChat();

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogContent className="max-w-md">
				<Header setIsOpen={setIsOpen} />

				<div className="mt-4 flex items-center justify-between">
					<p>Members</p>
					<Button
						variant="outline"
						size="sm"
						onClick={() => {
							setIsOpen(false);
							setTimeout(() => setIsSelectMemberDialogOpen(true), 200);
						}}
						data-testid="add-member-button"
					>
						<FiPlus className="mr-2 h-4 w-4" />
						Add Member
					</Button>
				</div>
				<ScrollArea className="max-h-96">
					<div className="space-y-1">
						{members.map((m, index) => {
							const isYou = client.userID === m.user?.id;
							return (
								<div key={m.user?.id}>
									<div
										className={`flex items-center justify-between rounded-lg p-3 transition-colors ${
											isYou ? "bg-primary/10" : "hover:bg-accent/50"
										}`}
									>
										<div className="flex items-center gap-3">
											<div className="relative">
												<ChatAvatar />
											</div>
											<div className="flex flex-col">
												<div className="flex items-center gap-2">
													<span className={`text-sm ${isYou ? "font-semibold" : "font-medium"}`}>{m.user?.name}</span>
													{isYou && (
														<Badge variant="secondary" className="text-xs">
															You
														</Badge>
													)}
												</div>
												<div className="mt-1 flex items-center gap-1">
													<div className={`h-2 w-2 rounded-full ${m.user?.online ? "bg-green" : "bg-gray-400"}`}></div>
													<span className="text-muted-foreground text-xs">{m.user?.online ? "Online" : "Offline"}</span>
												</div>
											</div>
										</div>

										{!isYou && (
											<Button
												data-testid="remove-member-button"
												variant="ghost"
												size="icon"
												className="h-8 w-8"
												onClick={() =>
													handleRemoveMember({
														channelId: String(channel?.id),
														userId: String(m?.user?.id),
													})
												}
											>
												<UserMinus />
											</Button>
										)}
									</div>
									{index < members.length - 1 && <Separator className="my-1" />}
								</div>
							);
						})}
					</div>
				</ScrollArea>

				<div className="mt-4 space-y-1">
					<p>
						<strong>Created on</strong> :{" "}
						{channel.data?.created_at ? format(new Date(channel.data.created_at), "dd/MM/yyyy") : "N/A"}
					</p>
					<p>
						<strong>Created by</strong> : {channel.data?.created_by?.name}
					</p>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default ShowGroupMembersDialog;
