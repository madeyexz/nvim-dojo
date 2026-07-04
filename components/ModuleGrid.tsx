"use client";

import Link from "next/link";
import Keycap from "@/components/Keycap";
import { modules } from "@/lib/lessons";
import { useProgress } from "@/lib/progress";

export default function ModuleGrid() {
  const { progress, loaded } = useProgress();

  const firstUnfinished =
    modules.find((m) => m.challenges.some((c) => !progress[c.id])) ??
    modules[0];

  return (
    <section id="modules" className="mx-auto max-w-6xl px-4 pb-24">
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <h2 className="font-mono text-xl font-bold text-fg">
          training modules
        </h2>
        {loaded && (
          <Link
            href={`/learn/${firstUnfinished.id}`}
            className="ml-auto rounded-lg bg-green px-4 py-2 font-mono text-sm font-semibold text-bg transition hover:brightness-110"
          >
            continue → {firstUnfinished.title}
          </Link>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((m) => {
          const total = m.challenges.length;
          const completed = m.challenges.filter((c) => progress[c.id]).length;
          const stars = m.challenges.reduce(
            (n, c) => n + (progress[c.id]?.stars ?? 0),
            0
          );
          const pct = Math.round((completed / total) * 100);
          const mastered = stars === total * 3;
          return (
            <Link
              key={m.id}
              href={`/learn/${m.id}`}
              className="group flex flex-col gap-3 rounded-xl border border-edge bg-panel p-5 transition hover:border-green/50 hover:bg-panel2"
            >
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-sm text-faint">
                  {String(m.num).padStart(2, "0")}
                </span>
                <span className="font-mono font-bold text-fg transition group-hover:text-green">
                  {m.title}
                </span>
                {mastered && <span title="all stars earned">🏆</span>}
              </div>
              <p className="text-sm text-dim">{m.tagline}</p>
              <div className="flex flex-wrap gap-1.5">
                {m.keys.slice(0, 5).map((k) => (
                  <Keycap key={k.key} k={k.key} />
                ))}
              </div>
              <div className="mt-auto flex items-center gap-3 pt-1">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-edge">
                  <div
                    className="h-full rounded-full bg-green transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="font-mono text-xs text-faint">
                  {completed}/{total}
                </span>
                {stars > 0 && (
                  <span className="font-mono text-xs text-yellow">
                    ★{stars}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
