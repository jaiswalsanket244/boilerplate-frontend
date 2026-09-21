import { afterEach, describe, expect, it, vi } from "vitest";
import { version } from "../../../../../package.json";
import { GET } from "@/app/api/health/route";

describe("GET /api/health", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("returns status ok with uptime and version", async () => {
		vi.spyOn(process, "uptime").mockReturnValue(123.45);

		const response = await GET();
		const body = await response.json();

		expect(response.status).toBe(200);
		expect(body).toEqual({
			status: "ok",
			uptime: 123.45,
			version,
		});
	});

	it("reports the live process uptime on each call", async () => {
		vi.spyOn(process, "uptime").mockReturnValueOnce(1).mockReturnValueOnce(2);

		const first = await (await GET()).json();
		const second = await (await GET()).json();

		expect(first.uptime).toBe(1);
		expect(second.uptime).toBe(2);
	});
});
