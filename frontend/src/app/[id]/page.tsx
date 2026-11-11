"use client";

import { useEffect, useState } from "react";
import { LanguageDescription, type LanguageSupport } from "@codemirror/language";
import { languages } from "@codemirror/language-data";
import CodeMirror from "@uiw/react-codemirror";
import { getPaste, type Paste } from "@/lib/pastes";
import { editorTheme, editorHighlighting } from "@/lib/editor-theme";

export default function PastePage({ params }: { params: Promise<{ id: string }> }) {
  const [paste, setPaste] = useState<Paste | null>(null);
  const [languageSupport, setLanguageSupport] = useState<{ language: string; support: LanguageSupport } | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { let active = true; params.then(({ id: value }) => { getPaste(value).then((item) => { if (active) setPaste(item); }).catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : "Could not load paste."); }); }); return () => { active = false; }; }, [params]);
  useEffect(() => {
    let active = true;
    if (!paste || paste.language === "Plain text") return;

    const description = LanguageDescription.matchLanguageName(languages, paste.language, true);
    if (description) {
      description.load().then((support) => {
        if (active) setLanguageSupport({ language: paste.language, support });
      }).catch(() => {});
    }

    return () => { active = false; };
  }, [paste]);

  const activeLanguageSupport = languageSupport && languageSupport.language === paste?.language ? languageSupport.support : null;
  return <main className="workspace">{error ? <div className="load-error">{error}</div> : <CodeMirror className="full-editor" value={paste?.content ?? ""} theme={editorTheme} extensions={activeLanguageSupport ? [activeLanguageSupport, editorHighlighting] : [editorHighlighting]} editable={false} readOnly basicSetup={{ lineNumbers: true, foldGutter: true, highlightActiveLine: false }} placeholder="" />}</main>;
}
