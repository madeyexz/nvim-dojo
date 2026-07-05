"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  PROJECT_FILES,
  RECENT_FILES,
  TREE_ORDER,
  type LvGoal,
  type LvSetup,
} from "@/lib/lazyvim";

/* ---------- state model ---------- */

interface WinLeaf {
  kind: "leaf";
  id: number;
  file: string;
  highlightLine?: number;
}
interface WinSplit {
  kind: "split";
  dir: "row" | "col";
  a: WNode;
  b: WNode;
}
type WNode = WinLeaf | WinSplit;

type PickerKind = "files" | "buffers" | "recent" | "grep";

export interface SimState {
  layout: WNode;
  focusId: number;
  nextId: number;
  buffers: string[];
  alternate: string | null;
  explorer: { open: boolean; focused: boolean; sel: number };
  terminal: { open: boolean; focused: boolean };
  picker: { kind: PickerKind; query: string; sel: number } | null;
  pending: string[];
}

function leavesOf(n: WNode): WinLeaf[] {
  return n.kind === "leaf" ? [n] : [...leavesOf(n.a), ...leavesOf(n.b)];
}

function mapLeaf(n: WNode, id: number, fn: (l: WinLeaf) => WinLeaf): WNode {
  if (n.kind === "leaf") return n.id === id ? fn(n) : n;
  return { ...n, a: mapLeaf(n.a, id, fn), b: mapLeaf(n.b, id, fn) };
}

function removeLeaf(n: WNode, id: number): WNode | null {
  if (n.kind === "leaf") return n.id === id ? null : n;
  const a = removeLeaf(n.a, id);
  const b = removeLeaf(n.b, id);
  if (a && b) return { ...n, a, b };
  return a ?? b;
}

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

function rectsOf(n: WNode, r: Rect, out: Map<number, Rect>): void {
  if (n.kind === "leaf") {
    out.set(n.id, r);
    return;
  }
  if (n.dir === "row") {
    rectsOf(n.a, { ...r, w: r.w / 2 }, out);
    rectsOf(n.b, { ...r, x: r.x + r.w / 2, w: r.w / 2 }, out);
  } else {
    rectsOf(n.a, { ...r, h: r.h / 2 }, out);
    rectsOf(n.b, { ...r, y: r.y + r.h / 2, h: r.h / 2 }, out);
  }
}

function focusedLeaf(s: SimState): WinLeaf {
  const ls = leavesOf(s.layout);
  return ls.find((l) => l.id === s.focusId) ?? ls[0];
}

export function buildState(setup: LvSetup): SimState {
  let layout: WNode;
  let focusId = 0;
  const L = (id: number, file: string): WinLeaf => ({ kind: "leaf", id, file });
  const spec = setup.layout;
  if (spec.type === "single") {
    layout = L(0, spec.file);
    focusId = 0;
  } else if (spec.type === "vsplit") {
    layout = { kind: "split", dir: "row", a: L(0, spec.files[0]), b: L(1, spec.files[1]) };
    focusId = spec.focus;
  } else if (spec.type === "hsplit") {
    layout = { kind: "split", dir: "col", a: L(0, spec.files[0]), b: L(1, spec.files[1]) };
    focusId = spec.focus;
  } else {
    layout = {
      kind: "split",
      dir: "row",
      a: L(0, spec.files[0]),
      b: {
        kind: "split",
        dir: "col",
        a: L(1, spec.files[1]),
        b: L(2, spec.files[2]),
      },
    };
    focusId = spec.focus;
  }
  return {
    layout,
    focusId,
    nextId: 3,
    buffers: [...setup.buffers],
    alternate: setup.alternate ?? null,
    explorer: {
      open: setup.explorer?.open ?? false,
      focused: setup.explorer?.focused ?? false,
      sel: setup.explorer?.sel ?? 0,
    },
    terminal: {
      open: setup.terminal?.open ?? false,
      focused: setup.terminal?.focused ?? false,
    },
    picker: null,
    pending: [],
  };
}

/* ---------- goal checking ---------- */

