// Vim Dojo lesson data.
//
// Challenge text is authored with two markers that get stripped at parse time:
//   ▶  where the cursor starts (defaults to offset 0 if absent)
//   ◆  the target character for cursor-goal challenges
// Text-goal challenges omit ◆ and provide `goalText` instead: the drill is
// complete when the buffer exactly equals `goalText`.

export interface KeyInfo {
  key: string;
  desc: string;
}

export interface Challenge {
  id: string;
  title: string;
  hint?: string;
  raw: string;
  goalText?: string;
  par: number;
  solution: string[];
}

export interface VimModule {
  id: string;
  num: number;
  title: string;
  tagline: string;
  keys: KeyInfo[];
  challenges: Challenge[];
}

export interface Parsed {
  text: string;
  start: number;
  target: number | null;
}

export function parseMarkers(raw: string): Parsed {
  let text = "";
  let start: number | null = null;
  let target: number | null = null;
  for (const ch of raw) {
    if (ch === "▶") start = text.length;
    else if (ch === "◆") target = text.length;
    else text += ch;
  }
  return { text, start: start ?? 0, target };
}

const L = (...lines: string[]) => lines.join("\n");

type Seed = Omit<Challenge, "id">;

function mod(
  id: string,
  num: number,
  title: string,
  tagline: string,
  keys: KeyInfo[],
  seeds: Seed[]
): VimModule {
  return {
    id,
    num,
    title,
    tagline,
    keys,
    challenges: seeds.map((s, i) => ({ ...s, id: `${id}-${i + 1}` })),
  };
}

