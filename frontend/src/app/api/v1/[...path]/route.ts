import { NextResponse } from "next/server";

const apiBase = (process.env.API_BASE_URL || "http://localhost:8080/api/v1").replace(/\/$/, "");
type RouteContext = { params: Promise<{ path: string[] }> };

async function proxy(request: Request, context: RouteContext) {
  const { path } = await context.params;
  const target = `${apiBase}/${path.map(encodeURIComponent).join("/")}`;
  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers: request.method === "POST" ? { "Content-Type": "application/json" } : undefined,
      body: request.method === "POST" ? await request.text() : undefined,
      cache: "no-store",
    });
    return new NextResponse(await upstream.text(), { status: upstream.status, headers: { "Content-Type": upstream.headers.get("content-type") || "application/json" } });
  } catch {
    return NextResponse.json({ error: "Paste service unavailable" }, { status: 502 });
  }
}

export const GET = proxy;
export const POST = proxy;
