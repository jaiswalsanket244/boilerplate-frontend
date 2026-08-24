import { env } from "@/env.mjs";
import { getUserCookies } from "@/lib/utils/cookies";
import type { ServerToClientEvents, TEventCallbacks, TypedSocket } from "@/types/socket";
import { io } from "socket.io-client";

// Socket configuration
const SOCKET_CONFIG = {
	reconnectionAttempts: 5,
	reconnectionDelay: 1000,
	withCredentials: true,
	auth: {
		userId: getUserCookies().userRef,
	},
} as const;

const createTypedSocket = (url: string, config: object): TypedSocket => {
	return io(url, config) as TypedSocket;
};

class SocketStoreManager {
	private static instance: SocketStoreManager;
	private socketInstance: TypedSocket | null = null;
	private isInitialized = false;

	private eventCallbacks: TEventCallbacks = {};

	static getInstance(): SocketStoreManager {
		if (!SocketStoreManager.instance) {
			SocketStoreManager.instance = new SocketStoreManager();
		}
		return SocketStoreManager.instance;
	}

	/**
	 * Add an event callback for a specific socket event
	 */
	public addEventListener<K extends keyof ServerToClientEvents>(
		event: K,
		callback: ServerToClientEvents[K]
	): () => void {
		if (!this.eventCallbacks[event]) {
			this.eventCallbacks[event] = [];
		}
		this.eventCallbacks[event].push(callback);

		// Return cleanup function
		return () => {
			this.removeEventListener(event, callback);
		};
	}

	/**
	 * Remove a specific event callback
	 */
	public removeEventListener<K extends keyof ServerToClientEvents>(event: K, callback: ServerToClientEvents[K]): void {
		if (this.eventCallbacks[event]) {
			const index = this.eventCallbacks[event].indexOf(callback);
			if (index > -1) {
				this.eventCallbacks[event].splice(index, 1);
			}
		}
	}

	/**
	 * Execute all callbacks for a specific event
	 */
	private executeEventCallbacks<K extends keyof ServerToClientEvents>(
		event: K,
		...args: Parameters<ServerToClientEvents[K]>
	): void {
		const callbacks = this.eventCallbacks[event];
		if (callbacks) {
			callbacks.forEach((callback) => {
				try {
					// @ts-ignore - TypeScript struggles with the dynamic nature of this call
					callback(...args);
				} catch (error) {
					console.error(`Error executing callback for event ${event}:`, error);
				}
			});
		}
	}

	private setupSocketEventListeners(socket: TypedSocket): void {
		socket.on("connect", () => {
			this.executeEventCallbacks("connect");
		});

		socket.on("disconnect", () => {
			this.executeEventCallbacks("disconnect");
		});

		socket.on("update-notifications-count", () => {
			this.executeEventCallbacks("update-notifications-count");
		});
	}

	public initializeSocket(): TypedSocket | null {
		if (!this.isInitialized && !this.socketInstance) {
			try {
				this.socketInstance = createTypedSocket(env.NEXT_PUBLIC_WSS_ENDPOINT, SOCKET_CONFIG);
				this.setupSocketEventListeners(this.socketInstance);
				this.isInitialized = true;
			} catch (error) {
				console.error("Failed to initialize socket:", error);
				return null;
			}
		}
		return this.socketInstance;
	}

	/**
	 * Reinitializes the socket connection if it doesn't exist or is disconnected
	 * @returns The socket instance or null if initialization fails
	 */
	public reinitializeSocket(): TypedSocket | null {
		try {
			// Check if socket exists and is connected
			const needsReinit = !this.socketInstance || !this.socketInstance.connected || !this.socketInstance.id;

			if (needsReinit) {
				// Clean up existing socket if it exists
				if (this.socketInstance) {
					this.cleanup();
				}

				// Reset state
				this.isInitialized = false;

				// Create new socket connection
				this.socketInstance = createTypedSocket(env.NEXT_PUBLIC_WSS_ENDPOINT, SOCKET_CONFIG);
				this.setupSocketEventListeners(this.socketInstance);
				this.isInitialized = true;
			}

			return this.socketInstance;
		} catch (error) {
			console.error("Failed to reinitialize socket:", error);
			return null;
		}
	}

	/**
	 * Checks if the socket is healthy (exists, connected, and has an ID)
	 * @returns boolean indicating if socket is healthy
	 */
	public isSocketHealthy(): boolean {
		return !!(this.socketInstance && this.socketInstance.connected && this.socketInstance.id);
	}

	private cleanup(): void {
		if (this.socketInstance) {
			// Remove all event listeners
			this.socketInstance.off("connect");
			this.socketInstance.off("disconnect");
			this.socketInstance.off("update-notifications-count");

			// Disconnect and reset
			this.socketInstance.disconnect();
			this.socketInstance = null;
			this.isInitialized = false;
		}

		// Clear all event callbacks
		this.eventCallbacks = {};
	}

	public getSocket(): TypedSocket | null {
		return this.socketInstance;
	}
}

export default SocketStoreManager;
