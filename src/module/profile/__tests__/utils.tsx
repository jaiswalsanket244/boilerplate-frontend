import { createTestQueryClient } from "@/tests/utils/mock-query-client";
import { QueryClientProvider } from "@tanstack/react-query";

export const mockUserData = {
	_id: "user-123",
	name: {
		first: "John",
		last: "Doe",
	},
	email: "john.doe@example.com",
	images: ["https://example.com/avatar.jpg"],
	companyRef: {
		_id: "test-company",
		supportEmail: "support@company.com",
	},
};
export const wrapper = ({ children }: { children: React.ReactNode }) => {
	const qc = createTestQueryClient();
	return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
};
