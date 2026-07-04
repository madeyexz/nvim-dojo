"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import VimEditor from "@/components/VimEditor";
import Keycap, { KeycapRow } from "@/components/Keycap";
import Stars from "@/components/Stars";
import { modules, parseMarkers, type VimModule } from "@/lib/lessons";
import { starsFor, useProgress } from "@/lib/progress";

const MODIFIER_KEYS = new Set([
  "Shift",
  "Control",
  "Alt",
  "Meta",
  "CapsLock",
  "Fn",
  "Dead",
]);

function displayKey(e: React.KeyboardEvent): string {
  let k = e.key;
  if (k === " ") k = "␣";
  else if (k === "Escape") k = "esc";
  else if (k === "Enter") k = "↵";
  else if (k === "Backspace") k = "⌫";
  else if (k === "Tab") k = "⇥";
  else if (k === "ArrowLeft") k = "←";
  else if (k === "ArrowRight") k = "→";
  else if (k === "ArrowUp") k = "↑";
  else if (k === "ArrowDown") k = "↓";
  if (e.ctrlKey && k.length === 1) k = `C-${k}`;
  return k;
}

const MODE_STYLES: Record<string, string> = {
  normal: "bg-green text-bg",
  insert: "bg-cyan text-bg",
  visual: "bg-purple text-bg",
  "v-line": "bg-purple text-bg",
  replace: "bg-red text-bg",
};

