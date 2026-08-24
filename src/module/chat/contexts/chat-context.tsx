"use client";
import { useIsMobile } from "@/hooks/use-mobile";
import React, { createContext, useContext, useState, type ReactNode } from "react";
import { CHAT_PAGE_ACTIVE_VIEW } from "@/module/chat/types";

type TChatContext = {
	showMessageList: boolean;
	setShowMessageList: React.Dispatch<React.SetStateAction<boolean>>;
	isChannelListCollapsed: boolean;
	setIsChannelListCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
	isMobile: boolean;
	activeView: CHAT_PAGE_ACTIVE_VIEW;
	setActiveView: React.Dispatch<React.SetStateAction<CHAT_PAGE_ACTIVE_VIEW>>;
};

const ChatContext = createContext<TChatContext | undefined>(undefined);

export const ChatContextProvider = ({ children }: { children: ReactNode }) => {
	const [showMessageList, setShowMessageList] = useState(false);
	const [isChannelListCollapsed, setIsChannelListCollapsed] = useState(false);
	const [activeView, setActiveView] = useState<CHAT_PAGE_ACTIVE_VIEW>(CHAT_PAGE_ACTIVE_VIEW.MESSAGING);
	const isMobile = useIsMobile();

	return (
		<ChatContext.Provider
			value={{
				showMessageList,
				setShowMessageList,
				isMobile,
				isChannelListCollapsed,
				setIsChannelListCollapsed,
				activeView,
				setActiveView,
			}}
		>
			{children}
		</ChatContext.Provider>
	);
};

export const useAppChatContext = () => {
	const context = useContext(ChatContext);
	if (!context) {
		throw new Error("useAppChatContext must be used within a ChatContextProvider");
	}
	return context;
};