export function checkGoal(s: SimState, g: LvGoal): boolean {
  const ls = leavesOf(s.layout);
  const focus = focusedLeaf(s);
  const sameSet = (a: string[], b: string[]) =>
    a.length === b.length && [...a].sort().join("|") === [...b].sort().join("|");

  if (g.activeFile !== undefined && focus.file !== g.activeFile) return false;
  if (g.windows !== undefined && ls.length !== g.windows) return false;
  if (g.dir !== undefined && !(s.layout.kind === "split" && s.layout.dir === g.dir))
    return false;
  if (g.focusFirst) {
    if (s.layout.kind !== "split") return false;
    const first = leavesOf(s.layout.a)[0];
    if (focus.id !== first.id) return false;
  }
  if (g.showing && !sameSet(ls.map((l) => l.file), g.showing)) return false;
  if (g.buffersExactly && !sameSet(s.buffers, g.buffersExactly)) return false;
  if (g.explorerOpen !== undefined && s.explorer.open !== g.explorerOpen)
    return false;
  if (g.terminalOpen !== undefined && s.terminal.open !== g.terminalOpen)
    return false;
  return true;
}

/* ---------- picker filtering ---------- */

interface PickerItem {
  label: string;
  file: string;
  line?: number;
  detail?: string;
}

export function pickerItems(s: SimState): PickerItem[] {
  const p = s.picker;
  if (!p) return [];
  const q = p.query.toLowerCase();
  if (p.kind === "grep") {
    if (!q) return [];
    const out: PickerItem[] = [];
    for (const [file, lines] of Object.entries(PROJECT_FILES)) {
      lines.forEach((ln, i) => {
        if (ln.toLowerCase().includes(q)) {
          out.push({ label: `${file}:${i + 1}`, file, line: i + 1, detail: ln.trim() });
        }
      });
    }
    return out;
  }
  const base =
    p.kind === "files"
      ? TREE_ORDER
      : p.kind === "buffers"
      ? s.buffers
      : RECENT_FILES;
  return base
    .filter((f) => f.toLowerCase().includes(q))
    .map((f) => ({ label: f, file: f }));
}

/* ---------- key engine ---------- */

const WHICH_KEY: Record<string, [string, string][]> = {
  SPC: [
    ["SPC", "find files"],
    [",", "buffer picker"],
    ["/", "grep project"],
    ["e", "explorer"],
    ["`", "alternate buffer"],
    ["|", "split right"],
    ["-", "split below"],
    ["b", "+buffer"],
    ["f", "+find"],
    ["w", "+windows"],
  ],
  "SPC b": [
    ["d", "delete buffer"],
    ["o", "delete others"],
  ],
  "SPC f": [
    ["f", "find files"],
    ["r", "recent files"],
  ],
  "SPC w": [["d", "delete window"]],
};

function keyOf(e: React.KeyboardEvent): string {
  if (e.key === " ") return e.ctrlKey ? "C-SPC" : "SPC";
  if (e.ctrlKey && e.key.length === 1) return `C-${e.key.toLowerCase()}`;
  return e.key;
}

function setFile(s: SimState, file: string, line?: number): SimState {
  const focus = focusedLeaf(s);
  if (focus.file === file && line === undefined) return s;
  const buffers = s.buffers.includes(file) ? s.buffers : [...s.buffers, file];
  return {
    ...s,
    layout: mapLeaf(s.layout, focus.id, (l) => ({
      ...l,
      file,
      highlightLine: line,
    })),
    buffers,
    alternate: focus.file !== file ? focus.file : s.alternate,
  };
}

function cycleBuffer(s: SimState, delta: number): SimState {
  const focus = focusedLeaf(s);
  const idx = s.buffers.indexOf(focus.file);
  if (idx < 0 || s.buffers.length < 2) return s;
  const next = s.buffers[(idx + delta + s.buffers.length) % s.buffers.length];
  return setFile(s, next);
}

