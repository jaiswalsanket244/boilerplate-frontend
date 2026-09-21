import { GET } from "./route";
import { describe, expect, it } from "vitest";

describe("GET /api/health", () => {
	it("returns status ok and a numeric uptime", async () => {
		const res = await GET();
		const body = await res.json();

		expect(body.status).toBe("ok");
		expect(typeof body.uptime).toBe("number");
		expect(body.uptime).toBeGreaterThanOrEqual(0);
	});
});
