// Checks for web/merge.js; run with `node tests/merge_test.js` (tests/test_merge.py runs it too).
const assert = require("node:assert/strict");
const path = require("node:path");
const { merge3 } = require(path.join(__dirname, "..", "web", "merge.js"));

const cases = [
  {
    name: "only mine changed",
    base: "a\nb\nc",
    mine: "a\nB\nc",
    theirs: "a\nb\nc",
    text: "a\nB\nc",
    conflict: false,
  },
  {
    name: "only theirs changed",
    base: "a\nb\nc",
    mine: "a\nb\nc",
    theirs: "a\nb\nC",
    text: "a\nb\nC",
    conflict: false,
  },
  {
    name: "both changed different lines",
    base: "#list\n\nMilk\nBread\nCoffee\nApples",
    mine: "#list\n\n~~Milk~~\nBread\nCoffee\nApples",
    theirs: "#list\n\nMilk\nBread\nCoffee\nApples\nEggs",
    text: "#list\n\n~~Milk~~\nBread\nCoffee\nApples\nEggs",
    conflict: false,
  },
  {
    name: "same change on both sides",
    base: "a\nb\nc",
    mine: "a\nX\nc",
    theirs: "a\nX\nc",
    text: "a\nX\nc",
    conflict: false,
  },
  {
    name: "both changed the same line",
    base: "a\nb\nc",
    mine: "a\nmine\nc",
    theirs: "a\ntheirs\nc",
    text: "a\nmine\nc",
    conflict: true,
  },
  {
    name: "additions at start and end",
    base: "middle",
    mine: "top\nmiddle",
    theirs: "middle\nbottom",
    text: "top\nmiddle\nbottom",
    conflict: false,
  },
  {
    name: "one side deletes a line, other edits another",
    base: "one\ntwo\nthree\nfour\nfive",
    mine: "one\nthree\nfour\nfive",
    theirs: "one\ntwo\nthree\nfour\nFIVE",
    text: "one\nthree\nfour\nFIVE",
    conflict: false,
  },
  {
    name: "empty base, both write",
    base: "",
    mine: "hello",
    theirs: "world",
    text: "hello",
    conflict: true,
  },
  {
    name: "neighbouring lines count as a clash",
    base: "a\nb\nc\nd",
    mine: "a\nB\nc\nd",
    theirs: "a\nb\nC\nd",
    text: "a\nB\nc\nd",
    conflict: true,
  },
];

for (const item of cases) {
  const result = merge3(item.base, item.mine, item.theirs);
  assert.equal(result.text, item.text, `${item.name}: text`);
  assert.equal(result.conflict, item.conflict, `${item.name}: conflict`);
}

// A long note with one change at each end stays fast and correct.
const long = Array.from({ length: 4000 }, (_, i) => `line ${i}`);
const mineLong = ["first changed", ...long.slice(1)];
const theirsLong = [...long.slice(0, -1), "last changed"];
const started = Date.now();
const big = merge3(long.join("\n"), mineLong.join("\n"), theirsLong.join("\n"));
assert.equal(big.conflict, false);
assert.equal(big.text.split("\n")[0], "first changed");
assert.equal(big.text.split("\n").at(-1), "last changed");
assert.ok(Date.now() - started < 1000, "long note merges quickly");

console.log(`merge3: ${cases.length + 1} checks passed`);
