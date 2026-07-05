// LazyVim workflow drills: a simulated workspace (bufferline, splits,
// explorer, picker, terminal) driven by LazyVim's default keymaps.

export const PROJECT_FILES: Record<string, string[]> = {
  "src/app.tsx": [
    "export function App() {",
    '  return <Button label="go" />',
    "}",
  ],
  "src/components/Button.tsx": [
    "export function Button({ label }) {",
    "  return <button>{label}</button>",
    "}",
  ],
  "src/hooks/useAuth.ts": [
    "export function useAuth() {",
    "  return { user: null }",
    "}",
  ],
  "src/utils.ts": [
    "export const sum = (a, b) =>",
    "  a + b",
    "// TODO: add tests",
  ],
  "README.md": [
    "# acme-app",
    "",
    "A tiny project for practicing",
    "LazyVim navigation.",
  ],
  "index.html": ["<!doctype html>", '<div id="root"></div>'],
  "package.json": ["{", '  "name": "acme-app",', '  "version": "1.0.0"', "}"],
  "styles.css": [".root {", "  color: rebeccapurple;", "}"],
};

// Explorer display order (dirs first, like neo-tree).
export const TREE_ORDER = [
  "src/app.tsx",
  "src/components/Button.tsx",
  "src/hooks/useAuth.ts",
  "src/utils.ts",
  "README.md",
  "index.html",
  "package.json",
  "styles.css",
];

export const RECENT_FILES = ["styles.css", "README.md", "src/utils.ts"];

export type LvLayoutSpec =
  | { type: "single"; file: string }
  | { type: "vsplit"; files: [string, string]; focus: 0 | 1 }
  | { type: "hsplit"; files: [string, string]; focus: 0 | 1 }
  | {
      type: "threePane";
      files: [string, string, string]; // left, right-top, right-bottom
      focus: 0 | 1 | 2;
    };

export interface LvSetup {
  buffers: string[];
  layout: LvLayoutSpec;
  alternate?: string;
  explorer?: { open: boolean; focused?: boolean; sel?: number };
  terminal?: { open: boolean; focused?: boolean };
}

export interface LvGoal {
  activeFile?: string; // focused window shows this file
  windows?: number;
  dir?: "row" | "col"; // root split orientation
  focusFirst?: boolean; // focused window is the first (left/top) pane
  showing?: string[]; // set of files visible across windows
  buffersExactly?: string[]; // set equality on open buffers
  explorerOpen?: boolean;
  terminalOpen?: boolean;
}

export interface LvChallenge {
  id: string;
  title: string;
  hint?: string;
  goalLabel: string; // human-readable objective
  setup: LvSetup;
  goal: LvGoal;
  par: number;
  solution: string[];
}

export interface LvModule {
  id: string;
  num: number;
  title: string;
  tagline: string;
  keys: { key: string; desc: string }[];
  challenges: LvChallenge[];
}

type Seed = Omit<LvChallenge, "id">;

function mod(
  id: string,
  num: number,
  title: string,
  tagline: string,
  keys: { key: string; desc: string }[],
  seeds: Seed[]
): LvModule {
  return {
    id,
    num,
    title,
    tagline,
    keys,
    challenges: seeds.map((s, i) => ({ ...s, id: `${id}-${i + 1}` })),
  };
}

const FOUR_BUFFERS = ["src/app.tsx", "src/utils.ts", "styles.css", "README.md"];

