// texto (.txt) -> { title, artist, key, capo, time, notes, sections }
function parseSong(text) {
  const song = { title: "", artist: "", key: "", capo: "", time: "4/4", notes: "", sections: [] };
  let section = null;

  text.split(/\r?\n/).forEach((raw, i) => {
    const line = raw.trim();
    if (!line) return;

    const sec = line.match(/^\[([^\]]+)\]\s*(repeat)?$/i);
    if (sec) {
      section = { name: sec[1], repeat: !!sec[2], rows: [] };
      song.sections.push(section);
      return;
    }

    if (line[0] === "|") {
      if (!section) { console.warn("linha " + (i + 1) + ": compassos fora de secao"); return; }
      const bars = line.split("|").slice(1).map(s => s.trim()).filter(Boolean).map(parseBar);
      if (bars.length) section.rows.push(bars);
      return;
    }

    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv && kv[1] in song && !section) { song[kv[1]] = kv[2]; return; }

    console.warn("linha " + (i + 1) + " ignorada: " + line);
  });

  return song;
}

function parseBar(src) {
  const bar = { chords: [], ending: null, marks: [] };
  src.split(/\s+/).forEach(tok => {
    if (/^:\d$/.test(tok)) bar.ending = +tok[1];
    else if (/^(fermata|coda|D\.C\.)$/i.test(tok)) bar.marks.push(tok.toLowerCase() === "d.c." ? "D.C." : tok.toLowerCase());
    else bar.chords.push(tok);
  });
  return bar;
}
