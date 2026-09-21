import { NextResponse } from "next/server";

import { version } from "@/../package.json";

export function GET() {
	return NextResponse.json({
		status: "ok",
		uptime: process.uptime(),
		version,
	});
}
