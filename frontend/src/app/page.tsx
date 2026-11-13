"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CodeMirror from "@uiw/react-codemirror";
import { createPaste } from "@/lib/pastes";
import { editorTheme, editorHighlighting } from "@/lib/editor-theme";

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
      <CodeMirror className="full-editor" value={content} onChange={setContent} theme={editorTheme} extensions={[editorHighlighting]} basicSetup={{ lineNumbers: true, foldGutter: true, highlightActiveLine: true, autocompletion: true }} placeholder="" />
      <button className="save-bubble" onClick={save} disabled={saving || !content.trim()} aria-label={message || "Save paste"} title={message || "Save paste"}><span>{saving ? "Saving" : "Save"}</span></button>
      {message && <div className="save-error" role="alert">{message}</div>}
    </main>
  );
}
