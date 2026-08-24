"use client";

import { Check, ChevronLeft, ChevronRight, Loader, Users } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatAvatar from "@/module/chat/components/chat-avatar";
import type { IChatUsersListProps, IUserSearchDialogPaginationProps } from "@/module/chat/types";
import { Button } from "@/components/ui/button";

export const Pagination = ({ page, totalPages, handlePageChange, pageSize }: IUserSearchDialogPaginationProps) => {
	return (
		<div className="border-border bg-background flex items-center justify-between border-t px-4 py-2">
			<p className="text-txt-secondary/90 text-xs">
				Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalPages)} of {totalPages}
			</p>
			<div className="flex items-center gap-1">
				<Button
					onClick={() => handlePageChange(page - 1)}
					disabled={page === 1}
					variant={"ghost"}
					className="hover:bg-muted flex h-7 w-7 items-center justify-center rounded p-0 disabled:opacity-50"
				>
					<ChevronLeft className="h-3 w-3" />
				</Button>
				<span className="text-txt-secondary/90 px-2 text-xs">
					{page} of {totalPages}
				</span>
				<Button
					onClick={() => handlePageChange(page + 1)}
					disabled={page === totalPages}
					variant={"ghost"}
					className="hover:bg-muted flex h-7 w-7 items-center justify-center rounded p-0 disabled:opacity-50"
				>
					<ChevronRight className="h-3 w-3" />
				</Button>
			</div>
		</div>
	);
};

export const UsersList = ({ items, handleUserSelect, selectedUsers, isLoading }: IChatUsersListProps) => {
	if (isLoading) {
		return (
			<div className="flex h-64 w-full items-center justify-center">
				<Loader className="size-5 animate-spin" />
			</div>
		);
	}

	if (items?.length === 0) {
		return (
			<div className="flex h-64 flex-col items-center justify-center p-8 text-center">
				<div className="bg-muted mb-4 rounded-full p-4">
					<Users className="text-txt-tertiary h-8 w-8" />
				</div>
				<h3 className="text-txt-primary mb-2 text-lg font-semibold">No users found</h3>
				<p className="text-txt-secondary/50 max-w-xs text-sm">
					Try adjusting your search term or check if there are any users available.
				</p>
			</div>
		);
	}

	return (
		<ScrollArea className="h-64">
			<div className="space-y-2 pr-4 pb-4">
				{items.map((user) => {
					const isSelected = selectedUsers.some((selectedUser) => selectedUser.userId === user._id);

					return (
						<div
							key={user._id}
							onClick={() => handleUserSelect(user)}
							className={`flex cursor-pointer items-center gap-3 rounded-lg p-1 transition-colors ${
								isSelected ? "bg-muted shadow-xs" : ""
							}`}
						>
							<div className="relative">
								<ChatAvatar className="size-9" />
								{isSelected && (
									<div className="absolute -right-1 -bottom-0.5 flex size-4 items-center justify-center rounded-full bg-white">
										<Check className="size-3 text-black" />
									</div>
								)}
							</div>
							<div className="min-w-0 flex-1">
								<p className="text-txt-primary max-w-40 truncate text-sm font-medium">
									{user.name.first} {user.name.last}
								</p>
							</div>
						</div>
					);
				})}
			</div>
		</ScrollArea>
	);
};