function navigate(s: SimState, dir: "h" | "j" | "k" | "l"): SimState {
  const rects = new Map<number, Rect>();
  const editorH = s.terminal.open ? 0.75 : 1;
  rectsOf(s.layout, { x: 0, y: 0, w: 1, h: editorH }, rects);
  const TERM_ID = -1;
  if (s.terminal.open) rects.set(TERM_ID, { x: 0, y: editorH, w: 1, h: 1 - editorH });

  const curId = s.terminal.focused
    ? TERM_ID
    : s.explorer.focused
    ? null
    : s.focusId;
  // From the explorer, only "l" makes sense: hop into the editor.
  if (curId === null) {
    if (dir === "l")
      return { ...s, explorer: { ...s.explorer, focused: false } };
    return s;
  }
  const cur = rects.get(curId);
  if (!cur) return s;

  let best: { id: number; score: number } | null = null;
  for (const [id, r] of rects) {
    if (id === curId) continue;
    let ok = false;
    let overlap = 0;
    let dist = 0;
    const eps = 0.001;
    if (dir === "h" && r.x + r.w <= cur.x + eps) {
      ok = true;
      overlap = Math.min(cur.y + cur.h, r.y + r.h) - Math.max(cur.y, r.y);
      dist = cur.x - (r.x + r.w);
    } else if (dir === "l" && r.x >= cur.x + cur.w - eps) {
      ok = true;
      overlap = Math.min(cur.y + cur.h, r.y + r.h) - Math.max(cur.y, r.y);
      dist = r.x - (cur.x + cur.w);
    } else if (dir === "k" && r.y + r.h <= cur.y + eps) {
      ok = true;
      overlap = Math.min(cur.x + cur.w, r.x + r.w) - Math.max(cur.x, r.x);
      dist = cur.y - (r.y + r.h);
    } else if (dir === "j" && r.y >= cur.y + cur.h - eps) {
      ok = true;
      overlap = Math.min(cur.x + cur.w, r.x + r.w) - Math.max(cur.x, r.x);
      dist = r.y - (cur.y + cur.h);
    }
    if (!ok || overlap <= 0) continue;
    // prefer nearest, then topmost/leftmost (score favors small dist, small r.y/r.x)
    const score = dist * 100 + (dir === "h" || dir === "l" ? r.y : r.x);
    if (!best || score < best.score) best = { id, score };
  }
  if (!best) return s;
  if (best.id === TERM_ID) {
    return { ...s, terminal: { ...s.terminal, focused: true } };
  }
  return {
    ...s,
    focusId: best.id,
    terminal: { ...s.terminal, focused: false },
    explorer: { ...s.explorer, focused: false },
  };
}

function split(s: SimState, dir: "row" | "col"): SimState {
  const focus = focusedLeaf(s);
  const newLeaf: WinLeaf = { kind: "leaf", id: s.nextId, file: focus.file };
  const replace = (n: WNode): WNode => {
    if (n.kind === "leaf")
      return n.id === focus.id
        ? { kind: "split", dir, a: { ...n }, b: newLeaf }
        : n;
    return { ...n, a: replace(n.a), b: replace(n.b) };
  };
  // splitright / splitbelow (LazyVim defaults): new window gets focus
  return { ...s, layout: replace(s.layout), focusId: newLeaf.id, nextId: s.nextId + 1 };
}

function closeWindow(s: SimState): SimState {
  const ls = leavesOf(s.layout);
  if (ls.length < 2) return s;
  const next = removeLeaf(s.layout, s.focusId);
  if (!next) return s;
  return { ...s, layout: next, focusId: leavesOf(next)[0].id };
}

function deleteBuffer(s: SimState): SimState {
  const focus = focusedLeaf(s);
  const idx = s.buffers.indexOf(focus.file);
  if (idx < 0 || s.buffers.length < 2) return s;
  const buffers = s.buffers.filter((b) => b !== focus.file);
  const nextFile = buffers[Math.min(idx, buffers.length - 1)];
  let out: SimState = {
    ...s,
    buffers,
    alternate: s.alternate === focus.file ? null : s.alternate,
  };
  out = {
    ...out,
    layout: mapLeaf(out.layout, focus.id, (l) => ({ ...l, file: nextFile })),
  };
  return out;
}

function toggleExplorer(s: SimState): SimState {
  if (s.explorer.open) {
    return { ...s, explorer: { ...s.explorer, open: false, focused: false } };
  }
  return { ...s, explorer: { ...s.explorer, open: true, focused: true } };
}

function toggleTerminal(s: SimState): SimState {
  if (s.terminal.open) return { ...s, terminal: { open: false, focused: false } };
  return { ...s, terminal: { open: true, focused: true } };
}

