import type { Socket } from "socket.io-client";

export interface ServerToClientEvents {
	connect: () => void;
	disconnect: () => void;
	"update-notifications-count": () => void;
}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface ClientToServerEvents {
	// Add client-to-server events here if any
	// Example: "send-message": (message: string) => void;
}

export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

// Event callback types
export type TEventCallbacks = {
	[K in keyof ServerToClientEvents]?: Array<ServerToClientEvents[K]>;
};
