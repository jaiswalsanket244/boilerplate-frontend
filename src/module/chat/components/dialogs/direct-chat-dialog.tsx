"use client";

import { debounce } from "lodash";
import { MessageSquare, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

import { Pagination, UsersList } from "@/module/chat/components/search-users-list";
import useChatAPI from "@/module/chat/hooks/useChatAPI";
import type { IChatUser, IDirectChatDialogProps, IGetChatUserFilter } from "@/module/chat/types";

const FILTER_LIMIT = 5;

const DirectChatDialog = ({ isOpen, setIsOpen, isError, isPending, onChange }: IDirectChatDialogProps) => {
	const [filter, setFilter] = useState<IGetChatUserFilter>({
		searchQuery: "",
		page: 1,
		limit: FILTER_LIMIT,
	});
	const [, setSelectedUserId] = useState<string | null>(null);

	const { useGetChatUsers } = useChatAPI();
	const { data: usersData, refetch, isLoading } = useGetChatUsers(filter);

	useEffect(() => {
		void refetch();
	}, [refetch]);

	const handleUserSelect = (user: IChatUser) => {
		setSelectedUserId(user?._id);
		onChange({
			userId: user?._id,
			userName: `${user?.name?.first} ${user?.name?.last}`,
		});
		setIsOpen(false);
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
	};

	const handlePageChange = (newPage: number) => {
		setFilter((prev) => ({ ...prev, page: newPage }));
	};

	const totalPages = Math.ceil(Number(usersData?.total) / FILTER_LIMIT);

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="max-h-[80vh]  max-w-[95%] rounded-md sm:max-w-2xl">
				<DialogHeader className="space-y-3">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="flex size-10 items-center justify-center rounded-lg bg-blue-50 p-2">
								<MessageSquare className="h-5 w-5 text-blue-700" />
							</div>

							<DialogTitle className="text-xl font-bold text-txt-primary-900">Create new chat</DialogTitle>
						</div>
					</div>
					<Separator />
				</DialogHeader>

				<div className="w-full space-y-4">
					{/* Search Input */}
					<div className="relative w-full">
						<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-txt-tertiary" />

						<Input
							placeholder="Search users by name..."
							onChange={handleInputChange}
							className="h-10 border-border bg-input/60 pl-10 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					<div className="overflow-hidden">
						<UsersList
							items={usersData?.items || []}
							selectedUsers={[]}
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
			</DialogContent>
		</Dialog>
	);
};

export default DirectChatDialog;