export function handleSimKey(s: SimState, e: React.KeyboardEvent): SimState | null {
  const k = keyOf(e);
  if (["Shift", "Control", "Alt", "Meta", "CapsLock"].includes(e.key)) return null;

  /* picker context */
  if (s.picker) {
    const items = pickerItems(s);
    if (k === "Escape") return { ...s, picker: null };
    if (k === "↵" || e.key === "Enter") {
      const item = items[Math.min(s.picker.sel, items.length - 1)];
      if (!item) return { ...s, picker: null };
      let out = { ...s, picker: null };
      out = {
        ...out,
        explorer: { ...out.explorer, focused: false },
        terminal: { ...out.terminal, focused: false },
      };
      return setFile(out, item.file, item.line);
    }
    if (k === "C-j" || e.key === "ArrowDown")
      return {
        ...s,
        picker: { ...s.picker, sel: Math.min(s.picker.sel + 1, Math.max(items.length - 1, 0)) },
      };
    if (k === "C-k" || e.key === "ArrowUp")
      return { ...s, picker: { ...s.picker, sel: Math.max(s.picker.sel - 1, 0) } };
    if (e.key === "Backspace")
      return {
        ...s,
        picker: { ...s.picker, query: s.picker.query.slice(0, -1), sel: 0 },
      };
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey)
      return { ...s, picker: { ...s.picker, query: s.picker.query + e.key, sel: 0 } };
    return null;
  }

  /* leader sequence context */
  if (s.pending.length > 0) {
    const seq = s.pending.join(" ");
    const clear = { ...s, pending: [] as string[] };
    if (k === "Escape") return clear;
    if (seq === "SPC") {
      if (k === "SPC") return { ...clear, picker: { kind: "files", query: "", sel: 0 } };
      if (k === ",") return { ...clear, picker: { kind: "buffers", query: "", sel: 0 } };
      if (k === "/") return { ...clear, picker: { kind: "grep", query: "", sel: 0 } };
      if (k === "e") return toggleExplorer(clear);
      if (k === "`") {
        if (clear.alternate && clear.buffers.includes(clear.alternate))
          return setFile(clear, clear.alternate);
        return clear;
      }
      if (k === "|") return split(clear, "row");
      if (k === "-") return split(clear, "col");
      if (k === "b" || k === "f" || k === "w")
        return { ...s, pending: [...s.pending, k] };
      return clear;
    }
    if (seq === "SPC b") {
      if (k === "d") return deleteBuffer(clear);
      if (k === "o") {
        const focus = focusedLeaf(clear);
        return { ...clear, buffers: [focus.file], alternate: null };
      }
      return clear;
    }
    if (seq === "SPC f") {
      if (k === "f") return { ...clear, picker: { kind: "files", query: "", sel: 0 } };
      if (k === "r") return { ...clear, picker: { kind: "recent", query: "", sel: 0 } };
      return clear;
    }
    if (seq === "SPC w") {
      if (k === "d") return closeWindow(clear);
      return clear;
    }
    return clear;
  }

  /* explorer context */
  if (s.explorer.focused) {
    if (k === "j")
      return {
        ...s,
        explorer: { ...s.explorer, sel: Math.min(s.explorer.sel + 1, TREE_ORDER.length - 1) },
      };
    if (k === "k")
      return { ...s, explorer: { ...s.explorer, sel: Math.max(s.explorer.sel - 1, 0) } };
    if (e.key === "Enter") {
      const file = TREE_ORDER[s.explorer.sel];
      const out = { ...s, explorer: { ...s.explorer, focused: false } };
      return setFile(out, file);
    }
    if (k === "C-l") return navigate(s, "l");
    if (k === "SPC") return { ...s, pending: ["SPC"] };
    return null;
  }

  /* terminal context */
  if (s.terminal.focused) {
    if (k === "C-/") return toggleTerminal(s);
    if (k === "C-h" || k === "C-j" || k === "C-k" || k === "C-l")
      return navigate(s, k.slice(2) as "h" | "j" | "k" | "l");
    return null;
  }

  /* normal (editor) context */
  if (k === "SPC") return { ...s, pending: ["SPC"] };
  if (k === "L") return cycleBuffer(s, 1);
  if (k === "H") return cycleBuffer(s, -1);
  if (k === "C-/") return toggleTerminal(s);
  if (k === "C-h" || k === "C-j" || k === "C-k" || k === "C-l")
    return navigate(s, k.slice(2) as "h" | "j" | "k" | "l");
  return null;
}

/* ---------- rendering ---------- */

function basename(p: string): string {
  return p.split("/").pop() ?? p;
}

const EXT_COLORS: Record<string, string> = {
  tsx: "text-cyan",
  ts: "text-cyan",
  css: "text-purple",
  md: "text-green",
  html: "text-yellow",
  json: "text-yellow",
};

function FileDot({ file }: { file: string }) {
  const ext = file.split(".").pop() ?? "";
  return <span className={`${EXT_COLORS[ext] ?? "text-dim"}`}>●</span>;
}

