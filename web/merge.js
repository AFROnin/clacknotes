// Three-way line merge for notes edited in two places at once.
// merge3(base, mine, theirs) combines both sets of changes made to `base`. Changes that touch
// different lines are both kept; if both sides changed the same (or neighbouring) lines differently,
// the result keeps "mine" there and reports conflict: true.
(function (root) {
  // Changes from a to b as hunks: a[aStart, aEnd) is replaced by `lines`.
  function diffLines(a, b) {
    let prefix = 0;
    while (prefix < a.length && prefix < b.length && a[prefix] === b[prefix]) prefix += 1;
    let suffix = 0;
    while (
      suffix < a.length - prefix &&
      suffix < b.length - prefix &&
      a[a.length - 1 - suffix] === b[b.length - 1 - suffix]
    ) {
      suffix += 1;
    }
    const aMid = a.slice(prefix, a.length - suffix);
    const bMid = b.slice(prefix, b.length - suffix);
    if (!aMid.length && !bMid.length) return [];

    // Longest common subsequence over the changed middle only (usually a few lines).
    const rows = aMid.length + 1;
    const cols = bMid.length + 1;
    const table = new Uint32Array(rows * cols);
    for (let i = aMid.length - 1; i >= 0; i -= 1) {
      for (let j = bMid.length - 1; j >= 0; j -= 1) {
        table[i * cols + j] =
          aMid[i] === bMid[j]
            ? table[(i + 1) * cols + j + 1] + 1
            : Math.max(table[(i + 1) * cols + j], table[i * cols + j + 1]);
      }
    }

    const hunks = [];
    let current = null;
    const flush = () => {
      if (current) hunks.push(current);
      current = null;
    };
    let i = 0;
    let j = 0;
    while (i < aMid.length || j < bMid.length) {
      if (i < aMid.length && j < bMid.length && aMid[i] === bMid[j]) {
        flush();
        i += 1;
        j += 1;
      } else if (j < bMid.length && (i === aMid.length || table[i * cols + j + 1] >= table[(i + 1) * cols + j])) {
        current = current || { aStart: prefix + i, aEnd: prefix + i, lines: [] };
        current.lines.push(bMid[j]);
        j += 1;
      } else {
        current = current || { aStart: prefix + i, aEnd: prefix + i, lines: [] };
        i += 1;
        current.aEnd = prefix + i;
      }
    }
    flush();
    return hunks;
  }

  // The text of base[start, end) with the given hunks (all inside that span) applied.
  function applyHunks(base, start, end, hunks) {
    const out = [];
    let cursor = start;
    for (const hunk of hunks) {
      out.push(...base.slice(cursor, hunk.aStart), ...hunk.lines);
      cursor = hunk.aEnd;
    }
    out.push(...base.slice(cursor, end));
    return out;
  }

  function merge3(base, mine, theirs) {
    if (mine === theirs || theirs === base) return { text: mine, conflict: false };
    if (mine === base) return { text: theirs, conflict: false };

    const baseLines = base.split("\n");
    const mineHunks = diffLines(baseLines, mine.split("\n")).map((hunk) => ({ ...hunk, side: "mine" }));
    const theirHunks = diffLines(baseLines, theirs.split("\n")).map((hunk) => ({ ...hunk, side: "theirs" }));
    const all = [...mineHunks, ...theirHunks].sort((x, y) => x.aStart - y.aStart || x.aEnd - y.aEnd);

    const out = [];
    let conflict = false;
    let position = 0;
    let index = 0;
    while (index < all.length) {
      // A group of hunks whose base ranges overlap or touch; touching edits by both sides count as a clash.
      let start = all[index].aStart;
      let end = all[index].aEnd;
      const group = [all[index]];
      index += 1;
      while (index < all.length && all[index].aStart <= end) {
        end = Math.max(end, all[index].aEnd);
        group.push(all[index]);
        index += 1;
      }
      start = Math.min(...group.map((hunk) => hunk.aStart));

      out.push(...baseLines.slice(position, start));
      const mineGroup = group.filter((hunk) => hunk.side === "mine");
      const theirGroup = group.filter((hunk) => hunk.side === "theirs");
      const mineText = applyHunks(baseLines, start, end, mineGroup);
      if (!theirGroup.length) {
        out.push(...mineText);
      } else if (!mineGroup.length) {
        out.push(...applyHunks(baseLines, start, end, theirGroup));
      } else {
        const theirText = applyHunks(baseLines, start, end, theirGroup);
        if (mineText.join("\n") !== theirText.join("\n")) conflict = true;
        out.push(...mineText);
      }
      position = end;
    }
    out.push(...baseLines.slice(position));
    return { text: out.join("\n"), conflict };
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { merge3, diffLines };
  } else {
    root.merge3 = merge3;
  }
})(typeof window !== "undefined" ? window : globalThis);
