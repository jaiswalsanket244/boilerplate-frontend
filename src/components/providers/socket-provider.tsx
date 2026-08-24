"use client";

import React, { createContext, useContext, useMemo } from "react";
import { useSocket } from "@/hooks/use-socket"; // adjust the import path
import type { TypedSocket } from "@/types/socket";

interface SocketContextValue {
	socket: TypedSocket | null;
	addEventListener: ReturnType<typeof useSocket>["addEventListener"];
	reinitializeSocket: ReturnType<typeof useSocket>["reinitializeSocket"];
	checkAndReinitializeSocket: ReturnType<typeof useSocket>["checkAndReinitializeSocket"];
	isSocketHealthy: () => boolean;
}

/**
 * Create the context with a default empty value.
 * We'll throw if a component tries to use it outside the provider.
 */
const SocketContext = createContext<SocketContextValue | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const socketState = useSocket();

	// useMemo ensures stable reference and avoids re-renders
	const value = useMemo(
		() => ({
			socket: socketState.socket,
			addEventListener: socketState.addEventListener,
			reinitializeSocket: socketState.reinitializeSocket,
			checkAndReinitializeSocket: socketState.checkAndReinitializeSocket,
			isSocketHealthy: socketState.isSocketHealthy,
		}),
		[socketState]
	);

	return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

/**
 * Hook to access the socket context.
 * Ensures it's used inside the provider.
 */
export const useSocketContext = (): SocketContextValue => {
	const context = useContext(SocketContext);
	if (!context) {
		throw new Error("useSocketContext must be used within a SocketProvider");
	}
	return context;
};
