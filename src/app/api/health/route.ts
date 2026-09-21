import { NextResponse } from "next/server";

import { version } from "../../../../package.json";

// process.uptime() is per-request runtime state, so the route must never be
// statically cached at build time.
export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
	return NextResponse.json({
		status: "ok",
		uptime: process.uptime(),
		version,
	});
}
