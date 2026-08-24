import { QueryClientProvider } from "@tanstack/react-query";
import { createTestQueryClient } from "@/tests/utils/mock-query-client";
import { render } from "@testing-library/react";
import type { ReactNode } from "react";

export function renderWithProviders(ui: ReactNode, options = {}) {
	const queryClient = createTestQueryClient();

	return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>, options);
}

export function wrapWithQueryClient(ui: ReactNode, options = {}) {
	const queryClient = createTestQueryClient();

	return <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>;
}
