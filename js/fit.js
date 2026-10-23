// escala --u (px) ate a cifra preencher a tela sem estourar
function fitSheet(slide) {
  const sheet = slide.querySelector(".sheet");
  const body = slide.querySelector(".body");
  if (!sheet) return;

  const fits = u => {
    slide.style.setProperty("--u", u + "px");
    // corpo em modo natural para medir a altura real
    body.style.justifyContent = "flex-start";
    body.style.flex = "0 0 auto";
    const ok = sheet.scrollHeight <= sheet.clientHeight + 1 &&
               [...slide.querySelectorAll(".bar")].every(b => b.scrollWidth <= b.clientWidth + 1) &&
               sheet.scrollWidth <= sheet.clientWidth + 1 &&
               sheet.getBoundingClientRect().height + sheet.querySelector(".head").offsetHeight >= 0 &&
               natural(sheet) <= sheet.clientHeight;
    body.style.justifyContent = "";
    body.style.flex = "";
    return ok;
  };

  let lo = 8, hi = 40;
  for (let i = 0; i < 9; i++) {
    const mid = (lo + hi) / 2;
    if (fits(mid)) lo = mid; else hi = mid;
  }
  slide.style.setProperty("--u", lo + "px");
}

function natural(sheet) {
  return [...sheet.children].reduce((h, c) => h + c.offsetHeight, 0);
}
