(() => {
  "use strict";

  const byId = id => document.getElementById(id);
  const setCode = (id, value) => {
    const el = byId(id);
    if (el) el.textContent = value == null ? "" : String(value);
  };
  const num = (id, fallback = 0) => {
    const el = byId(id);
    const v = el ? Number(el.value) : fallback;
    return Number.isFinite(v) ? v : fallback;
  };
  const int = (id, fallback = 0) => Math.trunc(num(id, fallback));

  function wrapTokens(tokens, perLine = 12) {
    const lines = [];
    for (let i = 0; i < tokens.length; i += perLine) {
      lines.push(tokens.slice(i, i + perLine).join(" "));
    }
    return lines.join("\n");
  }

  function cowProgramForText(value) {
    let current = 0;
    const tokens = ["OOO"];
    for (const ch of String(value)) {
      const target = ch.codePointAt(0);
      const delta = target - current;
      const op = delta >= 0 ? "MoO" : "MOo";
      for (let i = 0; i < Math.abs(delta); i++) tokens.push(op);
      tokens.push("Moo");
      current = target;
    }
    return wrapTokens(tokens, 12);
  }

  function refreshCow() {
    const a = num("cow-a"), b = num("cow-b");
    const op = byId("cow-op")?.value || "+";
    if (op === "/" && b === 0) return setCode("cow-source-view", "");
    const value = op === "+" ? a + b : op === "-" ? a - b : op === "*" ? a * b : a / b;
    const shown = Number.isInteger(value) ? String(value) : String(Number(value.toFixed(8)));
    setCode("cow-source-view", cowProgramForText(shown));
  }

  function refreshWhitespace() {
    /* app.js owns the real invisible Whitespace source. */
  }

  const scrabble = Object.fromEntries(Object.entries({
    AEILNORSTU:1, DG:2, BCMP:3, FHVWY:4, K:5, JX:8, QZ:10
  }).flatMap(([letters, score]) => [...letters].map(c => [c, score])));

  function beatnikWordForScore(n) {
    const tens = Math.floor(n / 10), ones = n % 10;
    return "z".repeat(tens) + "a".repeat(ones);
  }
  function beatnikProgramForText(value) {
    return [...String(value)].flatMap(ch => [
      "dare",
      beatnikWordForScore(ch.codePointAt(0)),
      "music"
    ]).join("\n");
  }
  function refreshBeatnik() {
    const phrase = (byId("beatnik-word")?.value || "").toUpperCase();
    const total = [...phrase].filter(c => /[A-Z]/.test(c)).reduce((s,c) => s + (scrabble[c] || 0), 0);
    setCode("beatnik-source-view", beatnikProgramForText(total));
  }

  function refreshLOL() {
    const age = Math.max(0, num("lol-age"));
    const method = byId("lol-method")?.value || "simple";
    if (method === "simple") {
      setCode("lolcode-source-view",
`HAI 1.2
I HAS A AGE ITZ ${age}
I HAS A HUMAN ITZ PRODUKT OF AGE AN 7
VISIBLE HUMAN
KTHXBYE`);
    } else {
      setCode("lolcode-source-view",
`HAI 1.2
I HAS A AGE ITZ ${age}
I HAS A HUMAN ITZ 0

BOTH SAEM AGE AN SMALLR OF AGE AN 1
O RLY?
  YA RLY
    HUMAN R PRODUKT OF AGE AN 15
  NO WAI
    BOTH SAEM AGE AN SMALLR OF AGE AN 2
    O RLY?
      YA RLY
        HUMAN R SUM OF 15 AN PRODUKT OF DIFF OF AGE AN 1 AN 9
      NO WAI
        HUMAN R SUM OF 24 AN PRODUKT OF DIFF OF AGE AN 2 AN 4
    OIC
OIC

VISIBLE HUMAN
KTHXBYE`);
    }
  }

  let rockMove = "rock";
  let rockRival = "mysterious";

  function refreshRockstar(move = rockMove, rival = rockRival) {
    rockMove = move;
    rockRival = rival;
    const rivalLine = rival === "mysterious"
      ? "The rival is mysterious"
      : `The rival is "${rival}"`;

    setCode("rockstar-source-view",
`My move is "${rockMove}"
${rivalLine}

If my move is the rival
  Shout "ENCORE"

If my move is "rock" and the rival is "scissors"
  Shout "YOU WIN"

If my move is "paper" and the rival is "rock"
  Shout "YOU WIN"

If my move is "scissors" and the rival is "paper"
  Shout "YOU WIN"

If my move is "rock" and the rival is "paper"
  Shout "ROCKSTAR WINS"

If my move is "paper" and the rival is "scissors"
  Shout "ROCKSTAR WINS"

If my move is "scissors" and the rival is "rock"
  Shout "ROCKSTAR WINS"`);
  }

  function refreshIntercal() {
    const a = Math.abs(int("inter-a")), b = Math.abs(int("inter-b"));
    const op = byId("inter-op")?.value || "+";
    const line = op === "+" ? "PLEASE DO :3 <- :1 + :2"
      : op === "-" ? "PLEASE DO :3 <- :1 - :2"
      : op === "*" ? "PLEASE DO :3 <- :1 * :2"
      : "PLEASE DO :3 <- :1 / :2";
    setCode("intercal-source-view",
`PLEASE DO :1 <- #${a}
DO :2 <- #${b}
${line}
DO READ OUT :3
DO GIVE UP`);
  }

  function bfPrintProgram(value) {
    let current = 0, out = "";
    for (const ch of String(value)) {
      const target = ch.codePointAt(0);
      const delta = target - current;
      out += delta >= 0 ? "+".repeat(delta) : "-".repeat(-delta);
      out += ".";
      current = target;
    }
    return out;
  }

  function bfToOok(code) {
    const map = {
      ">":"Ook. Ook?","<":"Ook? Ook.","+" :"Ook. Ook.","-":"Ook! Ook!",
      ".":"Ook! Ook.",",":"Ook. Ook!","[":"Ook! Ook?","]":"Ook? Ook!"
    };
    const pairs = [...code].map(ch => map[ch] || "").filter(Boolean);
    const lines = [];
    for (let i = 0; i < pairs.length; i += 8) lines.push(pairs.slice(i, i + 8).join(" "));
    return lines.join("\n");
  }
  function refreshOok() {
    const total = Math.max(0, int("ook-apes")) * Math.max(0, int("ook-rate")) * Math.max(0, int("ook-days"));
    setCode("ook-source-view", bfToOok(bfPrintProgram(total)));
  }

  function refreshChicken() {
    const total = Math.max(0, Math.round(Math.max(0, int("chick-count")) * Math.max(0, num("chick-rate")) * Math.max(0, int("chick-days"))));
    const lines = String(total).split("").map(d => "chicken ".repeat(Number(d) + 1).trim());
    setCode("chicken-source-view", lines.join("\n"));
  }

  const malbolge = `(=BA#9"=<;:3y7x54-21q/p-,+*)"!h%B0/.
~P<
<:(8&
66#"!~}|{zyxwvu
gJ%`;
  function refreshMalbolge() {
    setCode("malbolge-source-view", malbolge);
  }

  function refreshAHHH() {
    const n = num("ahhh-n");
    const op = byId("ahhh-op")?.value || "square";
    const value = Math.trunc(op === "square" ? n * n : n * n * n);
    const count = Math.max(1, Math.min(24, Math.abs(value) % 24 || 24));
    setCode("ahhh-source-view",
      ("A".repeat(op === "cube" ? 3 : 2) + "H".repeat(count)) + "\n" +
      ("a".repeat(op === "cube" ? 3 : 2) + "h".repeat(Math.max(1, Math.floor(count / 2))))
    );
  }

  const bindings = [
    [["cow-a","cow-b","cow-op"], refreshCow],
    [["beatnik-word"], refreshBeatnik],
    [["lol-age","lol-method"], refreshLOL],
    [["inter-a","inter-b","inter-op","inter-format"], refreshIntercal],
    [["ook-apes","ook-rate","ook-days"], refreshOok],
    [["chick-count","chick-rate","chick-days"], refreshChicken],
    [["mal-start","mal-base"], refreshMalbolge],
    [["ahhh-n","ahhh-op"], refreshAHHH]
  ];

  for (const [ids, fn] of bindings) {
    for (const id of ids) {
      const el = byId(id);
      if (!el) continue;
      el.addEventListener("input", fn);
      el.addEventListener("change", fn);
    }
    fn();
  }

  for (const button of document.querySelectorAll("#rps-buttons button")) {
    button.addEventListener("click", () => refreshRockstar(button.dataset.move || "rock", "mysterious"));
  }

  byId("rps-run")?.addEventListener("click", () => {
    const detail = byId("rps-detail")?.textContent || "";
    const match = detail.match(/Rockstar:\s*(ROCK|PAPER|SCISSORS)/i);
    refreshRockstar(rockMove, match ? match[1].toLowerCase() : "mysterious");
  });

  for (const [id, fn] of [
    ["cow-run",refreshCow],["beatnik-run",refreshBeatnik],["lol-run",refreshLOL],
    ["inter-run",refreshIntercal],["ook-run",refreshOok],["chick-run",refreshChicken],
    ["mal-run",refreshMalbolge],["ahhh-run",refreshAHHH]
  ]) {
    byId(id)?.addEventListener("click", fn);
  }

  refreshWhitespace();
  refreshRockstar();
})();