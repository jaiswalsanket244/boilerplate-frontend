import { env } from "@/env.mjs";
import { routes } from "@/config/routes";
import { type NextRequest, NextResponse } from "next/server";

/*
Reverse proxy for the Agendash job dashboard.

Agendash is a self-contained web app served by the backend at /admin/agendash.
The browser never calls the backend directly — it calls this route, and we
re-issue the request server-side with the auth cookie attached. The backend's
systemMiddleware is the only gate: a request without a valid system-user cookie
is rejected by the backend, not here.

The [[...path]] catch-all funnels every dashboard URL — pages, background XHR,
and the SSE event stream — through proxy().
*/

// Agendash lives at the API root (/admin/agendash), not under /api.
const AGENDASH_BASE = `${env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "")}/admin/agendash`;

/*
Backend response headers we must not pass to the browser:
- content-encoding / content-length: fetch already decoded the body, so these
  would now describe it wrongly.
- transfer-encoding / connection: hop-by-hop, meaningless to re-send.
- content-security-policy / x-frame-options: the backend's defaults block the
  dashboard from rendering; drop them so it can.
*/
const HEADERS_TO_DROP = new Set([
	"content-encoding",
	"content-length",
	"transfer-encoding",
	"connection",
	"content-security-policy",
	"x-frame-options",
]);

/*
True for a top-level browser navigation (address bar / link click), false for
Agendash's background XHR/SSE. Only navigations become a signin redirect on a
backend reject; background calls keep their raw 401 so Agendash handles them.
*/
function isPageNavigation(req: NextRequest): boolean {
	const mode = req.headers.get("sec-fetch-mode");
	if (mode) return mode === "navigate";
	// Older browsers without Sec-Fetch-* headers: fall back to the Accept header.
	return (req.headers.get("accept") || "").includes("text/html");
}

// Only the cookie (for auth) and content-type need to reach the backend.
function buildForwardHeaders(req: NextRequest): Headers {
	const headers = new Headers();
	const cookie = req.headers.get("cookie");
	if (cookie) headers.set("cookie", cookie);
	const contentType = req.headers.get("content-type");
	if (contentType) headers.set("content-type", contentType);
	return headers;
}

function buildResponseHeaders(upstream: Response): Headers {
	const headers = new Headers();
	upstream.headers.forEach((value, key) => {
		if (!HEADERS_TO_DROP.has(key.toLowerCase())) headers.set(key, value);
	});
	return headers;
}

/*
Agendash's HTML assumes it is mounted at the site root, so its relative asset
and link URLs would resolve outside this route. Injecting <base> re-roots them
back through the proxy.
*/
function rewriteHtmlBase(html: string, req: NextRequest): string {
	const basePath = req.nextUrl.pathname.replace(/\/$/, "");
	return html.replace("<head>", `<head><base href="${basePath}/" />`);
}

async function proxy(req: NextRequest, path?: string[]): Promise<Response> {
	const suffix = path?.length ? `/${path.join("/")}` : "/";
	const target = `${AGENDASH_BASE}${suffix}${req.nextUrl.search}`;

	// Block traversal: the resolved URL must stay inside the Agendash mount.
	if (!new URL(target).pathname.startsWith("/admin/agendash")) {
		return new NextResponse("Bad Request", { status: 400 });
	}

	const hasBody = req.method !== "GET" && req.method !== "HEAD";

	const upstream = await fetch(target, {
		method: req.method,
		headers: buildForwardHeaders(req),
		body: hasBody ? await req.arrayBuffer() : undefined,
		redirect: "manual",
	});

	// Send a real page navigation to signin instead of leaking raw JSON.
	if ((upstream.status === 401 || upstream.status === 403) && isPageNavigation(req)) {
		return NextResponse.redirect(new URL(routes.system.signIn, req.url));
	}

	const responseHeaders = buildResponseHeaders(upstream);

	// Redirects come back in backend space (/admin/agendash/…); rewrite them into
	// this route's space so the browser stays behind the proxy.
	const location = upstream.headers.get("location");
	if (location) {
		const resolved = new URL(location, target);
		const rebased = resolved.pathname.replace(/^\/admin\/agendash/, routes.system.jobs);
		responseHeaders.set("location", `${rebased}${resolved.search}`);
	}

	if ((upstream.headers.get("content-type") || "").includes("text/html")) {
		const html = rewriteHtmlBase(await upstream.text(), req);
		return new Response(html, { status: upstream.status, headers: responseHeaders });
	}

	// Streamed body preserves the /api/events SSE channel.
	return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ path?: string[] }> }): Promise<Response> {
	const { path } = await ctx.params;
	return proxy(req, path);
}

export const POST = GET;
export const PUT = GET;
export const PATCH = GET;
export const DELETE = GET;
