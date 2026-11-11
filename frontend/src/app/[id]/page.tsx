"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { getPaste, type Paste } from "@/lib/pastes";

export default function PastePage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState("");
  const [paste, setPaste] = useState<Paste | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { let active = true; params.then(({ id: value }) => { setId(value); getPaste(value).then((item) => { if (active) setPaste(item); }).catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : "Could not load paste."); }); }); return () => { active = false; }; }, [params]);

  return <main className="workspace"><header className="topbar"><Link className="brand" href="/"><span className="brand-mark">s</span><span>suvi<span className="brand-muted">.paste</span></span></Link><div className="top-actions"><span className="read-only-label">Read only</span><Link className="new-link" href="/">New paste <span>↗</span></Link></div></header><section className="editor-shell"><div className="editor-heading"><div><div className="eyebrow">Shared paste</div><h1 className="paste-id">{id || "Loading…"}</h1></div><span className="language-pill"><i /> Plain text</span></div>{error ? <div className="empty-state">{error}</div> : <div className="editor-frame"><CodeMirror value={paste?.content ?? ""} theme={oneDark} extensions={[javascript()]} editable={false} readOnly basicSetup={{ lineNumbers: true, foldGutter: true, highlightActiveLine: false }} placeholder="Loading paste…" minHeight="100%" /></div>}<div className="editor-footer"><span>{paste ? new Date(paste.createdAt).toLocaleDateString() : ""}</span><Link className="raw-link" href={`/${id}/raw`}>View raw ↗</Link></div></section></main>;
}
