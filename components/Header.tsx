import Link from "next/link";
import { GITHUB_URL } from "@/lib/site";

export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-edge bg-bg/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
        <Link
          href="/"
          className="font-mono text-sm font-bold text-green transition hover:brightness-110"
        >
          ~/vim-dojo<span className="cursor-blink">▊</span>
        </Link>
        <nav className="ml-auto flex items-center gap-5 font-mono text-sm">
          <Link href="/" className="text-dim transition hover:text-fg">
            train
          </Link>
          <Link
            href="/playground"
            className="text-dim transition hover:text-fg"
          >
            playground
          </Link>
          <Link
            href="/cheatsheet"
            className="text-dim transition hover:text-fg"
          >
            cheatsheet
          </Link>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-dim transition hover:text-fg"
          >
            github ↗
          </a>
        </nav>
      </div>
    </header>
  );
}
