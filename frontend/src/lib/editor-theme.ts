import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { EditorView } from "@codemirror/view";

export const editorTheme = EditorView.theme({
  "&": { height: "100%", color: "#ededed", backgroundColor: "#0a0a0a" },
  ".cm-scroller": { fontFamily: "var(--editor-mono)", lineHeight: "1.7", overflow: "auto" },
  ".cm-content": { caretColor: "#38bdf8" },
  ".cm-cursor, .cm-dropCursor": { borderLeftColor: "#38bdf8" },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground": { background: "#07598588" },
  ".cm-activeLine": { backgroundColor: "#ffffff08" },
  ".cm-gutters": { color: "#525252", backgroundColor: "#0a0a0a", border: "none" },
  ".cm-activeLineGutter": { color: "#a3a3a3", backgroundColor: "#ffffff08" },
  ".cm-foldGutter": { color: "#525252" },
  ".cm-matchingBracket": { color: "#ededed", backgroundColor: "#262626", outline: "1px solid #404040" },
  ".cm-placeholder": { color: "#525252" },
}, { dark: true });

export const editorHighlighting = syntaxHighlighting(HighlightStyle.define([
  { tag: tags.keyword, color: "#c084fc" },
  { tag: [tags.name, tags.variableName], color: "#ededed" },
  { tag: [tags.function(tags.variableName), tags.function(tags.propertyName)], color: "#7dd3fc" },
  { tag: [tags.propertyName, tags.attributeName], color: "#93c5fd" },
  { tag: [tags.string, tags.special(tags.string)], color: "#86efac" },
  { tag: [tags.number, tags.bool, tags.null], color: "#fca5a5" },
  { tag: [tags.comment, tags.lineComment, tags.blockComment], color: "#737373", fontStyle: "italic" },
  { tag: [tags.operator, tags.punctuation], color: "#a3a3a3" },
  { tag: [tags.typeName, tags.className], color: "#fcd34d" },
  { tag: tags.meta, color: "#a3a3a3" },
]));
