"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { createPaste } from "@/lib/pastes";

export default function Home() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function save() {
    if (!content.trim() || saving) return;
    setSaving(true);
    setMessage("");
    try {
      const paste = await createPaste(content);
      router.push(`/${paste.id}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save paste.");
      setSaving(false);
    }
  }

  return (
    <main className="workspace">
      <header className="topbar">
        <Link className="brand" href="/" aria-label="Suvi Paste home"><span className="brand-mark">s</span><span>suvi<span className="brand-muted">.paste</span></span></Link>
        <div className="top-meta"><span className="status-dot" /> Local draft</div>
      </header>
      <section className="editor-shell" aria-label="Paste editor">
        <div className="editor-heading"><div><div className="eyebrow">A quiet place for text</div><h1>New paste</h1></div><span className="language-pill"><i /> Plain text</span></div>
        <div className="editor-frame"><CodeMirror value={content} onChange={setContent} theme={oneDark} extensions={[javascript()]} basicSetup={{ lineNumbers: true, foldGutter: true, highlightActiveLine: true, autocompletion: true }} placeholder="Paste or write something…" minHeight="100%" /></div>
        <div className="editor-footer"><span>⌘ Enter to save</span><span>{content.length.toLocaleString()} characters</span></div>
      </section>
      {message && <div className="toast" role="alert">{message}</div>}
      <button className="save-bubble" onClick={save} disabled={saving || !content.trim()} aria-label="Save paste"><span>{saving ? "Saving" : "Save paste"}</span><span className="save-arrow">↗</span></button>
    </main>
  );
}
