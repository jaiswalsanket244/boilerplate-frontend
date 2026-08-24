import SocketStoreManager from "@/lib/utils/socket-store-manager";
import type { ServerToClientEvents, TypedSocket } from "@/types/socket";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";

export const useSocket = () => {
	const queryClient = useQueryClient();
	const socketStore = SocketStoreManager.getInstance();

	const [socket, setSocket] = useState<TypedSocket | null>(null);
	const cleanupRef = useRef<(() => void) | null>(null);
	const eventCleanupRef = useRef<(() => void)[]>([]);

	const reinitializeSocket = useCallback(() => {
		const socketInstance = socketStore.reinitializeSocket();
		setSocket(socketInstance);
		return socketInstance;
	}, [socketStore]);

	const checkAndReinitializeSocket = useCallback(() => {
		if (!socketStore.isSocketHealthy()) {
			return reinitializeSocket();
		}
		return socket;
	}, [socketStore, socket, reinitializeSocket]);

	const addEventListener = useCallback(
		<K extends keyof ServerToClientEvents>(event: K, callback: ServerToClientEvents[K]) => {
			const cleanup = socketStore.addEventListener(event, callback);
			eventCleanupRef.current.push(cleanup);
			return cleanup;
		},
		[socketStore]
	);

	useEffect(() => {
		const socketInstance = socketStore.initializeSocket();
		setSocket(socketInstance);

		const healthCheckInterval = setInterval(() => {
			if (!socketStore.isSocketHealthy()) {
				reinitializeSocket();
			}
		}, 30000); // Check every 30 seconds

		const updateNotificationsCountCleanup = socketStore.addEventListener("update-notifications-count", () => {
			void queryClient.invalidateQueries({
				queryKey: ["notifications", "unread-count"],
			});
		});

		return () => {
			if (cleanupRef.current) {
				cleanupRef.current();
				cleanupRef.current = null;
			}

			// Clean up all event listeners
			eventCleanupRef.current.forEach((cleanup) => cleanup());
			eventCleanupRef.current = [];
			updateNotificationsCountCleanup();
			clearInterval(healthCheckInterval);
		};
	}, [setSocket, socketStore, reinitializeSocket]);

	// Handle visibility change to reinitialize when tab becomes active
	useEffect(() => {
		const handleVisibilityChange = () => {
			if (!document.hidden && !socketStore.isSocketHealthy()) {
				reinitializeSocket();
			}
		};

		document.addEventListener("visibilitychange", handleVisibilityChange);

		return () => {
			document.removeEventListener("visibilitychange", handleVisibilityChange);
		};
	}, [socketStore, reinitializeSocket]);

	return {
		socket,
		addEventListener,
		reinitializeSocket,
		checkAndReinitializeSocket,
		isSocketHealthy: socketStore.isSocketHealthy.bind(socketStore),
	};
};
