"use client";

import * as React from "react";
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  BOLD_ITALIC_STAR,
  BOLD_ITALIC_UNDERSCORE,
  BOLD_STAR,
  BOLD_UNDERSCORE,
  HEADING,
  ITALIC_STAR,
  ITALIC_UNDERSCORE,
  LINK,
  ORDERED_LIST,
  QUOTE,
  STRIKETHROUGH,
  UNORDERED_LIST,
} from "@lexical/markdown";
import { LinkNode } from "@lexical/link";
import {
  ListItemNode,
  ListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { $getRoot, FORMAT_TEXT_COMMAND } from "lexical";
import { cn } from "@/lib/utils";

const MARKDOWN_TRANSFORMERS = [
  HEADING,
  QUOTE,
  UNORDERED_LIST,
  ORDERED_LIST,
  BOLD_ITALIC_STAR,
  BOLD_ITALIC_UNDERSCORE,
  BOLD_STAR,
  BOLD_UNDERSCORE,
  ITALIC_STAR,
  ITALIC_UNDERSCORE,
  STRIKETHROUGH,
  LINK,
];

const editorTheme = {
  paragraph: "mb-2 last:mb-0",
  quote: "border-l-2 border-border pl-3 italic text-muted-foreground",
  heading: {
    h1: "text-xl font-semibold",
    h2: "text-lg font-semibold",
    h3: "text-base font-semibold",
  },
  link: "text-primary underline underline-offset-4",
  list: {
    ul: "ml-5 list-disc space-y-1",
    ol: "ml-5 list-decimal space-y-1",
    listitem: "leading-6",
  },
  text: {
    bold: "font-semibold",
    italic: "italic",
    underline: "underline",
    strikethrough: "line-through",
    code: "rounded bg-muted px-1 py-0.5 font-mono text-[0.9em]",
  },
};

interface MarkdownRichTextEditorProps {
  value: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  autoFocus?: boolean;
  className?: string;
}

function MarkdownSyncPlugin({
  value,
  onChange,
}: Pick<MarkdownRichTextEditorProps, "value" | "onChange">) {
  const [editor] = useLexicalComposerContext();
  const lastSyncedMarkdownRef = React.useRef(value);

  React.useEffect(() => {
    if (value === lastSyncedMarkdownRef.current) {
      return;
    }

    editor.update(() => {
      const root = $getRoot();
      root.clear();

      if (value.trim()) {
        $convertFromMarkdownString(value, MARKDOWN_TRANSFORMERS);
      }
    });

    lastSyncedMarkdownRef.current = value;
  }, [editor, value]);

  return (
    <OnChangePlugin
      onChange={(editorState) => {
        editorState.read(() => {
          const nextMarkdown = $convertToMarkdownString(MARKDOWN_TRANSFORMERS);

          if (nextMarkdown === lastSyncedMarkdownRef.current) {
            return;
          }

          lastSyncedMarkdownRef.current = nextMarkdown;
          onChange(nextMarkdown);
        });
      }}
    />
  );
}

function EditablePlugin({ editable }: { editable: boolean }) {
  const [editor] = useLexicalComposerContext();

  React.useEffect(() => {
    editor.setEditable(editable);
  }, [editor, editable]);

  return null;
}

function ToolbarButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="rounded-md border border-border/70 bg-background px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function EditorToolbar() {
  const [editor] = useLexicalComposerContext();

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border/70 bg-muted/30 px-3 py-2">
      <ToolbarButton
        label="Bold"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
      />
      <ToolbarButton
        label="Italic"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
      />
      <ToolbarButton
        label="Strike"
        onClick={() =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")
        }
      />
      <ToolbarButton
        label="Bullet List"
        onClick={() =>
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
        }
      />
      <ToolbarButton
        label="Numbered List"
        onClick={() =>
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
        }
      />
    </div>
  );
}

export function MarkdownRichTextEditor({
  value,
  onChange,
  placeholder = "Write here...",
  readOnly = false,
  autoFocus = false,
  className,
}: MarkdownRichTextEditorProps) {
  const initialConfig = React.useMemo(
    () => ({
      namespace: "MarkdownRichTextEditor",
      theme: editorTheme,
      editable: !readOnly,
      nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode],
      onError(error: Error) {
        throw error;
      },
    }),
    [readOnly],
  );

  return (
    <LexicalComposer
      initialConfig={initialConfig}
      key={readOnly ? "markdown-editor-readonly" : "markdown-editor-editable"}
    >
      <div
        className={cn(
          "flex min-h-0 flex-col overflow-hidden rounded-md border border-input bg-background shadow-sm",
          readOnly && "bg-muted/20",
          className,
        )}
      >
        {readOnly ? null : <EditorToolbar />}

        <div className="relative min-h-0 flex-1 overflow-y-auto">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className={cn(
                  "min-h-[220px] max-h-[420px] overflow-y-auto px-3 py-3 text-sm leading-6 outline-none",
                  readOnly && "cursor-default text-foreground/90",
                )}
              />
            }
            placeholder={
              <div className="pointer-events-none absolute left-3 top-3 text-sm text-muted-foreground">
                {placeholder}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />

          <HistoryPlugin />
          <LinkPlugin />
          <ListPlugin />
          <EditablePlugin editable={!readOnly} />
          <MarkdownSyncPlugin value={value} onChange={onChange} />
          {readOnly ? null : (
            <MarkdownShortcutPlugin transformers={MARKDOWN_TRANSFORMERS} />
          )}
          {readOnly || !autoFocus ? null : <AutoFocusPlugin />}
        </div>
      </div>
    </LexicalComposer>
  );
}
