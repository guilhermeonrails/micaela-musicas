const track = document.getElementById("track");
const KEY = "mica-playlist:index";
const cache = {};
let slugs = [];
let current = 0;

const load = slug => cache[slug] || (cache[slug] =
  fetch("songs/" + slug + ".txt", { cache: "no-store" }).then(r => r.text()).then(parseSong));

async function mount(i) {
  const slide = track.children[i];
  if (!slide || slide.dataset.mounted) return;
  slide.dataset.mounted = "1";
  const song = await load(slugs[i]);
  slide.replaceChildren(renderSong(song));
  await document.fonts.ready;
  fitSheet(slide);
}

function unmount(i) {
  const slide = track.children[i];
  if (slide && slide.dataset.mounted) {
    delete slide.dataset.mounted;
    slide.replaceChildren();
  }
}

function show(i) {
  current = i;
  try { localStorage.setItem(KEY, i); } catch (e) {}
  slugs.forEach((_, k) => (Math.abs(k - i) <= 1 ? mount(k) : unmount(k)));
}

function currentIndex() {
  return Math.round(track.scrollLeft / track.clientWidth);
}

async function init() {
  slugs = (await fetch("songs/index.txt", { cache: "no-store" }).then(r => r.text())).split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  slugs.forEach(() => track.append(Object.assign(document.createElement("section"), { className: "slide" })));

  let start = 0;
  try { start = Math.min(+localStorage.getItem(KEY) || 0, slugs.length - 1); } catch (e) {}
  track.style.scrollSnapType = "none";
  track.scrollLeft = start * track.clientWidth;
  track.style.scrollSnapType = "";
  show(start);

  let t;
  track.addEventListener("scroll", () => {
    clearTimeout(t);
    t = setTimeout(() => { const i = currentIndex(); if (i !== current) show(i); }, 80);
  }, { passive: true });

  window.addEventListener("resize", () => {
    track.scrollLeft = current * track.clientWidth;
    document.querySelectorAll(".slide[data-mounted]").forEach(fitSheet);
  });

  document.addEventListener("contextmenu", e => e.preventDefault());
  try { screen.orientation.lock("portrait").catch(() => {}); } catch (e) {}
}

init();
