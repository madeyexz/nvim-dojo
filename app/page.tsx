import Link from "next/link";
import LazyVimGrid from "@/components/LazyVimGrid";
import ModuleGrid from "@/components/ModuleGrid";
import { KeycapRow } from "@/components/Keycap";
import { modules, totalChallenges } from "@/lib/lessons";
import { totalLvChallenges } from "@/lib/lazyvim";

export default function Home() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-20 text-center">
        <h1 className="font-mono text-5xl font-bold tracking-tight text-fg sm:text-6xl">
          nvim<span className="text-green">dojo</span>
          <span className="cursor-blink text-green">▊</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-dim">
          Stop pecking at arrow keys. Short, scored drills that burn Neovim
          motions into your fingers — right in the browser, nothing to
          install.
        </p>
        <div className="mt-6 flex items-center justify-center gap-2 font-mono text-sm text-faint">
          <span>{modules.length + 4} modules</span>
          <span>·</span>
          <span>{totalChallenges + totalLvChallenges} drills</span>
          <span>·</span>
          <span>par scores to golf</span>
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/learn/basics"
            className="rounded-lg bg-green px-6 py-3 font-mono text-sm font-semibold text-bg transition hover:brightness-110"
          >
            start training →
          </Link>
          <Link
            href="#lazyvim"
            className="rounded-lg border border-purple/50 px-6 py-3 font-mono text-sm text-purple transition hover:bg-purple/10"
          >
            I use LazyVim →
          </Link>
          <Link
            href="/playground"
            className="rounded-lg border border-edge px-6 py-3 font-mono text-sm text-dim transition hover:border-faint hover:text-fg"
          >
            free playground
          </Link>
        </div>
        <div className="mx-auto mt-12 flex max-w-md items-center justify-center gap-3 rounded-xl border border-edge bg-panel px-5 py-4">
          <span className="font-mono text-xs text-faint">the whole idea:</span>
          <KeycapRow keys={["h", "j", "k", "l"]} />
          <span className="font-mono text-xs text-faint">
            until you stop thinking about it
          </span>
        </div>
        <p className="mx-auto mt-6 max-w-xl text-sm text-faint">
          Everything drilled here is Neovim&apos;s core editing grammar — it
          transfers keystroke-for-keystroke. When you&apos;re ready,{" "}
          <Link href="/nvim" className="text-green underline-offset-4 hover:underline">
            set up the real thing →
          </Link>
        </p>
      </section>
      <ModuleGrid />
      <LazyVimGrid />
    </>
  );
}
