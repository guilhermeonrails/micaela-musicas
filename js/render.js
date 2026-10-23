// objeto da musica -> elemento DOM
function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

const acc = s => s.replace("#", "♯").replace(/b$/, "♭");

function chordEl(src) {
  const c = el("span", "chord");
  const [main, bass] = src.split("/");
  const m = main.match(/^([A-G])([#b]?)(m(?!a))?(.*)$/);
  if (!m) { c.textContent = src; return c; }
  c.append(m[1]);
  if (m[2]) c.append(el("span", "acc", m[2] === "#" ? "\u266F" : "\u266D"));
  if (m[3]) c.append("m");
  if (m[4]) {
    const q = m[4].replace(/b(?=\d)/g, "\u266D").replace(/#(?=\d)/g, "\u266F");
    c.append(el("span", /^ma/.test(q) ? "q ma" : "q", q));
  }
  if (bass) {
    c.append(el("span", "sl", "/"), el("span", "b", bass[0] + (bass[1] ? (bass[1] === "#" ? "\u266F" : "\u266D") : "")));
  }
  return c;
}

function barEl(bar, ctx) {
  const b = el("div", "bar");
  bar.chords.forEach(ch => b.append(chordEl(ch)));
  if (ctx.first) b.classList.add("first");
  if (ctx.first && ctx.repeat) b.classList.add("rep-start");
  if (ctx.last) b.classList.add("last");
  if (ctx.last && ctx.repeat) b.classList.add("rep-end");
  if (bar.ending === 1) b.classList.add("last", "rep-end");
  if (ctx.final) b.classList.add("final");
  if (bar.ending) b.append(el("div", "ending", bar.ending + "."));
  bar.marks.forEach(mk => b.append(el("div", "mark", mk === "fermata" ? "\u{1D110}" : mk)));
  return b;
}

function renderSong(song) {
  const sheet = el("div", "sheet");

  const head = el("div", "head");
  if (song.key) head.append(el("div", "key", "key of " + acc(song.key)));
  head.append(el("div", "title", song.title + (song.capo ? " (Capo " + song.capo + ")" : "")));
  head.append(el("div", "artist", song.artist));
  sheet.append(head);

  const body = el("div", "body");
  song.sections.forEach((sec, si) => {
    const wrap = el("div", "section");
    wrap.append(el("div", "section-label", sec.name));
    sec.rows.forEach((row, ri) => {
      const r = el("div", "row");
      row.forEach((bar, bi) => {
        const lastRow = ri === sec.rows.length - 1;
        r.append(barEl(bar, {
          first: bi === 0 && ri === 0,
          last: bi === row.length - 1 && lastRow,
          repeat: sec.repeat,
          final: si === song.sections.length - 1 && lastRow && bi === row.length - 1,
        }));
      });
      for (let k = row.length; k < 4; k++) r.append(el("div", "bar empty"));
      wrap.append(r);
    });
    body.append(wrap);
  });
  sheet.append(body);
  return sheet;
}
