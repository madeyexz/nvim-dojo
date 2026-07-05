# Nvim Dojo 🥋

**Interactive drills that turn Neovim motions into muscle memory.**

Short, scored challenges in a real vim-emulated editor, right in the browser.
Every drill has a **par** — the optimal keystroke count. Hit par for three
stars, then come back and golf your best score down.

Everything drilled here is Neovim's core editing grammar — motions,
operators, text objects — so it transfers keystroke-for-keystroke. The
built-in [`/nvim`](https://nvim-dojo.vercel.app/nvim) guide then walks you
from browser drills to a real Neovim setup (install, `:Tutor`, a starter
`init.lua`, kickstart.nvim, and the LSP keymaps).

## How it works

- **12 modules, 61 drills** — a deliberate progression from `h j k l` to
  text objects, counts, search, visual mode, and combined "gauntlet" fixes.
- **Real vim emulation** — powered by [`@replit/codemirror-vim`](https://github.com/replit/codemirror-vim),
  so what your fingers learn here transfers 1:1 to Neovim.
- **Two kinds of drills** — land the cursor on a highlighted target, or
  transform the buffer to match a target. Validation is instant.
- **Keystroke golf** — a live key counter, a keycast strip, par scores, and
  the optimal "par play" revealed after every drill.
- **Progress saved locally** — stars and best scores persist in
  `localStorage`. No accounts, no backend.

## Modules

| # | Module | Teaches |
|---|--------|---------|
| 01 | First Steps | `h` `j` `k` `l` |
| 02 | Word Warp | `w` `b` `e` `0` `$` |
| 03 | Vertical Leap | `gg` `G` `{count}G` |
| 04 | Sniper Mode | `f` `F` `t` `;` `,` |
| 05 | Ways In | `i` `a` `I` `A` `o` `O` |
| 06 | Quick Fixes | `x` `r` `~` `J` `u` |
| 07 | Verbs + Motions | `d` `c` `y` `p` `dd` `yy` `D` |
| 08 | Text Objects | `ciw` `daw` `di"` `ci(` `ci{` |
| 09 | Multipliers | `3w` `3x` `d3w` `3dd` `3f;` |
| 10 | Search & Destroy | `/` `n` `N` `*` |
| 11 | Visual Mode | `v` `V` + operators |
| 12 | The Gauntlet | everything, combined |

Plus a free-play **playground** buffer, a **cheatsheet** of every key
taught, and the **real nvim** setup guide.

## Development

```bash
npm install
npm run dev
```

Built with Next.js (App Router), Tailwind CSS, CodeMirror 6, and
`@replit/codemirror-vim`.

## License

MIT