function Pane({
  leaf,
  focused,
  singleWindow,
}: {
  leaf: WinLeaf;
  focused: boolean;
  singleWindow: boolean;
}) {
  const lines = PROJECT_FILES[leaf.file] ?? ["(empty)"];
  return (
    <div
      className={`flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-md border ${
        focused && !singleWindow ? "border-green/70" : "border-edge"
      }`}
    >
      <div className="flex-1 overflow-hidden bg-bg/60 px-2 py-1.5">
        {lines.map((ln, i) => (
          <div
            key={i}
            className={`flex gap-2 font-mono text-[11px] leading-relaxed ${
              leaf.highlightLine === i + 1 ? "bg-yellow/15" : ""
            }`}
          >
            <span className="w-4 shrink-0 text-right text-faint">{i + 1}</span>
            <span className="truncate text-dim">{ln || " "}</span>
          </div>
        ))}
      </div>
      <div
        className={`flex items-center gap-2 px-2 py-0.5 font-mono text-[10px] ${
          focused ? "bg-green/20 text-green" : "bg-panel2 text-faint"
        }`}
      >
        <span className="truncate">{leaf.file}</span>
      </div>
    </div>
  );
}

function LayoutView({
  node,
  focusId,
  singleWindow,
}: {
  node: WNode;
  focusId: number;
  singleWindow: boolean;
}) {
  if (node.kind === "leaf") {
    return <Pane leaf={node} focused={node.id === focusId} singleWindow={singleWindow} />;
  }
  return (
    <div
      className={`flex min-h-0 min-w-0 flex-1 gap-1 ${
        node.dir === "row" ? "flex-row" : "flex-col"
      }`}
    >
      <LayoutView node={node.a} focusId={focusId} singleWindow={singleWindow} />
      <LayoutView node={node.b} focusId={focusId} singleWindow={singleWindow} />
    </div>
  );
}

const PICKER_TITLES: Record<PickerKind, string> = {
  files: "Find Files",
  buffers: "Buffers",
  recent: "Recent Files",
  grep: "Grep",
};

interface WorkspaceSimProps {
  setup: LvSetup;
  onState?: (s: SimState) => void;
  onHandled?: () => void;
}

