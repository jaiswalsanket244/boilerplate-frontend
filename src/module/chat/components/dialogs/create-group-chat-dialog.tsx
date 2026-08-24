"use client";

import { debounce } from "lodash";
import { Info, Loader, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";
import { Pagination, UsersList } from "@/module/chat/components/search-users-list";
import UploadGroupChatAvatar from "@/module/chat/components/upload-group-chat-avatar";
import useChatAPI from "@/module/chat/hooks/useChatAPI";
import { useChatDraft } from "@/module/chat/hooks/useChatDraft";
import type { IChatUser, ICreateGroupChatDialogProps, ICreateGroupData, IGetChatUserFilter } from "@/module/chat/types";
import { useChatContext } from "stream-chat-react";

const FILTER_LIMIT = 5;
const DRAFT_KEY = "create-group-draft";

const formInitialValues = {
	groupName: "",
	selectedMembers: [],
	avatar: null,
};

const CreateGroupChatDialog = ({ isOpen, setIsOpen }: ICreateGroupChatDialogProps) => {
	const { useGetChatUsers, useCreateGroupChat, useRemoveChatFile } = useChatAPI();

	const [filter, setFilter] = useState<IGetChatUserFilter>({
		searchQuery: "",
		page: 1,
		limit: FILTER_LIMIT,
	});
	const [errors, setErrors] = useState({
		groupName: "",
		createGroup: "",
	});
	const {
		draft: groupData,
		setDraft: setGroupData,
		clearDraft,
	} = useChatDraft<ICreateGroupData>({
		key: DRAFT_KEY,
		initialValue: formInitialValues,
	});

	const { client, setActiveChannel } = useChatContext();
	const { data: usersData, refetch, isLoading } = useGetChatUsers(filter);

	useEffect(() => {
		void refetch();
	}, [refetch]);

	const handleCreateGroupChat = () => {
		if (!groupData.groupName?.trim()) {
			setErrors((prev) => ({
				...prev,
				groupName: "Group name cannot be empty",
			}));
			return;
		}
		useCreateGroupChat.mutate(groupData, {
			onSuccess: (data) => {
				const newChannel = client.channel("messaging", data?.data.channelId);
				void newChannel?.watch({ presence: true });
				setActiveChannel?.(newChannel);

				handleClose();
			},
			onError: (err) => {
				setErrors((prev) => ({
					...prev,
					createGroup: err?.response?.data?.message || "Failed to create a group!",
				}));
			},
		});
	};

	const handleUserSelect = (user: IChatUser) => {
		setGroupData((prev) => {
			const existingUser = prev.selectedMembers.find((member) => member.userId === user?._id);

			if (existingUser) {
				return {
					...prev,
					selectedMembers: prev.selectedMembers.filter((member) => member.userId !== user?._id),
				};
			}

			return {
				...prev,
				selectedMembers: [
					...prev.selectedMembers,
					{ userId: user?._id, userName: `${user?.name?.first} ${user?.name?.last}` },
				],
			};
		});
	};

	const debouncedSearch = useCallback(
		debounce((searchText: string) => {
			setFilter((prev) => ({
				...prev,
				searchQuery: searchText,
				page: 1,
			}));
		}, 400),
		[]
	);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		debouncedSearch(e.target.value);
	};

	const handleClose = () => {
		setFilter({ searchQuery: "", page: 1, limit: FILTER_LIMIT });
		setIsOpen(false);
		setGroupData(formInitialValues);
		clearDraft();

		if (groupData.avatar) useRemoveChatFile.mutate({ url: groupData.avatar });
	};
	const handlePageChange = (newPage: number) => {
		setFilter((prev) => ({ ...prev, page: newPage }));
	};

	const totalPages = Math.ceil(Number(usersData?.total) / FILTER_LIMIT);

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogContent className="max-h-[80vh] max-w-[95%] overflow-y-auto rounded-md border-none p-0 px-3 py-2 sm:max-w-xl">
				<h2 className="text-txt-primary mb-5 text-center text-lg font-semibold">New Group</h2>

				<div className="space-y-4 px-4 pb-4">
					{/* Group Name Section */}
					<div className="flex items-center gap-3">
						<UploadGroupChatAvatar
							onAvatarChange={(avatar) => setGroupData((prev) => ({ ...prev, avatar }))}
							avatar={groupData.avatar}
						/>
						<div className="flex-1 space-y-2">
							<Input
								id="groupName"
								value={groupData.groupName}
								onChange={(e) => setGroupData((prev) => ({ ...prev, groupName: e.target.value }))}
								required
								placeholder="Group Name"
								className="bg-muted h-9 w-full rounded-md border-0 px-3 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
							/>
							{errors.groupName && (
								<p className="flex items-center text-sm text-red-500">
									<Info className="mr-2 size-4" /> {errors.groupName}
								</p>
							)}
						</div>
					</div>

					{/* Add Members Section */}
					<div className="border-foreground/20 space-y-3 overflow-hidden rounded-lg border p-3 pb-0">
						<p className="text-txt-secondary text-sm font-medium">Add Members</p>

						{/* Search Input */}
						<div className="relative">
							<Search className="text-txt-tertiary absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
							<Input
								value={filter.searchQuery}
								placeholder="Search users by name"
								onChange={handleInputChange}
								className="bg-muted h-10 w-full rounded-md border-0 pr-3 pl-10 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
							/>
						</div>

						{/* Users List */}
						<div className="overflow-hidden">
							<UsersList
								items={usersData?.items || []}
								selectedUsers={groupData.selectedMembers}
								handleUserSelect={handleUserSelect}
								isLoading={isLoading}
							/>

							{/* Pagination */}
							{usersData && Number(usersData?.items?.length) > 0 && Number(usersData?.total) > 1 && (
								<Pagination
									page={usersData.page}
									totalPages={totalPages}
									handlePageChange={handlePageChange}
									pageSize={usersData.pageSize}
								/>
							)}
						</div>
					</div>

					{/* Action Buttons */}
					<div className="w-full">
						{errors.createGroup && <p className="text-right text-sm text-red-500">{errors.createGroup}</p>}
						<div className="flex items-center justify-end gap-2 pt-2">
							<Button className="rounded-lg px-4 py-2 font-medium" onClick={handleClose} variant={"ghost"}>
								Cancel
							</Button>
							<Button
								onClick={handleCreateGroupChat}
								disabled={groupData.selectedMembers.length < 2 || !groupData.groupName.trim() || isLoading}
								className="flex items-center gap-2 rounded-md px-6 py-2 font-medium text-white"
							>
								{useCreateGroupChat.isPending ? (
									<>
										<Loader className="h-4 w-4 animate-spin" />
										Creating...
									</>
								) : (
									"Create Group"
								)}
							</Button>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default CreateGroupChatDialog;
