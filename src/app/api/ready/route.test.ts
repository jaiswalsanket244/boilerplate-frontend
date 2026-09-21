import { GET } from "./route";
import { describe, expect, it } from "vitest";

describe("GET /api/ready", () => {
	it("returns ready true when the dependency check passes", async () => {
		const res = await GET();
		const body = await res.json();

		expect(body.ready).toBe(true);
	});
});
