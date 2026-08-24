import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getUserCookies } from "@/lib/utils/cookies";
import ChatAvatar from "@/module/chat/components/chat-avatar";
import CreateGroupChatDialog from "@/module/chat/components/dialogs/create-group-chat-dialog";
import DirectChatDialog from "@/module/chat/components/dialogs/direct-chat-dialog";
import { useAppChatContext } from "@/module/chat/contexts/chat-context";
import useChatAPI from "@/module/chat/hooks/useChatAPI";
import { formatChannelData } from "@/module/chat/utils/helpers";
import { debounce } from "lodash";
import { Loader2, MessageCircle, Search, Users } from "lucide-react";
import { useState } from "react";
import { MdOutlineGroupAdd } from "react-icons/md";
import { type ChannelFilters } from "stream-chat";
import { useChatContext } from "stream-chat-react";

const CustomChannelSearch = () => {
	const { client, setActiveChannel } = useChatContext();
	const { useCreateDirectChat } = useChatAPI();
	const { setShowMessageList } = useAppChatContext();

	const { userRef: userId } = getUserCookies();

	const [searchTerm, setSearchTerm] = useState("");
	const [searchResults, setSearchResults] = useState<
		({ name: string; id: string | undefined; avatarUrl: string | undefined } | null)[]
	>([]);
	const [isDirectChatDialogOpen, setIsDirectChatDialogOpen] = useState<boolean>(false);
	const [isGroupDialogOpen, setIsGroupDialogOpen] = useState<boolean>(false);
	const [isSearchVisible, setIsSearchVisible] = useState(false);
	const [loading, setLoading] = useState(false);

	const handleSearch = debounce(async (value: string) => {
		if (!value) {
			setSearchResults([]);
			setIsSearchVisible(false);
			return;
		}

		setLoading(true);
		setIsSearchVisible(true);
		try {
			const filters: ChannelFilters = userId
				? {
						type: "messaging",
						members: { $in: [String(userId)] },
						frozen: false,
						name: { $autocomplete: value },
					}
				: {};

			const channels = await client.queryChannels(filters);

			const filteredChannels = channels
				.map((channel) => {
					const { name, avatarUrl } = formatChannelData(channel, client?.userID as string);

					return {
						name,
						id: channel.id,
						avatarUrl: avatarUrl || undefined,
					};
				})
				.filter(Boolean);

			setSearchResults(filteredChannels);
		} catch (error) {
			console.error("Error searching channels:", error);
		}
		setLoading(false);
	}, 500);
	const handleSelectChannel = async (channelId: string) => {
		const newChannel = client?.channel("messaging", channelId);
		setActiveChannel?.(newChannel);
		await newChannel.watch({ presence: true });
		setIsSearchVisible(false);
		setSearchTerm("");
		setShowMessageList(true);
	};

	const startDirectChat = ({ userName, userId }: { userId: string; userName: string }) => {
		useCreateDirectChat.mutate(
			{ recipientUserId: userId, recipientUserName: userName },
			{
				onSuccess: (data) => {
					const newChannel = client.channel("messaging", data?.data?.channelId);

					void newChannel?.watch({ presence: true });
					setActiveChannel?.(newChannel);
				},
			}
		);
	};

	return (
		<>
			<div className="bg-background w-full">
				{/* Search Input Section */}
				<div className="flex h-18 w-full items-center gap-4 p-4">
					<div className="relative grow">
						<Search className="text-txt-primary absolute top-1/2 left-3 size-4 -translate-y-1/2 transform" />
						<Input
							data-testid="channel-search-input"
							placeholder="Search channels..."
							value={searchTerm}
							onChange={(e) => {
								const value = e.target.value.toLowerCase();
								setSearchTerm(value);
								void handleSearch(value);
							}}
							className="border-border bg-muted/80 h-10 overflow-hidden rounded-3xl pr-4 pl-10 focus-within:ring-0 focus:border-transparent focus-visible:ring-0 md:pr-12"
						/>
						{loading && (
							<Loader2 className="text-txt-tertiary absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 transform animate-spin" />
						)}
					</div>

					<DropdownMenu>
						<DropdownMenuTrigger asChild data-testid="create-channel-trigger">
							<button className="flex size-10 shrink-0 items-center justify-center rounded-full p-0">
								<MdOutlineGroupAdd className="text-txt-primary size-6" />
							</button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={() => setIsDirectChatDialogOpen(true)} data-testid="create-direct-chat">
								<MessageCircle className="mr-2 h-4 w-4" />
								New Chat
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setIsGroupDialogOpen(true)} data-testid="create-group-chat">
								<Users className="mr-2 h-4 w-4" />
								New Group
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				{/* Search Results */}
				{isSearchVisible && (
					<div className="absolute inset-0 top-18 z-50 border-t bg-white">
						<ScrollArea className="h-[65vh]">
							{searchResults.length === 0 && searchTerm && !loading && (
								<div className="flex h-full flex-col items-center justify-center p-8 text-center">
									<div className="mb-4 rounded-full bg-gray-50 p-4">
										<MessageCircle className="text-txt-tertiary h-8 w-8" />
									</div>
									<p className="text-txt-secondary-800 mb-4 text-sm">No channels found</p>
									<p className="text-txt-tertiary max-w-xs text-xs">
										Try searching with a different term or check if the channel exists.
									</p>
								</div>
							)}

							<div className="space-y-1 p-2">
								{searchResults.map((channel) => (
									<Button
										key={channel?.id}
										variant="ghost"
										className="h-auto w-full justify-start p-3 transition-colors duration-150 hover:bg-gray-50"
										onClick={() => void handleSelectChannel(String(channel?.id))}
									>
										<div className="flex w-full items-center gap-3">
											<ChatAvatar className="size-10" avatarUrl={channel?.avatarUrl} />

											<div className="min-w-0 flex-1 text-left">
												<div className="flex items-center justify-between gap-2">
													<p className="text-txt-primary truncate text-sm font-medium">
														{channel?.name || "Unnamed Channel"}
													</p>
													<Users className="text-txt-tertiary h-3 w-3 shrink-0" />
												</div>
												<p className="text-txt-secondary-800 mt-1 text-xs">Channel • Click to open</p>
											</div>
										</div>
									</Button>
								))}
							</div>
						</ScrollArea>
					</div>
				)}
			</div>

			<DirectChatDialog
				onChange={startDirectChat}
				isOpen={isDirectChatDialogOpen}
				setIsOpen={setIsDirectChatDialogOpen}
			/>

			<CreateGroupChatDialog isOpen={isGroupDialogOpen} setIsOpen={setIsGroupDialogOpen} />
		</>
	);
};

export default CustomChannelSearch;