export default function ChallengeRunner({ mod }: { mod: VimModule }) {
  const [idx, setIdx] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [keys, setKeys] = useState<string[]>([]);
  const [mode, setMode] = useState("normal");
  const [done, setDone] = useState(false);
  const [moduleDone, setModuleDone] = useState(false);
  const [warn, setWarn] = useState(false);
  const [showSol, setShowSol] = useState(false);
  const [arrowNudge, setArrowNudge] = useState(false);
  const [earned, setEarned] = useState(0);
  const { progress, record } = useProgress();

  const ch = mod.challenges[idx];
  const parsed = useMemo(() => parseMarkers(ch.raw), [ch]);
  const isCursorGoal = ch.goalText == null;

  const doneRef = useRef(done);
  doneRef.current = done;
  const moduleDoneRef = useRef(moduleDone);
  moduleDoneRef.current = moduleDone;
  const keysRef = useRef(0);

  const complete = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setDone(true);
    const used = keysRef.current;
    const stars = starsFor(used, ch.par);
    setEarned(stars);
    record(ch.id, stars, used);
  }, [ch, record]);

  const handleUpdate = useCallback(
    (doc: string, cursor: number) => {
      if (doneRef.current) return;
      if (isCursorGoal) {
        const changed = doc !== parsed.text;
        setWarn(changed);
        if (!changed && parsed.target != null && cursor === parsed.target) {
          complete();
        }
      } else if (doc === ch.goalText) {
        complete();
      }
    },
    [ch, parsed, isCursorGoal, complete]
  );

  const goTo = useCallback((nextIdx: number) => {
    setIdx(nextIdx);
    setKeys([]);
    keysRef.current = 0;
    doneRef.current = false;
    setDone(false);
    setWarn(false);
    setShowSol(false);
    setArrowNudge(false);
    setMode("normal");
  }, []);

  const advance = useCallback(() => {
    if (idx + 1 >= mod.challenges.length) {
      doneRef.current = false;
      setDone(false);
      setModuleDone(true);
    } else {
      goTo(idx + 1);
    }
  }, [idx, mod, goTo]);

  const reset = useCallback(() => {
    setAttempt((a) => a + 1);
    setKeys([]);
    keysRef.current = 0;
    doneRef.current = false;
    setDone(false);
    setWarn(false);
    setArrowNudge(false);
    setMode("normal");
  }, []);

  // Enter advances past the success overlay even if the editor lost focus.
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Enter" && doneRef.current) {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [advance]);

  const onKeyDownCapture = (e: React.KeyboardEvent) => {
    if (doneRef.current || moduleDoneRef.current) {
      e.preventDefault();
      e.stopPropagation();
      if (e.key === "Enter") advance();
      return;
    }
    if (MODIFIER_KEYS.has(e.key)) return;
    if (e.key.startsWith("Arrow")) setArrowNudge(true);
    const d = displayKey(e);
    setKeys((k) => {
      const next = [...k, d];
      keysRef.current = next.length;
      return next;
    });
  };

  const nextModule = modules.find((m) => m.num === mod.num + 1);
  const moduleStars = mod.challenges.reduce(
    (n, c) => n + (progress[c.id]?.stars ?? 0),
    0
  );

  if (moduleDone) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-6 py-20 text-center">
        <div className="text-5xl">🥋</div>
        <h1 className="font-mono text-3xl font-bold text-fg">
          {mod.title} complete
        </h1>
        <p className="text-dim">
          You earned{" "}
          <span className="font-mono text-yellow">{moduleStars}</span> of{" "}
          <span className="font-mono">{mod.challenges.length * 3}</span> stars.
          Replay any drill to golf your key count down to par.
        </p>
        <div className="flex gap-3">
          {nextModule ? (
            <Link
              href={`/learn/${nextModule.id}`}
              className="rounded-lg bg-green px-5 py-2.5 font-mono text-sm font-semibold text-bg transition hover:brightness-110"
            >
              Next: {nextModule.title} →
            </Link>
          ) : (
            <Link
              href="/playground"
              className="rounded-lg bg-green px-5 py-2.5 font-mono text-sm font-semibold text-bg transition hover:brightness-110"
            >
              Free practice →
            </Link>
          )}
          <Link
            href="/"
            className="rounded-lg border border-edge px-5 py-2.5 font-mono text-sm text-dim transition hover:text-fg"
          >
            Back to dojo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Top bar */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <Link
          href="/"
          className="font-mono text-sm text-dim transition hover:text-green"
        >
          ← dojo
        </Link>
        <h1 className="font-mono text-lg font-bold text-fg">
          <span className="text-faint">
            {String(mod.num).padStart(2, "0")}.
          </span>{" "}
          {mod.title}
        </h1>
        <div className="ml-auto flex items-center gap-1.5">
          {mod.challenges.map((c, i) => {
            const doneBefore = progress[c.id] != null;
            return (
              <span
                key={c.id}
                title={c.title}
                className={`h-2.5 w-2.5 rounded-full transition ${
                  i === idx
                    ? "bg-green ring-2 ring-green/40"
                    : doneBefore
                    ? "bg-green/60"
                    : "bg-edge"
                }`}
              />
            );
          })}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
        {/* Instruction panel */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-edge bg-panel p-5">
            <div className="mb-2 font-mono text-xs tracking-widest text-faint">
              DRILL {idx + 1}/{mod.challenges.length}
            </div>
            <h2 className="mb-2 text-lg font-semibold text-fg">{ch.title}</h2>
            {ch.hint && <p className="text-sm leading-relaxed text-dim">{ch.hint}</p>}

            {isCursorGoal ? (
              <div className="mt-4 rounded-lg border border-yellow/30 bg-yellow/10 px-3 py-2 text-sm text-yellow">
                Land the cursor on the{" "}
                <span className="rounded bg-yellow/30 px-1 font-mono">
                  highlighted
                </span>{" "}
                character.
              </div>
            ) : (
              <div className="mt-4">
                <div className="mb-1.5 font-mono text-xs tracking-widest text-faint">
                  TARGET BUFFER
                </div>
                <pre className="overflow-x-auto rounded-lg border border-green/25 bg-bg px-3 py-2.5 font-mono text-[13px] leading-relaxed text-green">
                  {ch.goalText}
                </pre>
              </div>
            )}

            <div className="mt-4 flex items-center gap-3 font-mono text-sm">
              <span className="text-faint">par</span>
              <span className="text-yellow">{ch.par} keys</span>
              {progress[ch.id] && (
                <>
                  <span className="text-faint">· best</span>
                  <span className="text-green">{progress[ch.id].bestKeys}</span>
                </>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={reset}
                className="rounded-md border border-edge px-3 py-1.5 font-mono text-xs text-dim transition hover:border-faint hover:text-fg"
              >
                ⟲ reset
              </button>
              <button
                onClick={() => setShowSol((s) => !s)}
                className="rounded-md border border-edge px-3 py-1.5 font-mono text-xs text-dim transition hover:border-faint hover:text-fg"
              >
                {showSol ? "hide" : "peek"} solution
              </button>
              <button
                onClick={() => (idx + 1 >= mod.challenges.length ? setModuleDone(true) : goTo(idx + 1))}
                className="rounded-md border border-edge px-3 py-1.5 font-mono text-xs text-dim transition hover:border-faint hover:text-fg"
              >
                skip →
              </button>
            </div>

            {showSol && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-edge bg-panel2 px-3 py-2">
                <KeycapRow keys={ch.solution} />
              </div>
            )}
          </div>

          <div className="rounded-xl border border-edge bg-panel p-5">
            <div className="mb-3 font-mono text-xs tracking-widest text-faint">
              THIS MODULE
            </div>
            <ul className="flex flex-col gap-2">
              {mod.keys.map((k) => (
                <li key={k.key} className="flex items-baseline gap-3 text-sm">
                  <Keycap k={k.key} />
                  <span className="text-dim">{k.desc}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Editor panel */}
        <div className="flex flex-col gap-3">
          <div
            className="relative overflow-hidden rounded-xl border border-edge bg-panel"
            onKeyDownCapture={onKeyDownCapture}
          >
            <div className="flex items-center gap-2 border-b border-edge bg-panel2 px-4 py-2">
              <span className="h-3 w-3 rounded-full bg-red/70" />
              <span className="h-3 w-3 rounded-full bg-yellow/70" />
              <span className="h-3 w-3 rounded-full bg-green/70" />
              <span className="ml-2 font-mono text-xs text-faint">
                drill.txt — click to focus, then keyboard only
              </span>
            </div>

            <VimEditor
              key={`${ch.id}:${attempt}`}
              text={parsed.text}
              startOffset={parsed.start}
              targetOffset={isCursorGoal ? parsed.target : null}
              onDocUpdate={handleUpdate}
              onModeChange={setMode}
            />

            {/* Statusline */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-edge bg-panel2 px-3 py-1.5 font-mono text-xs">
              <span
                className={`rounded px-2 py-0.5 font-bold uppercase ${
                  MODE_STYLES[mode] ?? "bg-edge text-fg"
                }`}
              >
                {mode === "v-line" ? "V-LINE" : mode}
              </span>
              <span className="text-dim">
                keys{" "}
                <span
                  className={
                    keys.length > ch.par ? "text-red" : "text-green"
                  }
                >
                  {keys.length}
                </span>
                <span className="text-faint"> / par {ch.par}</span>
              </span>
              <span className="ml-auto flex max-w-full items-center gap-1 overflow-hidden">
                {keys.slice(-10).map((k, i) => (
                  <kbd key={`${i}-${k}`} className="kc kc-sm">
                    {k}
                  </kbd>
                ))}
              </span>
            </div>

            {/* Success overlay */}
            {done && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-bg/85 backdrop-blur-sm">
                <Stars n={earned} className="text-3xl" />
                <div className="font-mono text-2xl font-bold text-green">
                  {earned === 3 ? "perfect!" : earned === 2 ? "solid!" : "done!"}
                </div>
                <div className="font-mono text-sm text-dim">
                  {keysRef.current} keys · par {ch.par}
                </div>
                <div className="mt-1 flex items-center gap-2 rounded-lg border border-edge bg-panel px-3 py-2">
                  <span className="font-mono text-xs text-faint">par play:</span>
                  <KeycapRow keys={ch.solution} />
                </div>
                <div className="mt-2 font-mono text-xs text-faint">
                  press <kbd className="kc kc-sm">↵</kbd> to continue
                </div>
              </div>
            )}
          </div>

          {warn && (
            <div className="rounded-lg border border-red/40 bg-red/10 px-3 py-2 font-mono text-xs text-red">
              The text changed — this drill only needs cursor movement. Press{" "}
              <kbd className="kc kc-sm">u</kbd> to undo, or reset.
            </div>
          )}
          {arrowNudge && !done && (
            <div className="rounded-lg border border-yellow/40 bg-yellow/10 px-3 py-2 font-mono text-xs text-yellow">
              Arrow keys work… but <kbd className="kc kc-sm">h</kbd>
              <kbd className="kc kc-sm">j</kbd>
              <kbd className="kc kc-sm">k</kbd>
              <kbd className="kc kc-sm">l</kbd> is the muscle memory you came
              here to build.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
