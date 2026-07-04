"use client";

import { useEffect, useRef } from "react";
import { EditorSelection, EditorState, StateField } from "@codemirror/state";
import {
  Decoration,
  DecorationSet,
  EditorView,
  drawSelection,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
} from "@codemirror/view";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { vim, getCM } from "@replit/codemirror-vim";

const dojoTheme = EditorView.theme(
  {
    "&": { backgroundColor: "transparent", fontSize: "15px" },
    ".cm-scroller": {
      fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
      lineHeight: "1.75",
      padding: "14px 6px",
    },
    ".cm-content": { caretColor: "#7ee787" },
    "&.cm-focused": { outline: "none" },
    ".cm-line": { padding: "0 10px" },
    ".cm-gutters": {
      backgroundColor: "transparent",
      color: "#55606d",
      border: "none",
      paddingRight: "8px",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "transparent",
      color: "#dbe2ec",
    },
    ".cm-selectionBackground": { backgroundColor: "#2b3f5c !important" },
    "&.cm-focused .cm-selectionBackground": {
      backgroundColor: "#31527a !important",
    },
    ".cm-cursor": { borderLeftColor: "#7ee787" },
    ".cm-fat-cursor": {
      backgroundColor: "#7ee787 !important",
      color: "#0a0e14 !important",
    },
    "&:not(.cm-focused) .cm-fat-cursor": {
      outline: "1px solid #7ee787 !important",
      backgroundColor: "transparent !important",
      color: "inherit !important",
    },
    ".cm-target-char": {
      backgroundColor: "rgba(227, 179, 65, 0.35)",
      outline: "1px solid rgba(227, 179, 65, 0.85)",
      borderRadius: "3px",
      animation: "targetPulse 1.4s ease-in-out infinite",
    },
    ".cm-panels": {
      backgroundColor: "#141c26",
      color: "#dbe2ec",
      borderTop: "1px solid #223041",
      padding: "4px 10px",
      fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
    },
    ".cm-panels input": {
      color: "#dbe2ec",
      backgroundColor: "transparent",
      fontFamily: "inherit",
    },
  },
  { dark: true }
);

function targetHighlight(offset: number) {
  const mark = Decoration.mark({ class: "cm-target-char" });
  return StateField.define<DecorationSet>({
    create: () => Decoration.set([mark.range(offset, offset + 1)]),
    update: (deco, tr) => deco.map(tr.changes),
    provide: (f) => EditorView.decorations.from(f),
  });
}

interface VimEditorProps {
  text: string;
  startOffset: number;
  targetOffset?: number | null;
  onDocUpdate?: (doc: string, cursor: number) => void;
  onModeChange?: (mode: string) => void;
  minHeightClass?: string;
}

export default function VimEditor({
  text,
  startOffset,
  targetOffset,
  onDocUpdate,
  onModeChange,
  minHeightClass = "min-h-[180px]",
}: VimEditorProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const docCb = useRef(onDocUpdate);
  docCb.current = onDocUpdate;
  const modeCb = useRef(onModeChange);
  modeCb.current = onModeChange;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const extensions = [
      vim(),
      lineNumbers(),
      highlightActiveLineGutter(),
      drawSelection(),
      history(),
      keymap.of([...defaultKeymap, ...historyKeymap]),
      dojoTheme,
      // Focus on click without moving the cursor — mouse-jumping the cursor
      // would defeat the movement drills (and the habit we're building).
      EditorView.domEventHandlers({
        mousedown: (e, v) => {
          e.preventDefault();
          v.focus();
          return true;
        },
      }),
      EditorView.updateListener.of((u) => {
        if (u.docChanged || u.selectionSet) {
          docCb.current?.(u.state.doc.toString(), u.state.selection.main.head);
        }
      }),
    ];
    if (
      targetOffset != null &&
      targetOffset >= 0 &&
      targetOffset < text.length
    ) {
      extensions.push(targetHighlight(targetOffset));
    }

    const view = new EditorView({
      state: EditorState.create({
        doc: text,
        selection: EditorSelection.cursor(
          Math.min(startOffset, Math.max(0, text.length - 1))
        ),
        extensions,
      }),
      parent: host,
    });
    viewRef.current = view;

    const cm = getCM(view);
    cm?.on("vim-mode-change", (modeEvent: unknown) => {
      const e = modeEvent as { mode?: string; subMode?: string } | undefined;
      const mode =
        e?.mode === "visual" && e?.subMode === "linewise"
          ? "v-line"
          : e?.mode ?? "normal";
      modeCb.current?.(mode);
    });

    const focusTimer = setTimeout(() => view.focus(), 30);
    return () => {
      clearTimeout(focusTimer);
      view.destroy();
      viewRef.current = null;
    };
    // The editor is intentionally created once per mount; parents remount via
    // a key when the challenge changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={hostRef}
      className={`cursor-text ${minHeightClass}`}
      onClick={() => viewRef.current?.focus()}
    />
  );
}
