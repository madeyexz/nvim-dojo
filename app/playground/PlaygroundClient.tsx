"use client";

import { useState } from "react";
import VimEditor from "@/components/VimEditor";

const SAMPLE = `Welcome to the playground.

Everything is fair game here: move with h j k l,
hop words with w b e, snipe with f and t,
slice with d c x, and paste with p.
Nothing here can break. Reset any time.

function fibonacci(n) {
  if (n < 2) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
}

- try ciw on this word: refactor
- try di( here: keep(remove me)
- try 3f; on this: a; b; c; d;
- try * on the word fibonacci above

The quick brown fox jumps over the lazy dog.
THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG.`;

const MODE_STYLES: Record<string, string> = {
  normal: "bg-green text-bg",
  insert: "bg-cyan text-bg",
  visual: "bg-purple text-bg",
  "v-line": "bg-purple text-bg",
  replace: "bg-red text-bg",
};

export default function PlaygroundClient() {
  const [mode, setMode] = useState("normal");
  const [session, setSession] = useState(0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <h1 className="font-mono text-2xl font-bold text-fg">playground</h1>
        <p className="text-sm text-dim">
          A scratch buffer with full vim emulation. Experiment freely.
        </p>
        <button
          onClick={() => {
            setSession((s) => s + 1);
            setMode("normal");
          }}
          className="ml-auto rounded-md border border-edge px-3 py-1.5 font-mono text-xs text-dim transition hover:border-faint hover:text-fg"
        >
          ⟲ reset buffer
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-edge bg-panel">
        <div className="flex items-center gap-2 border-b border-edge bg-panel2 px-4 py-2">
          <span className="h-3 w-3 rounded-full bg-red/70" />
          <span className="h-3 w-3 rounded-full bg-yellow/70" />
          <span className="h-3 w-3 rounded-full bg-green/70" />
          <span className="ml-2 font-mono text-xs text-faint">
            scratch.txt
          </span>
        </div>
        <VimEditor
          key={session}
          text={SAMPLE}
          startOffset={0}
          onModeChange={setMode}
          minHeightClass="min-h-[420px]"
        />
        <div className="flex items-center gap-4 border-t border-edge bg-panel2 px-3 py-1.5 font-mono text-xs">
          <span
            className={`rounded px-2 py-0.5 font-bold uppercase ${
              MODE_STYLES[mode] ?? "bg-edge text-fg"
            }`}
          >
            {mode === "v-line" ? "V-LINE" : mode}
          </span>
          <span className="text-faint">
            u undoes anything · Esc always gets you home
          </span>
        </div>
      </div>
    </div>
  );
}
