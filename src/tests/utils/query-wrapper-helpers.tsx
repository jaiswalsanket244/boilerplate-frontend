import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { createTestQueryClient } from "@/tests/utils/mock-query-client";

// QueryClientProvider (not the global react-query mock) so the hooks under test run their real useMutation/useQuery logic.
export const createQueryWrapper = () => {
	const queryClient = createTestQueryClient();

	function QueryWrapper({ children }: { children: ReactNode }) {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
	}

	return QueryWrapper;
};
