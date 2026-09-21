import { version } from "@/../package.json";
import { GET } from "@/app/api/health/route";

describe("GET /api/health", () => {
	it("responds with 200 and status ok", async () => {
		const response = GET();

		expect(response.status).toBe(200);
		const body = await response.json();
		expect(body.status).toBe("ok");
	});

	it("reports the package version and a numeric uptime", async () => {
		const body = await GET().json();

		expect(body.version).toBe(version);
		expect(typeof body.uptime).toBe("number");
	});
});
