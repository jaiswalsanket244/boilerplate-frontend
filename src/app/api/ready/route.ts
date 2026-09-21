import { NextResponse } from "next/server";

// Placeholder dependency check — stub for a future real readiness probe (DB/cache/etc.).
async function checkDependencies(): Promise<boolean> {
	return true;
}

export async function GET(): Promise<Response> {
	await checkDependencies();
	return NextResponse.json({ ready: true });
}
