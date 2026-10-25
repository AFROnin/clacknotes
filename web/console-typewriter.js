// Easter egg: a little ASCII typewriter types "Hello" in the browser console
// whenever "Clack A Note" is clicked. Only a final still is printed for people
// who prefer reduced motion.
(() => {
  const TEXT = "Hello";
  const PAPER_WIDTH = 13;
  const PAPER_ROWS = 3;
  const STRIKE_COLUMN = 15;
  const WIDTH = 32;
  const KEY_ROWS = ["o o o o o o o o o o", " o o o o o o o o o ", "o o o o o o o o o o"];
  const STYLE = "font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 12px; line-height: 1.2; color: #8a7a62;";

  function blank() {
    return Array.from({ length: PAPER_ROWS + 9 }, () => Array(WIDTH).fill(" "));
  }

  function put(grid, row, column, text) {
    for (let index = 0; index < text.length; index += 1) {
      const x = column + index;
      if (row >= 0 && row < grid.length && x >= 0 && x < WIDTH) grid[row][x] = text[index];
    }
  }

  // lines: paper rows from top to bottom, the last one is being typed.
  // carriage: how far the carriage has moved left (the next letter lands under the strike point).
  function frame({ lines, carriage, strike = false, pressedKey = -1, bell = false }) {
    const grid = blank();
    const paperLeft = STRIKE_COLUMN - 2 - carriage;

    // Paper: a sheet sticking up out of the carriage.
    put(grid, 0, paperLeft, ` ${"_".repeat(PAPER_WIDTH)} `);
    lines.slice(-PAPER_ROWS).forEach((line, index) => {
      put(grid, 1 + index, paperLeft, `|${` ${line}`.padEnd(PAPER_WIDTH)}|`);
    });

    // Platen and carriage knobs move with the paper.
    const platenRow = 1 + PAPER_ROWS;
    put(grid, platenRow, paperLeft - 2, `(@[${"=".repeat(PAPER_WIDTH)}]@)`);
    if (bell) put(grid, platenRow - 1, paperLeft + PAPER_WIDTH + 4, "ding!");

    // Typebar basket: the middle bar rises to the paper on a strike.
    const basket = platenRow + 1;
    put(grid, basket, 4, "_".repeat(24));
    put(grid, basket + 1, 3, "/");
    put(grid, basket + 1, 28, "\\");
    put(grid, basket + 1, STRIKE_COLUMN - 6, strike ? "\\ \\ \\   / / /" : "\\ \\ \\ | / / /");
    if (strike) {
      // The middle typebar swings up past the platen and hits the paper's typing line.
      put(grid, basket, STRIKE_COLUMN, "|");
      put(grid, platenRow, STRIKE_COLUMN, "|");
      put(grid, PAPER_ROWS, STRIKE_COLUMN, "*");
    }

    // Keyboard: the pressed key sinks.
    KEY_ROWS.forEach((keys, rowIndex) => {
      const row = basket + 2 + rowIndex;
      put(grid, row, 2, "|");
      put(grid, row, 29, "|");
      const pressed = [...keys].map((key, index) => (key === "o" && rowIndex * 20 + index === pressedKey ? "." : key));
      put(grid, row, 6, pressed.join(""));
    });
    put(grid, basket + 5, 2, `|${"[__________]".padStart(18).padEnd(26)}|`);
    put(grid, basket + 6, 2, `'${"-".repeat(26)}'`);

    return grid.map((row) => row.join("").replace(/\s+$/, "")).join("\n");
  }

  function keyFor(letter) {
    // Any stable key position per letter, so each letter presses a different key.
    const row = letter.charCodeAt(0) % KEY_ROWS.length;
    const keys = [...KEY_ROWS[row]].map((key, index) => (key === "o" ? index : -1)).filter((index) => index >= 0);
    return row * 20 + keys[letter.charCodeAt(0) % keys.length];
  }

  function buildFrames() {
    const frames = [];
    const empty = Array(PAPER_ROWS).fill("");
    let lines = [...empty];
    frames.push({ art: frame({ lines, carriage: 0 }), ms: 400 });

    for (let index = 0; index < TEXT.length; index += 1) {
      const letter = TEXT[index];
      const typed = lines[lines.length - 1];
      frames.push({ art: frame({ lines, carriage: index, pressedKey: keyFor(letter) }), ms: 90 });
      frames.push({ art: frame({ lines, carriage: index, pressedKey: keyFor(letter), strike: true }), ms: 80 });
      lines = [...lines.slice(0, -1), typed + letter];
      frames.push({ art: frame({ lines, carriage: index + 1 }), ms: 150 });
    }

    // End of line: bell, carriage return, then the paper advances one line.
    frames.push({ art: frame({ lines, carriage: TEXT.length, bell: true }), ms: 450 });
    frames.push({ art: frame({ lines, carriage: Math.ceil(TEXT.length / 2) }), ms: 70 });
    frames.push({ art: frame({ lines, carriage: 0 }), ms: 120 });
    lines = [...lines.slice(1), ""];
    frames.push({ art: frame({ lines, carriage: 0 }), ms: 0 });
    return frames;
  }

  if (typeof window === "undefined") {
    // Node preview: `node web/console-typewriter.js` prints every frame.
    for (const { art, ms } of buildFrames()) console.log(`${art}\n-- ${ms}ms --`);
    return;
  }

  const frames = buildFrames();
  const finalArt = frames[frames.length - 1].art;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let playing = false;

  function show(art) {
    console.log(`%c${art}`, STYLE);
  }

  // Each frame clears the console, since it cannot redraw text in place.
  function play() {
    if (playing) return;
    if (reducedMotion) {
      show(finalArt);
      return;
    }
    playing = true;
    let index = 0;
    const next = () => {
      console.clear();
      show(frames[index].art);
      const { ms } = frames[index];
      index += 1;
      if (index < frames.length) {
        setTimeout(next, ms);
      } else {
        playing = false;
      }
    };
    next();
  }

  // Only "Clack A Note" sets it off, so the console stays quiet otherwise.
  document.querySelector("#new-button")?.addEventListener("click", play);
})();
