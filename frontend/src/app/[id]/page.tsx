import { notFound } from "next/navigation";
import { bundledLanguagesInfo, codeToHtml, type BundledLanguage } from "shiki";
import type { Paste } from "@/lib/pastes";

const apiBase = (process.env.API_BASE_URL || "http://localhost:8081/api/v1").replace(/\/$/, "");
const pasteTheme = {
  name: "pastebin-dark",
  type: "dark" as const,
  colors: {
    "editor.background": "#0a0a0a",
    "editor.foreground": "#ededed",
    "editorLineNumber.foreground": "#525252",
    "editorLineNumber.activeForeground": "#a3a3a3",
    "editor.selectionBackground": "#07598588",
    "editorCursor.foreground": "#38bdf8",
  },
  tokenColors: [
    { scope: ["keyword", "storage.type", "storage.modifier"], settings: { foreground: "#c084fc" } },
    { scope: ["variable", "variable.other", "identifier"], settings: { foreground: "#ededed" } },
    { scope: ["entity.name.function", "support.function"], settings: { foreground: "#7dd3fc" } },
    { scope: ["variable.other.property", "support.type.property-name"], settings: { foreground: "#93c5fd" } },
    { scope: ["string", "string.quoted"], settings: { foreground: "#86efac" } },
    { scope: ["constant.numeric", "constant.language"], settings: { foreground: "#fca5a5" } },
    { scope: ["comment", "comment.line", "comment.block"], settings: { foreground: "#737373", fontStyle: "italic" } },
    { scope: ["keyword.operator", "punctuation"], settings: { foreground: "#a3a3a3" } },
    { scope: ["entity.name.type", "entity.name.class", "support.type"], settings: { foreground: "#fcd34d" } },
    { scope: ["meta"], settings: { foreground: "#a3a3a3" } },
  ],
};

function shikiLanguage(language: string): BundledLanguage | "text" {
  const normalized = language.trim().toLowerCase();
  const match = bundledLanguagesInfo.find(({ id, name, aliases }) =>
    id.toLowerCase() === normalized ||
    name.toLowerCase() === normalized ||
    aliases?.some((alias) => alias.toLowerCase() === normalized),
  );

  return match ? match.id as BundledLanguage : "text";
}

async function loadPaste(id: string): Promise<Paste | null> {
  const response = await fetch(`${apiBase}/pastes/${encodeURIComponent(id)}`, { cache: "no-store" });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Paste service unavailable");
  return response.json() as Promise<Paste>;
}

export default async function PastePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let paste: Paste | null;

  try {
    paste = await loadPaste(id);
  } catch {
    return (
      <main className="workspace">
        <div className="load-error">Paste service unavailable</div>
      </main>
    );
  }

  if (!paste) notFound();

  const highlighted = await codeToHtml(paste.content, {
    lang: shikiLanguage(paste.language),
    theme: pasteTheme,
  });

  return (
    <main className="workspace">
      <div className="shiki-code" dangerouslySetInnerHTML={{ __html: highlighted }} />
    </main>
  );
}