export const lvModules: LvModule[] = [
  mod(
    "lz-buffers",
    1,
    "Buffer Surfing",
    "Your open files are the tab bar: H L <leader>, <leader>bd",
    [
      { key: "L", desc: "next buffer (shift-l)" },
      { key: "H", desc: "previous buffer (shift-h)" },
      { key: "SPC ,", desc: "buffer picker" },
      { key: "SPC `", desc: "flip to alternate buffer" },
      { key: "SPC b d", desc: "delete (close) buffer" },
      { key: "SPC b o", desc: "close all other buffers" },
    ],
    [
      {
        title: "Next tab: L",
        hint: "In LazyVim the bufferline is your tab bar. Shift-l hops one tab right.",
        goalLabel: "Make utils.ts the active buffer.",
        setup: { buffers: FOUR_BUFFERS, layout: { type: "single", file: "src/app.tsx" } },
        goal: { activeFile: "src/utils.ts" },
        par: 1,
        solution: ["L"],
      },
      {
        title: "Previous tab: H",
        hint: "Shift-h goes the other way.",
        goalLabel: "Make utils.ts the active buffer.",
        setup: { buffers: FOUR_BUFFERS, layout: { type: "single", file: "styles.css" } },
        goal: { activeFile: "src/utils.ts" },
        par: 1,
        solution: ["H"],
      },
      {
        title: "Straight to it: <leader>,",
        hint: "Spamming L doesn't scale. Space then , opens the buffer picker — type a few letters, Enter.",
        goalLabel: "Jump directly to README.md.",
        setup: { buffers: FOUR_BUFFERS, layout: { type: "single", file: "src/app.tsx" } },
        goal: { activeFile: "README.md" },
        par: 5,
        solution: ["SPC", ",", "r", "e", "↵"],
      },
      {
        title: "Boomerang: <leader>`",
        hint: "The alternate buffer is the file you were just in. Space backtick flips between the two — the fastest 'go back' there is.",
        goalLabel: "Flip back to README.md.",
        setup: {
          buffers: FOUR_BUFFERS,
          layout: { type: "single", file: "src/app.tsx" },
          alternate: "README.md",
        },
        goal: { activeFile: "README.md" },
        par: 2,
        solution: ["SPC", "`"],
      },
      {
        title: "Close a tab: <leader>bd",
        hint: "Space b d deletes the current buffer. Watch the which-key hint after Space.",
        goalLabel: "Close styles.css.",
        setup: { buffers: FOUR_BUFFERS, layout: { type: "single", file: "styles.css" } },
        goal: { buffersExactly: ["src/app.tsx", "src/utils.ts", "README.md"] },
        par: 3,
        solution: ["SPC", "b", "d"],
      },
      {
        title: "Clean sweep: <leader>bo",
        hint: "Space b o keeps only the buffer you're in. Great after a long exploration session.",
        goalLabel: "Close everything except app.tsx.",
        setup: { buffers: FOUR_BUFFERS, layout: { type: "single", file: "src/app.tsx" } },
        goal: { buffersExactly: ["src/app.tsx"] },
        par: 3,
        solution: ["SPC", "b", "o"],
      },
    ]
  ),

  mod(
    "lz-files",
    2,
    "File Finder",
    "Any file in three keystrokes: <leader><space> <leader>fr <leader>/",
    [
      { key: "SPC SPC", desc: "find files (fuzzy)" },
      { key: "SPC f f", desc: "find files (same thing)" },
      { key: "SPC f r", desc: "recent files" },
      { key: "SPC /", desc: "grep the project" },
      { key: "esc", desc: "close any picker" },
    ],
    [
      {
        title: "Find files: <leader><space>",
        hint: "Space Space is the LazyVim reflex. Type a fragment, Enter opens the top match.",
        goalLabel: "Open README.md via the file picker.",
        setup: { buffers: ["src/app.tsx"], layout: { type: "single", file: "src/app.tsx" } },
        goal: { activeFile: "README.md" },
        par: 7,
        solution: ["SPC", "SPC", "r", "e", "a", "d", "↵"],
      },
      {
        title: "Fuzzy means lazy",
        hint: "You never type paths. 'auth' is enough to nail src/hooks/useAuth.ts.",
        goalLabel: "Open src/hooks/useAuth.ts.",
        setup: { buffers: ["src/app.tsx"], layout: { type: "single", file: "src/app.tsx" } },
        goal: { activeFile: "src/hooks/useAuth.ts" },
        par: 8,
        solution: ["SPC", "f", "f", "a", "u", "t", "h", "↵"],
      },
      {
        title: "Recent files: <leader>fr",
        hint: "Your last-touched files, most recent first. Often faster than searching.",
        goalLabel: "Reopen the most recent file (styles.css).",
        setup: { buffers: ["src/app.tsx"], layout: { type: "single", file: "src/app.tsx" } },
        goal: { activeFile: "styles.css" },
        par: 4,
        solution: ["SPC", "f", "r", "↵"],
      },
      {
        title: "Grep: <leader>/",
        hint: "Search file contents, not names. Find the TODO someone left behind.",
        goalLabel: "Grep for 'todo' and open the match.",
        setup: { buffers: ["src/app.tsx"], layout: { type: "single", file: "src/app.tsx" } },
        goal: { activeFile: "src/utils.ts" },
        par: 7,
        solution: ["SPC", "/", "t", "o", "d", "o", "↵"],
      },
    ]
  ),

  mod(
    "lz-windows",
    3,
    "Splits & Hops",
    "Two files at once: <leader>| <leader>- and Ctrl-h/j/k/l",
    [
      { key: "C-h/j/k/l", desc: "move focus between windows" },
      { key: "SPC |", desc: "split window right" },
      { key: "SPC -", desc: "split window below" },
      { key: "SPC w d", desc: "close the focused window" },
    ],
    [
      {
        title: "Split right: <leader>|",
        hint: "Space | opens a vertical split. Focus lands in the new pane.",
        goalLabel: "Make two side-by-side windows.",
        setup: { buffers: ["src/app.tsx"], layout: { type: "single", file: "src/app.tsx" } },
        goal: { windows: 2, dir: "row" },
        par: 2,
        solution: ["SPC", "|"],
      },
      {
        title: "Hop left: Ctrl-h",
        hint: "The same hjkl instincts, with Ctrl held, move between windows instead of characters.",
        goalLabel: "Focus the left window (app.tsx).",
        setup: {
          buffers: ["src/app.tsx", "src/utils.ts"],
          layout: { type: "vsplit", files: ["src/app.tsx", "src/utils.ts"], focus: 1 },
        },
        goal: { activeFile: "src/app.tsx" },
        par: 1,
        solution: ["C-h"],
      },
      {
        title: "Split below, hop up",
        hint: "Space - splits horizontally and focuses the bottom pane. Ctrl-k climbs back.",
        goalLabel: "Two stacked windows, focus on top.",
        setup: { buffers: ["src/app.tsx"], layout: { type: "single", file: "src/app.tsx" } },
        goal: { windows: 2, dir: "col", focusFirst: true },
        par: 3,
        solution: ["SPC", "-", "C-k"],
      },
      {
        title: "Corner run",
        hint: "Three panes. Ctrl-l goes right (topmost first), Ctrl-j drops down.",
        goalLabel: "Focus the bottom-right window (styles.css).",
        setup: {
          buffers: ["src/app.tsx", "src/utils.ts", "styles.css"],
          layout: {
            type: "threePane",
            files: ["src/app.tsx", "src/utils.ts", "styles.css"],
            focus: 0,
          },
        },
        goal: { activeFile: "styles.css" },
        par: 2,
        solution: ["C-l", "C-j"],
      },
      {
        title: "Close the split: <leader>wd",
        hint: "Space w d closes the focused window — the file stays open in the bufferline.",
        goalLabel: "Back to a single window.",
        setup: {
          buffers: ["src/app.tsx", "src/utils.ts"],
          layout: { type: "vsplit", files: ["src/app.tsx", "src/utils.ts"], focus: 1 },
        },
        goal: { windows: 1 },
        par: 3,
        solution: ["SPC", "w", "d"],
      },
      {
        title: "Combo: side-by-side peek",
        hint: "Split right, then use the buffer picker in the new pane. This is THE LazyVim two-file move.",
        goalLabel: "app.tsx on the left, utils.ts focused on the right.",
        setup: {
          buffers: ["src/app.tsx", "src/utils.ts"],
          layout: { type: "single", file: "src/app.tsx" },
        },
        goal: {
          windows: 2,
          dir: "row",
          activeFile: "src/utils.ts",
          showing: ["src/app.tsx", "src/utils.ts"],
        },
        par: 6,
        solution: ["SPC", "|", "SPC", ",", "u", "↵"],
      },
    ]
  ),

  mod(
    "lz-panels",
    4,
    "Explorer & Terminal",
    "The side tree and the drop-down shell: <leader>e and Ctrl-/",
    [
      { key: "SPC e", desc: "toggle the file explorer" },
      { key: "j / k", desc: "move in the tree" },
      { key: "↵", desc: "open the selected file" },
      { key: "C-/", desc: "toggle the terminal" },
    ],
    [
      {
        title: "Open the tree: <leader>e",
        hint: "Space e toggles the explorer and focuses it.",
        goalLabel: "Open the file explorer.",
        setup: { buffers: ["src/app.tsx"], layout: { type: "single", file: "src/app.tsx" } },
        goal: { explorerOpen: true },
        par: 2,
        solution: ["SPC", "e"],
      },
      {
        title: "Open from the tree",
        hint: "Inside the tree it's still j/k to move and Enter to open.",
        goalLabel: "Open src/utils.ts from the explorer.",
        setup: {
          buffers: ["src/app.tsx"],
          layout: { type: "single", file: "src/app.tsx" },
          explorer: { open: true, focused: true, sel: 0 },
        },
        goal: { activeFile: "src/utils.ts" },
        par: 4,
        solution: ["j", "j", "j", "↵"],
      },
      {
        title: "Close the tree",
        hint: "Same key, other direction: Space e again puts it away.",
        goalLabel: "Close the file explorer.",
        setup: {
          buffers: ["src/app.tsx"],
          layout: { type: "single", file: "src/app.tsx" },
          explorer: { open: true, focused: false },
        },
        goal: { explorerOpen: false },
        par: 2,
        solution: ["SPC", "e"],
      },
      {
        title: "Terminal: Ctrl-/",
        hint: "A real shell drops in from the bottom, already focused.",
        goalLabel: "Open the terminal.",
        setup: { buffers: ["src/app.tsx"], layout: { type: "single", file: "src/app.tsx" } },
        goal: { terminalOpen: true },
        par: 1,
        solution: ["C-/"],
      },
      {
        title: "Back to code",
        hint: "Ctrl-/ again hides it. Your shell session survives — this is a toggle, not a quit.",
        goalLabel: "Close the terminal.",
        setup: {
          buffers: ["src/app.tsx"],
          layout: { type: "single", file: "src/app.tsx" },
          terminal: { open: true, focused: true },
        },
        goal: { terminalOpen: false },
        par: 1,
        solution: ["C-/"],
      },
    ]
  ),
];

export const totalLvChallenges = lvModules.reduce(
  (n, m) => n + m.challenges.length,
  0
);

export function lvModuleById(id: string): LvModule | undefined {
  return lvModules.find((m) => m.id === id);
}
