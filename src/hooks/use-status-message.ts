import type { MESSAGE_STATUS } from "@/types";
import { useState } from "react";

export const useStatusMessage = () => {
	const [statusMessage, setStatusMessage] = useState<{
		type: MESSAGE_STATUS | null;
		message: string;
	}>({ type: null, message: "" });

	return { statusMessage, setStatusMessage };
};