export default function WorkspaceSim({ setup, onState, onHandled }: WorkspaceSimProps) {
  const [state, setState] = useState<SimState>(() => buildState(setup));
  const hostRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);
  stateRef.current = state;
  const stateCb = useRef(onState);
  stateCb.current = onState;
  const handledCb = useRef(onHandled);
  handledCb.current = onHandled;

  useEffect(() => {
    hostRef.current?.focus();
  }, []);

  useEffect(() => {
    stateCb.current?.(state);
  }, [state]);

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    const next = handleSimKey(stateRef.current, e);
    if (next) {
      e.preventDefault();
      handledCb.current?.();
      setState(next);
      return;
    }
    // Swallow keys that would scroll/navigate the page anyway.
    if ([" ", "ArrowDown", "ArrowUp", "Tab"].includes(e.key)) e.preventDefault();
  }, []);

  const items = useMemo(() => pickerItems(state), [state]);
  const whichKey = state.pending.length
    ? WHICH_KEY[state.pending.join(" ")]
    : null;
  const focus = focusedLeaf(state);
  const singleWindow =
    leavesOf(state.layout).length === 1 &&
    !state.explorer.open &&
    !state.terminal.open;

  const context = state.picker
    ? "PICKER"
    : state.explorer.focused
    ? "EXPLORER"
    : state.terminal.focused
    ? "TERMINAL"
    : "NORMAL";

  return (
    <div
      ref={hostRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onClick={() => hostRef.current?.focus()}
      className="relative flex h-[380px] cursor-default flex-col outline-none"
    >
      {/* bufferline */}
      <div className="flex items-center gap-0.5 overflow-hidden border-b border-edge bg-panel2 px-1 pt-1">
        {state.buffers.map((b) => (
          <span
            key={b}
            className={`flex items-center gap-1.5 rounded-t-md px-2.5 py-1 font-mono text-[11px] ${
              b === focus.file
                ? "bg-bg text-fg"
                : "text-faint"
            }`}
          >
            <FileDot file={b} />
            {basename(b)}
          </span>
        ))}
      </div>

      {/* main area */}
      <div className="flex min-h-0 flex-1 gap-1 bg-bg p-1">
        {state.explorer.open && (
          <div
            className={`flex w-40 shrink-0 flex-col overflow-hidden rounded-md border ${
              state.explorer.focused ? "border-green/70" : "border-edge"
            } bg-panel`}
          >
            <div className="border-b border-edge px-2 py-1 font-mono text-[10px] tracking-widest text-faint">
              EXPLORER
            </div>
            <div className="flex-1 overflow-hidden py-1">
              {TREE_ORDER.map((f, i) => (
                <div
                  key={f}
                  className={`flex items-center gap-1.5 px-2 py-[1px] font-mono text-[11px] ${
                    i === state.explorer.sel && state.explorer.focused
                      ? "bg-green/20 text-fg"
                      : "text-dim"
                  }`}
                >
                  <FileDot file={f} />
                  <span className="truncate">{f}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-1">
          <div className="flex min-h-0 flex-1 gap-1">
            <LayoutView
              node={state.layout}
              focusId={state.explorer.focused || state.terminal.focused ? -99 : state.focusId}
              singleWindow={singleWindow}
            />
          </div>
          {state.terminal.open && (
            <div
              className={`h-20 shrink-0 overflow-hidden rounded-md border ${
                state.terminal.focused ? "border-green/70" : "border-edge"
              } bg-bg/80 px-2 py-1.5 font-mono text-[11px]`}
            >
              <div className="text-green">
                ❯ npm run dev
              </div>
              <div className="text-dim">ready in 230ms — waiting for changes…</div>
              <div className="text-fg">
                ❯ <span className="cursor-blink">▊</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* picker overlay */}
      {state.picker && (
        <div className="absolute inset-0 z-10 flex items-start justify-center bg-bg/70 pt-10 backdrop-blur-[2px]">
          <div className="w-[420px] max-w-[90%] overflow-hidden rounded-lg border border-edge bg-panel shadow-2xl">
            <div className="flex items-center gap-2 border-b border-edge px-3 py-2 font-mono text-xs">
              <span className="text-green">{PICKER_TITLES[state.picker.kind]}</span>
              <span className="text-faint">❯</span>
              <span className="text-fg">
                {state.picker.query}
                <span className="cursor-blink text-green">▊</span>
              </span>
            </div>
            <div className="max-h-48 overflow-hidden py-1">
              {items.length === 0 && (
                <div className="px-3 py-1.5 font-mono text-[11px] text-faint">
                  {state.picker.kind === "grep" && !state.picker.query
                    ? "type to search file contents…"
                    : "no matches"}
                </div>
              )}
              {items.slice(0, 8).map((it, i) => (
                <div
                  key={`${it.label}-${i}`}
                  className={`flex items-baseline gap-2 px-3 py-1 font-mono text-[11px] ${
                    i === state.picker!.sel ? "bg-green/20 text-fg" : "text-dim"
                  }`}
                >
                  <FileDot file={it.file} />
                  <span>{it.label}</span>
                  {it.detail && <span className="truncate text-faint">{it.detail}</span>}
                </div>
              ))}
            </div>
            <div className="border-t border-edge px-3 py-1 font-mono text-[10px] text-faint">
              type to filter · C-j/C-k move · ↵ open · esc close
            </div>
          </div>
        </div>
      )}

      {/* which-key popup */}
      {whichKey && (
        <div className="absolute bottom-8 right-2 z-10 w-56 overflow-hidden rounded-lg border border-edge bg-panel shadow-2xl">
          <div className="border-b border-edge px-3 py-1 font-mono text-[10px] tracking-widest text-faint">
            {state.pending.join(" ")} —
          </div>
          <div className="grid grid-cols-1 gap-0.5 p-2">
            {whichKey.map(([k, label]) => (
              <div key={k} className="flex items-baseline gap-2 font-mono text-[11px]">
                <span className="w-8 text-right text-green">{k}</span>
                <span className="text-faint">→</span>
                <span className="text-dim">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* sim statusline */}
      <div className="flex items-center gap-3 border-t border-edge bg-panel2 px-2 py-1 font-mono text-[10px]">
        <span
          className={`rounded px-1.5 font-bold ${
            context === "NORMAL"
              ? "bg-green text-bg"
              : context === "PICKER"
              ? "bg-cyan text-bg"
              : "bg-purple text-bg"
          }`}
        >
          {context}
        </span>
        {state.pending.length > 0 && (
          <span className="text-yellow">{state.pending.join(" ")} …</span>
        )}
        <span className="ml-auto text-faint">
          {state.buffers.length} buffer{state.buffers.length === 1 ? "" : "s"} ·{" "}
          {leavesOf(state.layout).length} window
          {leavesOf(state.layout).length === 1 ? "" : "s"}
        </span>
      </div>
    </div>
  );
}
