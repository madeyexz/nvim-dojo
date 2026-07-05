import Keycap from "@/components/Keycap";
import { extraCheats, modules } from "@/lib/lessons";

export const metadata = { title: "Cheatsheet" };

export default function CheatsheetPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-2 font-mono text-2xl font-bold text-fg">cheatsheet</h1>
      <p className="mb-8 max-w-2xl text-sm text-dim">
        Every key taught in the dojo, plus a few that are worth knowing once
        the basics are reflex. All of it works identically in Neovim — see the{" "}
        <a href="/nvim" className="text-green underline-offset-4 hover:underline">
          real nvim guide
        </a>{" "}
        for the LSP-powered keys (gd, K, grr, grn) that come next.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((m) => (
          <section
            key={m.id}
            className="rounded-xl border border-edge bg-panel p-5"
          >
            <h2 className="mb-3 font-mono text-sm font-bold text-green">
              {String(m.num).padStart(2, "0")}. {m.title}
            </h2>
            <ul className="flex flex-col gap-2">
              {m.keys.map((k) => (
                <li key={k.key} className="flex items-baseline gap-3 text-sm">
                  <Keycap k={k.key} />
                  <span className="text-dim">{k.desc}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
        <section className="rounded-xl border border-yellow/30 bg-panel p-5">
          <h2 className="mb-3 font-mono text-sm font-bold text-yellow">
            ★ beyond the dojo
          </h2>
          <ul className="flex flex-col gap-2">
            {extraCheats.map((k) => (
              <li key={k.key} className="flex items-baseline gap-3 text-sm">
                <Keycap k={k.key} />
                <span className="text-dim">{k.desc}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
