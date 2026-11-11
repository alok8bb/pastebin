import { NextResponse } from "next/server";

const apiBase = (process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1").replace(/\/$/, "");

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const response = await fetch(`${apiBase}/pastes/${encodeURIComponent(id)}`, { cache: "no-store" });
    if (!response.ok) return new NextResponse(response.status === 404 ? "Paste not found.\n" : "Could not load paste.\n", { status: response.status, headers: { "Content-Type": "text/plain; charset=utf-8" } });
    const paste = await response.json() as { content: string };
    return new NextResponse(paste.content, { headers: { "Content-Type": "text/plain; charset=utf-8", "X-Content-Type-Options": "nosniff" } });
  } catch {
    return new NextResponse("Paste service unavailable.\n", { status: 502, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
}
