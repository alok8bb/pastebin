export type Paste = { id: string; content: string; createdAt: string };

// Browser requests stay same-origin through the Next proxy. Set API_BASE_URL
// on the frontend server to switch the upstream for local or hosted deployment.
const apiBase = "/api/v1";

export async function createPaste(content: string): Promise<Paste> {
  const response = await fetch(`${apiBase}/pastes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!response.ok) throw new Error("Could not save paste. Check that the API is running.");
  return response.json();
}

export async function getPaste(id: string): Promise<Paste> {
  const response = await fetch(`${apiBase}/pastes/${encodeURIComponent(id)}`, { cache: "no-store" });
  if (!response.ok) throw new Error(response.status === 404 ? "Paste not found." : "Could not load paste.");
  return response.json();
}