export const modules: VimModule[] = [
  mod(
    "basics",
    1,
    "First Steps",
    "Move without arrow keys: h j k l",
    [
      { key: "h", desc: "move left" },
      { key: "j", desc: "move down" },
      { key: "k", desc: "move up" },
      { key: "l", desc: "move right" },
    ],
    [
      {
        title: "Go right with l",
        hint: "Your index finger rests on j — l is two keys to the right. Tap it until you land on the X.",
        raw: "▶go -> ◆X",
        par: 6,
        solution: ["l", "l", "l", "l", "l", "l"],
      },
      {
        title: "Go left with h",
        hint: "h is the leftmost home-row key under your index finger, and it moves left. Neat, right?",
        raw: "◆X <- g▶o",
        par: 6,
        solution: ["h", "h", "h", "h", "h", "h"],
      },
      {
        title: "Go down with j",
        hint: "Think of j as a little hook pointing down.",
        raw: L("▶grab your keys", ".", ".", "◆go down here"),
        par: 3,
        solution: ["j", "j", "j"],
      },
      {
        title: "Go up with k",
        hint: "k points up. j and k are your vertical scroll wheel.",
        raw: L("◆the sky", ".", ".", "▶the ground"),
        par: 3,
        solution: ["k", "k", "k"],
      },
      {
        title: "Corner to corner",
        hint: "Combine j and l. Order doesn't matter — the key count does.",
        raw: L("▶x . . . .", ". . . . .", ". . . . ◆x"),
        par: 10,
        solution: ["j", "j", "l", "l", "l", "l", "l", "l", "l", "l"],
      },
      {
        title: "Down the staircase",
        hint: "j keeps your column, so drop all the way down first, then slide right.",
        raw: L("▶start", " down", "  down", "   down", "    ◆end"),
        par: 8,
        solution: ["j", "j", "j", "j", "l", "l", "l", "l"],
      },
    ]
  ),

  mod(
    "words",
    2,
    "Word Warp",
    "Hop by words: w b e, and line ends with 0 $",
    [
      { key: "w", desc: "start of next word" },
      { key: "b", desc: "start of previous word" },
      { key: "e", desc: "end of word" },
      { key: "0", desc: "start of line" },
      { key: "$", desc: "end of line" },
    ],
    [
      {
        title: "Hop forward with w",
        hint: "One press of w = one word. Three hops gets you there.",
        raw: "▶hop to the ◆target word",
        par: 3,
        solution: ["w", "w", "w"],
      },
      {
        title: "Back up with b",
        hint: "b walks backwards to the start of each word.",
        raw: "◆one two three fo▶ur",
        par: 4,
        solution: ["b", "b", "b", "b"],
      },
      {
        title: "Word ends with e",
        hint: "e lands on the last character of each word — handy before appending.",
        raw: "▶grab the last lette◆r",
        par: 4,
        solution: ["e", "e", "e", "e"],
      },
      {
        title: "To the end with $",
        hint: "$ slams the cursor to the last character of the line. One key.",
        raw: "▶march all the way to the en◆d",
        par: 1,
        solution: ["$"],
      },
      {
        title: "Back to the start with 0",
        hint: "0 (zero) jumps to column zero instantly.",
        raw: "◆zoom back to the very fron▶t",
        par: 1,
        solution: ["0"],
      },
      {
        title: "Combo: last word",
        hint: "Spamming w works but costs 6 keys. $ then b costs 2.",
        raw: "▶the prize is in the final ◆word",
        par: 2,
        solution: ["$", "b"],
      },
    ]
  ),

  mod(
    "lines",
    3,
    "Vertical Leap",
    "Teleport across the file: gg G {count}G",
    [
      { key: "gg", desc: "first line" },
      { key: "G", desc: "last line" },
      { key: "7G", desc: "jump to line 7" },
      { key: "}", desc: "next paragraph" },
      { key: "{", desc: "previous paragraph" },
    ],
    [
      {
        title: "To the bottom: G",
        hint: "Capital G. One keystroke to the basement, no matter how far.",
        raw: L(
          "▶the attic",
          "line two",
          "line three",
          "line four",
          "line five",
          "line six",
          "line seven",
          "line eight",
          "line nine",
          "line ten",
          "line eleven",
          "◆the basement"
        ),
        par: 1,
        solution: ["G"],
      },
      {
        title: "To the top: gg",
        hint: "Two little g's take you home to line 1.",
        raw: L(
          "◆the attic",
          "line two",
          "line three",
          "line four",
          "line five",
          "line six",
          "line seven",
          "line eight",
          "line nine",
          "line ten",
          "line eleven",
          "▶the basement"
        ),
        par: 2,
        solution: ["g", "g"],
      },
      {
        title: "Direct dial: 7G",
        hint: "A count before G jumps to that exact line number. Check the gutter.",
        raw: L(
          "▶line one",
          "line two",
          "line three",
          "line four",
          "line five",
          "line six",
          "◆line seven",
          "line eight",
          "line nine",
          "line ten",
          "line eleven",
          "line twelve"
        ),
        par: 2,
        solution: ["7", "G"],
      },
      {
        title: "Direct dial again: 3G",
        hint: "Same trick, other direction — counts work from anywhere.",
        raw: L(
          "alpha",
          "bravo",
          "◆charlie",
          "delta",
          "echo",
          "foxtrot",
          "golf",
          "▶hotel"
        ),
        par: 2,
        solution: ["3", "G"],
      },
      {
        title: "Combo: line 9, last character",
        hint: "Jump to the line first, then use what you learned in Word Warp.",
        raw: L(
          "▶line one",
          "line two",
          "line three",
          "line four",
          "line five",
          "line six",
          "line seven",
          "line eight",
          "line nin◆e",
          "line ten",
          "line eleven",
          "line twelve"
        ),
        par: 3,
        solution: ["9", "G", "$"],
      },
    ]
  ),

  mod(
    "find",
    4,
    "Sniper Mode",
    "Snap to any character on the line: f t F ;",
    [
      { key: "f{char}", desc: "find char forward" },
      { key: "F{char}", desc: "find char backward" },
      { key: "t{char}", desc: "till char (stops one short)" },
      { key: ";", desc: "repeat last find" },
      { key: ",", desc: "repeat find, reversed" },
    ],
    [
      {
        title: "Find the x",
        hint: "f then x jumps straight onto the next x. Two keys, any distance.",
        raw: "▶solve for ◆x today",
        par: 2,
        solution: ["f", "x"],
      },
      {
        title: "Stop just short with t",
        hint: "t (till) stops one character before the match — perfect setup for operators later.",
        raw: "▶cut just before tw◆o, okay",
        par: 2,
        solution: ["t", ","],
      },
      {
        title: "The third i",
        hint: "f i gets the first i. Then ; repeats the hunt without retyping.",
        raw: "▶big fig j◆ig",
        par: 4,
        solution: ["f", "i", ";", ";"],
      },
      {
        title: "Look backwards with F",
        hint: "Capital F searches to the left of the cursor.",
        raw: "◆zebra waits at the start, you are at the en▶d",
        par: 2,
        solution: ["F", "z"],
      },
      {
        title: "Combo: the last o",
        hint: "Six words of o's ahead — or jump to the end and look back once.",
        raw: "▶the last o: solo polo pian◆o!",
        par: 3,
        solution: ["$", "F", "o"],
      },
    ]
  ),

  mod(
    "insert",
    5,
    "Ways In",
    "Six doors into insert mode: i a I A o O",
    [
      { key: "i", desc: "insert before cursor" },
      { key: "a", desc: "append after cursor" },
      { key: "I", desc: "insert at line start" },
      { key: "A", desc: "append at line end" },
      { key: "o", desc: "open line below" },
      { key: "O", desc: "open line above" },
      { key: "Esc", desc: "back to normal mode" },
    ],
    [
      {
        title: "Insert with i",
        hint: "The cursor sits on the l — press i to type before it, add the missing l, then Esc.",
        raw: "he▶lo world!",
        goalText: "hello world!",
        par: 2,
        solution: ["i", "l", "Esc"],
      },
      {
        title: "Append with a",
        hint: "a starts typing after the cursor — exactly what you need at the end of a word.",
        raw: "hello wor▶l",
        goalText: "hello world",
        par: 2,
        solution: ["a", "d", "Esc"],
      },
      {
        title: "Append to the line: A",
        hint: "Capital A = jump to end of line and insert, in one key. No $ needed.",
        raw: "▶let total = 10",
        goalText: "let total = 10;",
        par: 2,
        solution: ["A", ";", "Esc"],
      },
      {
        title: "Insert at the front: I",
        hint: "Capital I = jump to the start of the line and insert. Add '> ' to quote it.",
        raw: "important note▶!",
        goalText: "> important note!",
        par: 3,
        solution: ["I", ">", "␣", "Esc"],
      },
      {
        title: "Open below with o",
        hint: "o creates a fresh line under you and drops into insert mode.",
        raw: L("▶one", "three"),
        goalText: L("one", "two", "three"),
        par: 4,
        solution: ["o", "t", "w", "o", "Esc"],
      },
      {
        title: "Open above with O",
        hint: "Capital O opens the new line above the cursor instead.",
        raw: L("one", "▶three"),
        goalText: L("one", "two", "three"),
        par: 4,
        solution: ["O", "t", "w", "o", "Esc"],
      },
    ]
  ),

  mod(
    "edit",
    6,
    "Quick Fixes",
    "Surgical edits without insert mode: x r ~ J",
    [
      { key: "x", desc: "delete char under cursor" },
      { key: "r{char}", desc: "replace char under cursor" },
      { key: "~", desc: "toggle case" },
      { key: "J", desc: "join line below onto this one" },
      { key: "u", desc: "undo (your safety net)" },
      { key: "Ctrl-r", desc: "redo" },
    ],
    [
      {
        title: "Zap a character: x",
        hint: "The cursor is on the extra d. x deletes it. No insert mode required.",
        raw: "the worl▶dd is round",
        goalText: "the world is round",
        par: 1,
        solution: ["x"],
      },
      {
        title: "Zap three",
        hint: "x x x. (Later you'll learn to say 3x.)",
        raw: "so cl▶+++ean",
        goalText: "so clean",
        par: 3,
        solution: ["x", "x", "x"],
      },
      {
        title: "Replace in place: r",
        hint: "r then the new character. You never leave normal mode.",
        raw: "the c▶et sat",
        goalText: "the cat sat",
        par: 2,
        solution: ["r", "a"],
      },
      {
        title: "Flip the case: ~",
        hint: "~ toggles the case of the character under the cursor and steps right.",
        raw: "▶vim is great",
        goalText: "Vim is great",
        par: 1,
        solution: ["~"],
      },
      {
        title: "Join lines: J",
        hint: "Capital J pulls the line below up onto this one, with a single space between.",
        raw: L("▶joined we", "stand"),
        goalText: "joined we stand",
        par: 1,
        solution: ["J"],
      },
    ]
  ),

  mod(
    "operators",
    7,
    "Verbs + Motions",
    "The vim grammar: d c y + any motion",
    [
      { key: "dw", desc: "delete word" },
      { key: "dd", desc: "delete line" },
      { key: "D", desc: "delete to end of line" },
      { key: "cw", desc: "change word (delete + insert)" },
      { key: "yy", desc: "yank (copy) line" },
      { key: "p", desc: "paste after / below" },
    ],
    [
      {
        title: "Delete a word: dw",
        hint: "d is a verb waiting for a motion. dw = delete to the next word.",
        raw: "delete the ▶bad word",
        goalText: "delete the word",
        par: 2,
        solution: ["d", "w"],
      },
      {
        title: "Delete a line: dd",
        hint: "Doubling an operator applies it to the whole line.",
        raw: L("keep me", "▶delete me", "keep me too"),
        goalText: L("keep me", "keep me too"),
        par: 2,
        solution: ["d", "d"],
      },
      {
        title: "Delete to the end: D",
        hint: "Capital D wipes from the cursor to the end of the line.",
        raw: "keep this part;▶ drop the rest",
        goalText: "keep this part;",
        par: 1,
        solution: ["D"],
      },
      {
        title: "Change a word: cw",
        hint: "c deletes and drops you into insert mode. Change red to blue.",
        raw: "the ▶red house",
        goalText: "the blue house",
        par: 6,
        solution: ["c", "w", "b", "l", "u", "e", "Esc"],
      },
      {
        title: "Copy and paste: yy p",
        hint: "yy yanks the line, p pastes it below. Instant duplicate.",
        raw: L("▶echo echo", "done"),
        goalText: L("echo echo", "echo echo", "done"),
        par: 3,
        solution: ["y", "y", "p"],
      },
    ]
  ),

  mod(
    "textobjects",
    8,
    "Text Objects",
    "Edit from inside: ciw di\" ci( — cursor position barely matters",
    [
      { key: "ciw", desc: "change inner word" },
      { key: "daw", desc: "delete a word (+ its space)" },
      { key: "di\"", desc: "delete inside quotes" },
      { key: "ci(", desc: "change inside parens" },
      { key: "ci{", desc: "change inside braces" },
    ],
    [
      {
        title: "Change inner word: ciw",
        hint: "Cursor is mid-word — ciw still grabs the whole word. That's the magic.",
        raw: "the wea▶ther is nice",
        goalText: "the sky is nice",
        par: 6,
        solution: ["c", "i", "w", "s", "k", "y", "Esc"],
      },
      {
        title: "Delete a word: daw",
        hint: "daw takes the word and its trailing space — no double-space left behind.",
        raw: "remove one ▶extra word here",
        goalText: "remove one word here",
        par: 3,
        solution: ["d", "a", "w"],
      },
      {
        title: "Empty the quotes: di\"",
        hint: "From anywhere inside the quotes, di\" clears everything between them.",
        raw: "name = \"▶old junk\"",
        goalText: "name = \"\"",
        par: 3,
        solution: ["d", "i", "\""],
      },
      {
        title: "Change inside parens: ci(",
        hint: "ci( wipes the parens' contents and starts insert right there.",
        raw: "call(▶wrong)",
        goalText: "call(right)",
        par: 8,
        solution: ["c", "i", "(", "r", "i", "g", "h", "t", "Esc"],
      },
      {
        title: "Change inside braces: ci{",
        hint: "The same pattern works for {, [, <, quotes, tags… learn one, get them all.",
        raw: "style = {▶old}",
        goalText: "style = {new}",
        par: 6,
        solution: ["c", "i", "{", "n", "e", "w", "Esc"],
      },
    ]
  ),

  mod(
    "counts",
    9,
    "Multipliers",
    "Say it once: 3w 3x d3w 3dd",
    [
      { key: "3w", desc: "forward three words" },
      { key: "3x", desc: "delete three chars" },
      { key: "d3w", desc: "delete three words" },
      { key: "3dd", desc: "delete three lines" },
      { key: "3f;", desc: "find the third ;" },
    ],
    [
      {
        title: "Three words at once: 3w",
        hint: "Any motion takes a count in front. 3w = www.",
        raw: "▶one two three ◆four five",
        par: 2,
        solution: ["3", "w"],
      },
      {
        title: "Delete three chars: 3x",
        hint: "Counts work on edits too. Trim the three extra o's.",
        raw: "wh▶ooooops",
        goalText: "whoops",
        par: 2,
        solution: ["3", "x"],
      },
      {
        title: "Delete three words: d3w",
        hint: "verb + count + motion. Read it aloud: delete 3 words.",
        raw: "delete ▶these three words quickly ok",
        goalText: "delete quickly ok",
        par: 3,
        solution: ["d", "3", "w"],
      },
      {
        title: "Delete three lines: 3dd",
        hint: "3dd mows down three whole lines from the cursor.",
        raw: L("keep top", "▶cut one", "cut two", "cut three", "keep bottom"),
        goalText: L("keep top", "keep bottom"),
        par: 3,
        solution: ["3", "d", "d"],
      },
      {
        title: "The third semicolon: 3f;",
        hint: "Counts compose with f too. 3f; = find the third ; ahead.",
        raw: "▶a = 1; b = 2; c = 3◆;",
        par: 3,
        solution: ["3", "f", ";"],
      },
    ]
  ),

  mod(
    "search",
    10,
    "Search & Destroy",
    "Cross the file in one leap: / n *",
    [
      { key: "/text", desc: "search forward (Enter to go)" },
      { key: "n", desc: "next match" },
      { key: "N", desc: "previous match" },
      { key: "*", desc: "search word under cursor" },
    ],
    [
      {
        title: "Search with /",
        hint: "Type /gem and press Enter. The cursor lands on the match.",
        raw: L(
          "▶searching in a big file",
          "beats moving line by line",
          "somewhere down below",
          "hides a shiny ◆gem for you",
          "keep scrolling friend"
        ),
        par: 5,
        solution: ["/", "g", "e", "m", "↵"],
      },
      {
        title: "Next match with n",
        hint: "Search for bug, then press n to jump to the second one.",
        raw: L(
          "▶hunting season is open",
          "the first bug bites",
          "lines of quiet code",
          "the second ◆bug hides"
        ),
        par: 6,
        solution: ["/", "b", "u", "g", "↵", "n"],
      },
      {
        title: "Star power: *",
        hint: "* searches for the exact word under your cursor. Zero typing.",
        raw: L(
          "count the ▶apples here",
          "oranges and pears",
          "more ◆apples below"
        ),
        par: 1,
        solution: ["*"],
      },
      {
        title: "Star, then n",
        hint: "* finds the next apple, n keeps the hunt going.",
        raw: L(
          "find every ▶apple in here",
          "apple pie recipe below",
          "the last ◆apple wins"
        ),
        par: 2,
        solution: ["*", "n"],
      },
    ]
  ),

  mod(
    "visual",
    11,
    "Visual Mode",
    "See what you're about to change: v V",
    [
      { key: "v", desc: "visual mode (by character)" },
      { key: "V", desc: "visual line mode" },
      { key: "d / y / c", desc: "delete / yank / change the selection" },
    ],
    [
      {
        title: "Select a line and delete: V d",
        hint: "V highlights the whole line. Then d removes what's lit up.",
        raw: L("keep this", "▶toss this line", "keep this too"),
        goalText: L("keep this", "keep this too"),
        par: 2,
        solution: ["V", "d"],
      },
      {
        title: "Grow the selection: V j d",
        hint: "While selecting, every motion you know still works. j grabs the next line.",
        raw: L("save me", "▶cut me", "cut me too", "save me too"),
        goalText: L("save me", "save me too"),
        par: 3,
        solution: ["V", "j", "d"],
      },
      {
        title: "Select, yank, paste: V y p",
        hint: "Yanking a visual selection, then p — another way to duplicate a line.",
        raw: L("▶twin line", "the end"),
        goalText: L("twin line", "twin line", "the end"),
        par: 3,
        solution: ["V", "y", "p"],
      },
      {
        title: "Select and change: v e c",
        hint: "v starts the selection, e stretches it to the word's end, c rewrites it.",
        raw: "this is ▶wrng",
        goalText: "this is wrong",
        par: 8,
        solution: ["v", "e", "c", "w", "r", "o", "n", "g", "Esc"],
      },
    ]
  ),

  mod(
    "gauntlet",
    12,
    "The Gauntlet",
    "Real fixes, everything combined. Par is tight — golf it.",
    [
      { key: "xp", desc: "swap two characters" },
      { key: "ddp", desc: "swap two lines" },
      { key: "f + a", desc: "snipe, then insert" },
      { key: "ci(", desc: "rewrite inside parens" },
    ],
    [
      {
        title: "The classic swap: xp",
        hint: "Cursor on the e of teh. x cuts it, p pastes it after the h. Two keys.",
        raw: "t▶eh quick fix",
        goalText: "the quick fix",
        par: 2,
        solution: ["x", "p"],
      },
      {
        title: "Two typos, one function",
        hint: "functoin needs an xp swap. helo needs an extra l — f gets you there fast.",
        raw: L("▶functoin greet() {", "  return \"helo\"", "}"),
        goalText: L("function greet() {", "  return \"hello\"", "}"),
        par: 9,
        solution: ["f", "o", "x", "p", "j", "f", "l", "a", "l", "Esc"],
      },
      {
        title: "Reorder the steps",
        hint: "dd doesn't just delete — it cuts. The line is in your register, waiting for p.",
        raw: L("▶step two", "step one", "step three"),
        goalText: L("step one", "step two", "step three"),
        par: 3,
        solution: ["d", "d", "p"],
      },
      {
        title: "Collapse the arguments",
        hint: "Everything inside the parens must become just data. One text object handles it.",
        raw: "print(▶\"debug\", data)",
        goalText: "print(data)",
        par: 7,
        solution: ["c", "i", "(", "d", "a", "t", "a", "Esc"],
      },
      {
        title: "Final boss: helo wrold",
        hint: "Two classic typos. f to snipe, a to add the l, then f r and the xp swap.",
        raw: "▶const greeting = \"helo wrold\";",
        goalText: "const greeting = \"hello world\";",
        par: 9,
        solution: ["f", "l", "a", "l", "Esc", "f", "r", "x", "p"],
      },
    ]
  ),
];

export const totalChallenges = modules.reduce(
  (n, m) => n + m.challenges.length,
  0
);

export function moduleById(id: string): VimModule | undefined {
  return modules.find((m) => m.id === id);
}

export const extraCheats: KeyInfo[] = [
  { key: ".", desc: "repeat the last change (the most underrated key)" },
  { key: "u / Ctrl-r", desc: "undo / redo" },
  { key: "%", desc: "jump between matching ( ) [ ] { }" },
  { key: ">> / <<", desc: "indent / outdent line" },
  { key: "zz", desc: "center the screen on the cursor" },
  { key: "Ctrl-d / Ctrl-u", desc: "scroll half a page down / up" },
  { key: "gd", desc: "go to definition (with LSP)" },
  { key: ":%s/old/new/g", desc: "replace old with new everywhere" },
  { key: "qa … q, then @a", desc: "record a macro into a, replay with @a" },
  { key: "ma, then 'a", desc: "set mark a, jump back to it" },
  { key: "Ctrl-o / Ctrl-i", desc: "jump back / forward through your jump history" },
  { key: "cit", desc: "change inside an HTML/JSX tag" },
];
