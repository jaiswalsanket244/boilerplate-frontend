import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import React from "react";
import { IoPersonSharp } from "react-icons/io5";

const ChatAvatar = ({ avatarUrl, className, size }: { avatarUrl?: string; className?: string; size?: number }) => {
	return (
		<Avatar data-testid="chat-avatar" className={cn("size-12", className)}>
			<AvatarImage src={avatarUrl} />
			<AvatarFallback className="bg-chat-purple flex items-center justify-center rounded-full text-sm font-semibold text-white">
				<IoPersonSharp size={size ?? 20} />
			</AvatarFallback>
		</Avatar>
	);
};

export default ChatAvatar;
