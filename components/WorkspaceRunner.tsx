"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import WorkspaceSim, { checkGoal, type SimState } from "@/components/WorkspaceSim";
import Keycap, { KeycapRow } from "@/components/Keycap";
import Stars from "@/components/Stars";
import { lvModules, type LvModule } from "@/lib/lazyvim";
import { starsFor, useProgress } from "@/lib/progress";

const MODIFIER_KEYS = new Set(["Shift", "Control", "Alt", "Meta", "CapsLock"]);

function displayKey(e: React.KeyboardEvent): string {
  let k = e.key;
  if (k === " ") k = "SPC";
  else if (k === "Escape") k = "esc";
  else if (k === "Enter") k = "↵";
  else if (k === "Backspace") k = "⌫";
  else if (k === "ArrowDown") k = "↓";
  else if (k === "ArrowUp") k = "↑";
  if (e.ctrlKey && k.length <= 3 && k !== "SPC") k = `C-${e.key.toLowerCase()}`;
  return k;
}

export default function WorkspaceRunner({ mod }: { mod: LvModule }) {
  const [idx, setIdx] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [keys, setKeys] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [moduleDone, setModuleDone] = useState(false);
  const [showSol, setShowSol] = useState(false);
  const [earned, setEarned] = useState(0);
  const { progress, record } = useProgress();

  const ch = mod.challenges[idx];

  const doneRef = useRef(done);
  doneRef.current = done;
  const moduleDoneRef = useRef(moduleDone);
  moduleDoneRef.current = moduleDone;
  const keysRef = useRef(0);
  // Ignore the initial onState call fired for the setup state.
  const armedRef = useRef(false);

  const complete = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setDone(true);
    const used = keysRef.current;
    const stars = starsFor(used, ch.par);
    setEarned(stars);
    record(ch.id, stars, used);
  }, [ch, record]);

  const handleState = useCallback(
    (s: SimState) => {
      if (!armedRef.current) {
        armedRef.current = true;
        return;
      }
      if (doneRef.current) return;
      if (checkGoal(s, ch.goal)) complete();
    },
    [ch, complete]
  );

  const goTo = useCallback((nextIdx: number) => {
    setIdx(nextIdx);
    setKeys([]);
    keysRef.current = 0;
    doneRef.current = false;
    armedRef.current = false;
    setDone(false);
    setShowSol(false);
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
    armedRef.current = false;
    setDone(false);
  }, []);

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
    const d = displayKey(e);
    setKeys((k) => {
      const next = [...k, d];
      keysRef.current = next.length;
      return next;
    });
  };

  const nextModule = lvModules.find((m) => m.num === mod.num + 1);
  const moduleStars = mod.challenges.reduce(
    (n, c) => n + (progress[c.id]?.stars ?? 0),
    0
  );

  if (moduleDone) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-6 py-20 text-center">
        <div className="text-5xl">💤</div>
        <h1 className="font-mono text-3xl font-bold text-fg">
          {mod.title} complete
        </h1>
        <p className="text-dim">
          You earned{" "}
          <span className="font-mono text-yellow">{moduleStars}</span> of{" "}
          <span className="font-mono">{mod.challenges.length * 3}</span> stars.
          These keys pay off hundreds of times a day — replay until par feels
          slow.
        </p>
        <div className="flex gap-3">
          {nextModule ? (
            <Link
              href={`/lazyvim/${nextModule.id}`}
              className="rounded-lg bg-purple px-5 py-2.5 font-mono text-sm font-semibold text-bg transition hover:brightness-110"
            >
              Next: {nextModule.title} →
            </Link>
          ) : (
            <Link
              href="/"
              className="rounded-lg bg-purple px-5 py-2.5 font-mono text-sm font-semibold text-bg transition hover:brightness-110"
            >
              Back to the dojo →
            </Link>
          )}
          <Link
            href="/"
            className="rounded-lg border border-edge px-5 py-2.5 font-mono text-sm text-dim transition hover:text-fg"
          >
            home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <Link
          href="/"
          className="font-mono text-sm text-dim transition hover:text-purple"
        >
          ← dojo
        </Link>
        <h1 className="font-mono text-lg font-bold text-fg">
          <span className="text-purple">lazyvim</span>{" "}
          <span className="text-faint">
            {String(mod.num).padStart(2, "0")}.
          </span>{" "}
          {mod.title}
        </h1>
        <div className="ml-auto flex items-center gap-1.5">
          {mod.challenges.map((c, i) => (
            <span
              key={c.id}
              title={c.title}
              className={`h-2.5 w-2.5 rounded-full transition ${
                i === idx
                  ? "bg-purple ring-2 ring-purple/40"
                  : progress[c.id]
                  ? "bg-purple/60"
                  : "bg-edge"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
        {/* instruction panel */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-edge bg-panel p-5">
            <div className="mb-2 font-mono text-xs tracking-widest text-faint">
              DRILL {idx + 1}/{mod.challenges.length}
            </div>
            <h2 className="mb-2 text-lg font-semibold text-fg">{ch.title}</h2>
            {ch.hint && (
              <p className="text-sm leading-relaxed text-dim">{ch.hint}</p>
            )}
            <div className="mt-4 rounded-lg border border-purple/30 bg-purple/10 px-3 py-2 text-sm text-purple">
              {ch.goalLabel}
            </div>
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
                onClick={() =>
                  idx + 1 >= mod.challenges.length
                    ? setModuleDone(true)
                    : goTo(idx + 1)
                }
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

        {/* simulator panel */}
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
                lazyvim — simulated workspace, real keymaps
              </span>
            </div>

            <WorkspaceSim
              key={`${ch.id}:${attempt}`}
              setup={ch.setup}
              onState={handleState}
            />

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-edge bg-panel2 px-3 py-1.5 font-mono text-xs">
              <span className="text-dim">
                keys{" "}
                <span className={keys.length > ch.par ? "text-red" : "text-green"}>
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

            {done && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-bg/85 backdrop-blur-sm">
                <Stars n={earned} className="text-3xl" />
                <div className="font-mono text-2xl font-bold text-purple">
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

          <div className="rounded-lg border border-edge bg-panel px-3 py-2 font-mono text-xs text-faint">
            <span className="text-purple">SPC</span> is the leader key — press
            it and watch the which-key hints appear, exactly like LazyVim.
          </div>
        </div>
      </div>
    </div>
  );
}
