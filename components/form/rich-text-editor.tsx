"use client";

import { Placeholder } from "@tiptap/extensions";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Underline,
  Undo2,
  Unlink,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  errorMessage?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
};

export function RichTextEditor({
  id,
  label,
  value,
  onChange,
  errorMessage,
  required,
  disabled,
  placeholder = "Describe the role, responsibilities, and impact…",
}: Props) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkValue, setLinkValue] = useState("");
  const [linkError, setLinkError] = useState("");
  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    content: value,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        horizontalRule: false,
        strike: false,
      }),
      Placeholder.configure({ placeholder }),
    ],
    onUpdate: ({ editor: currentEditor }) => onChange(currentEditor.getHTML()),
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== value) editor.commands.setContent(value, { emitUpdate: false });
  }, [editor, value]);

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [disabled, editor]);

  const applyLink = () => {
    if (!editor) return;
    const href = linkValue.trim();
    if (!/^(https?:\/\/|mailto:)/i.test(href)) {
      setLinkError("Use an http, https, or mailto link.");
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
    setLinkOpen(false);
    setLinkValue("");
    setLinkError("");
  };

  const toolbar = [
    { label: "Heading 2", icon: Heading2, active: editor?.isActive("heading", { level: 2 }), run: () => editor?.chain().focus().toggleHeading({ level: 2 }).run() },
    { label: "Heading 3", icon: Heading3, active: editor?.isActive("heading", { level: 3 }), run: () => editor?.chain().focus().toggleHeading({ level: 3 }).run() },
    { label: "Bold", icon: Bold, active: editor?.isActive("bold"), run: () => editor?.chain().focus().toggleBold().run() },
    { label: "Italic", icon: Italic, active: editor?.isActive("italic"), run: () => editor?.chain().focus().toggleItalic().run() },
    { label: "Underline", icon: Underline, active: editor?.isActive("underline"), run: () => editor?.chain().focus().toggleUnderline().run() },
    { label: "Bullet list", icon: List, active: editor?.isActive("bulletList"), run: () => editor?.chain().focus().toggleBulletList().run() },
    { label: "Ordered list", icon: ListOrdered, active: editor?.isActive("orderedList"), run: () => editor?.chain().focus().toggleOrderedList().run() },
    { label: "Blockquote", icon: Quote, active: editor?.isActive("blockquote"), run: () => editor?.chain().focus().toggleBlockquote().run() },
  ];

  return (
    <div>
      <label htmlFor={id} className="font-mono text-xs uppercase tracking-[0.14em]">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <div className={cn("mt-1 border border-border bg-bg focus-within:border-fg", errorMessage && "border-red-500")}>
        <div className="flex flex-wrap gap-1 border-b border-border p-2">
          {toolbar.map(({ label: itemLabel, icon: Icon, active, run }) => (
            <Button
              key={itemLabel}
              type="button"
              size="icon"
              variant="secondary"
              aria-label={itemLabel}
              aria-pressed={Boolean(active)}
              disabled={!editor || disabled}
              onClick={run}
              className={cn("h-8 min-h-8 w-8", active && "border-fg bg-fg text-bg")}
            >
              <Icon size={15} />
            </Button>
          ))}
          <Button
            type="button"
            size="icon"
            variant="secondary"
            aria-label="Add link"
            aria-pressed={Boolean(editor?.isActive("link"))}
            disabled={!editor || disabled}
            onClick={() => {
              setLinkValue(editor?.getAttributes("link").href ?? "");
              setLinkOpen((current) => !current);
              setLinkError("");
            }}
            className={cn("h-8 min-h-8 w-8", editor?.isActive("link") && "border-fg bg-fg text-bg")}
          >
            <LinkIcon size={15} />
          </Button>
          <Button type="button" size="icon" variant="secondary" aria-label="Remove link" disabled={!editor?.isActive("link") || disabled} onClick={() => editor?.chain().focus().unsetLink().run()} className="h-8 min-h-8 w-8">
            <Unlink size={15} />
          </Button>
          <span className="mx-1 w-px bg-border" />
          <Button type="button" size="icon" variant="secondary" aria-label="Undo" disabled={!editor?.can().chain().focus().undo().run() || disabled} onClick={() => editor?.chain().focus().undo().run()} className="h-8 min-h-8 w-8">
            <Undo2 size={15} />
          </Button>
          <Button type="button" size="icon" variant="secondary" aria-label="Redo" disabled={!editor?.can().chain().focus().redo().run() || disabled} onClick={() => editor?.chain().focus().redo().run()} className="h-8 min-h-8 w-8">
            <Redo2 size={15} />
          </Button>
        </div>

        {linkOpen && (
          <div className="border-b border-border p-3">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={linkValue}
                onChange={(event) => setLinkValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    applyLink();
                  }
                }}
                placeholder="https://example.com"
                className="min-h-10 min-w-0 flex-1 border border-border bg-transparent px-3 outline-none focus:border-fg"
              />
              <Button type="button" size="sm" onClick={applyLink}>Apply Link</Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => setLinkOpen(false)}>Cancel</Button>
            </div>
            {linkError && <p className="mt-1 text-xs text-red-500">{linkError}</p>}
          </div>
        )}

        <EditorContent id={id} editor={editor} />
      </div>
      {errorMessage && <p className="mt-1 text-xs text-red-500">{errorMessage}</p>}
    </div>
  );
}
