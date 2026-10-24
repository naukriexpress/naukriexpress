"use client";

import { useEffect, useRef, useState } from "react";

export default function RichTextEditor({
  name,
  label,
  defaultValue,
  placeholder,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState(defaultValue || "");

  // Keep the editable DOM separate from React's render cycle. Passing
  // dangerouslySetInnerHTML on every render resets the user's caret/content
  // when the hidden form value changes, making typing appear broken.
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const nextHtml = defaultValue || "";
    if (editor.innerHTML !== nextHtml) editor.innerHTML = nextHtml;
    setHtml(nextHtml);
  }, [defaultValue]);

  function exec(command: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    setHtml(editorRef.current?.innerHTML || "");
  }

  const buttons: { label: string; command: string; value?: string }[] = [
    { label: "B", command: "bold" },
    { label: "I", command: "italic" },
    { label: "• List", command: "insertUnorderedList" },
    { label: "1. List", command: "insertOrderedList" },
    { label: "P", command: "formatBlock", value: "p" },
  ];

  return (
    <div>
      <label className="block text-sm font-semibold text-ink-900 mb-1.5">{label}</label>
      <div className="rounded-lg border border-ink-900/15 overflow-hidden">
        <div className="flex flex-wrap gap-1 border-b border-ink-900/10 bg-ink-900/[0.02] p-1.5">
          {buttons.map((b) => (
            <button
              key={b.label}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => exec(b.command, b.value)}
              className="rounded-md border border-ink-900/10 bg-white px-2.5 py-1 text-xs font-semibold text-ink-800 hover:bg-brand-50"
            >
              {b.label}
            </button>
          ))}
        </div>
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={(e) => setHtml(e.currentTarget.innerHTML)}
          data-placeholder={placeholder}
          role="textbox"
          aria-label={label}
          aria-multiline="true"
          spellCheck
          className="min-h-[110px] px-3 py-2.5 text-sm text-ink-900 focus:outline-none [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-ink-700/40"
        />
      </div>
      <input type="hidden" name={name} value={html} readOnly />
    </div>
  );
}
