import Link from "next/link";
import Keycap from "@/components/Keycap";

export const metadata = { title: "Real Neovim setup" };

function Code({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg border border-edge bg-bg px-4 py-3 font-mono text-[13px] leading-relaxed text-fg">
      {children}
    </pre>
  );
}

function Section({
  num,
  title,
  children,
}: {
  num: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-edge bg-panel p-6">
      <h2 className="mb-4 font-mono text-lg font-bold text-fg">
        <span className="text-faint">{num}.</span>{" "}
        <span className="text-green">{title}</span>
      </h2>
      <div className="flex flex-col gap-4 text-sm leading-relaxed text-dim">
        {children}
      </div>
    </section>
  );
}

export default function NvimPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-2 font-mono text-2xl font-bold text-fg">
        from dojo to real neovim
      </h1>
      <p className="mb-8 max-w-2xl text-sm text-dim">
        Every motion you drilled here works identically in Neovim — the
        dojo <em>is</em> Neovim&apos;s editing grammar. This page is the bridge: get
        nvim installed, configured, and comfortable in about an hour.
      </p>

      <div className="flex flex-col gap-5">
        <Section num="01" title="install">
          <p>Grab a current Neovim (0.10+; 0.11+ recommended):</p>
          <Code>{`# macOS
brew install neovim

# Windows
winget install Neovim.Neovim

# Ubuntu/Debian (apt is often outdated — prefer the appimage or snap)
sudo snap install nvim --classic

# Arch
sudo pacman -S neovim`}</Code>
          <p>
            Then check it: <span className="font-mono text-fg">nvim --version</span>.
            Open it with <span className="font-mono text-fg">nvim</span>, quit
            with <span className="font-mono text-fg">:q</span> — congrats, you
            already know the famous hard part.
          </p>
        </Section>

        <Section num="02" title="first run">
          <p>Two built-in commands are your friends on day one:</p>
          <ul className="flex list-disc flex-col gap-2 pl-5">
            <li>
              <span className="font-mono text-fg">:Tutor</span> — Neovim&apos;s
              interactive tutorial. It covers the same ground as the dojo
              (you&apos;ll fly through it now) plus saving, files, and help.
            </li>
            <li>
              <span className="font-mono text-fg">:checkhealth</span> — tells
              you exactly what&apos;s missing or misconfigured. Run it whenever
              something feels broken.
            </li>
          </ul>
          <p>
            Also learn <span className="font-mono text-fg">:help</span> — e.g.{" "}
            <span className="font-mono text-fg">:help text-objects</span>.
            Neovim&apos;s docs are genuinely excellent.
          </p>
        </Section>

        <Section num="03" title="a minimal init.lua">
          <p>
            Neovim is configured in Lua at{" "}
            <span className="font-mono text-fg">~/.config/nvim/init.lua</span>{" "}
            (Windows: <span className="font-mono text-fg">~/AppData/Local/nvim/init.lua</span>).
            This starter makes nvim pleasant without any plugins:
          </p>
          <Code>{`-- leader key: press <Space> before custom shortcuts
vim.g.mapleader = " "

-- sane defaults
vim.o.number = true          -- line numbers
vim.o.relativenumber = true  -- relative numbers: makes 5j/8k effortless
vim.o.ignorecase = true      -- search ignores case...
vim.o.smartcase = true       -- ...unless you type a capital
vim.o.undofile = true        -- undo survives restarts
vim.o.signcolumn = "yes"     -- stop the gutter from jumping
vim.o.clipboard = "unnamedplus"  -- y and p use the system clipboard
vim.o.scrolloff = 8          -- keep context around the cursor

-- quality-of-life keymaps
vim.keymap.set("n", "<Esc>", "<cmd>nohlsearch<CR>")  -- clear search highlight
vim.keymap.set("n", "<leader>w", "<cmd>write<CR>")   -- Space-w to save`}</Code>
          <p>
            Notice <span className="font-mono text-fg">relativenumber</span> —
            it&apos;s the reason the Multipliers module matters: the gutter
            tells you the count, you type{" "}
            <Keycap k="8" />
            <Keycap k="j" /> and land exactly there.
          </p>
        </Section>

        <Section num="04" title="level up: kickstart + LSP">
          <p>
            When you want plugins (fuzzy finding, treesitter highlighting,
            LSP autocomplete), don&apos;t hand-assemble a config on day one.
            Start from{" "}
            <a
              href="https://github.com/nvim-lua/kickstart.nvim"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green underline-offset-4 hover:underline"
            >
              kickstart.nvim
            </a>{" "}
            — a single, heavily commented init.lua maintained by the
            community. Read it top to bottom; it doubles as a course in
            Neovim configuration and uses{" "}
            <a
              href="https://github.com/folke/lazy.nvim"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green underline-offset-4 hover:underline"
            >
              lazy.nvim
            </a>{" "}
            for plugin management.
          </p>
          <p>
            With an LSP attached (Neovim 0.11+ ships default mappings), your
            dojo skills get superpowers:
          </p>
          <ul className="flex flex-col gap-2">
            <li className="flex items-baseline gap-3">
              <Keycap k="gd" />
              <span>go to definition</span>
            </li>
            <li className="flex items-baseline gap-3">
              <Keycap k="K" />
              <span>hover docs for the symbol under the cursor</span>
            </li>
            <li className="flex items-baseline gap-3">
              <Keycap k="grr" />
              <span>list references</span>
            </li>
            <li className="flex items-baseline gap-3">
              <Keycap k="grn" />
              <span>rename symbol — project-wide</span>
            </li>
            <li className="flex items-baseline gap-3">
              <Keycap k="gra" />
              <span>code actions</span>
            </li>
            <li className="flex items-baseline gap-3">
              <Keycap k="]d" />
              <span>jump to the next diagnostic (and </span>
              <Keycap k="[d" />
              <span> back)</span>
            </li>
          </ul>
        </Section>

        <Section num="05" title="your first week">
          <ul className="flex list-disc flex-col gap-2 pl-5">
            <li>
              Day 1–2: finish <span className="font-mono text-fg">:Tutor</span>,
              live in nvim for small edits (notes, configs, commit messages).
            </li>
            <li>
              Day 3–4: force the habits — disable arrow keys if you must, and
              narrate edits as verb+noun: &quot;change inside quotes&quot; ={" "}
              <span className="font-mono text-fg">ci&quot;</span>.
            </li>
            <li>
              Day 5+: adopt kickstart, add your language&apos;s LSP, learn{" "}
              <span className="font-mono text-fg">&lt;leader&gt;sf</span>{" "}
              (find files) and{" "}
              <span className="font-mono text-fg">&lt;leader&gt;sg</span>{" "}
              (live grep) from its Telescope setup.
            </li>
            <li>
              Any day it feels slow: come back here and{" "}
              <Link
                href="/"
                className="text-green underline-offset-4 hover:underline"
              >
                golf the drills to par
              </Link>
              . Speed comes from the fingers, not the config.
            </li>
          </ul>
        </Section>
      </div>
    </div>
  );
}
