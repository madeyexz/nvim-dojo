# Vim Dojo 🥋

**Interactive drills that turn vim/neovim motions into muscle memory.**

Short, scored challenges in a real vim-emulated editor, right in the browser.
Every drill has a **par** — the optimal keystroke count. Hit par for three
stars, then come back and golf your best score down.

## How it works

- **12 modules, 61 drills** — a deliberate progression from `h j k l` to
  text objects, counts, search, visual mode, and combined "gauntlet" fixes.
- **Real vim emulation** — powered by [`@replit/codemirror-vim`](https://github.com/replit/codemirror-vim),
  so what your fingers learn here transfers 1:1 to neovim.
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

Plus a free-play **playground** buffer and a **cheatsheet** of every key
taught (and a few worth learning next).

## Development

```bash
npm install
npm run dev
```

Built with Next.js (App Router), Tailwind CSS, CodeMirror 6, and
`@replit/codemirror-vim`.

## License

MIT
