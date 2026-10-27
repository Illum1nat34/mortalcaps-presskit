// Mortal Caps press kit: language switch, top bar state, reveal on scroll, loops that play only in view, the YouTube facade, cap flips, lightbox.
(() => {
  const d = document.documentElement, $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // language: html.ru shows the Russian spans; alt texts and the title swap from data-ru
  const altEn = new Map();
  function setLang(l) {
    d.classList.toggle("ru", l === "ru"); d.lang = l;
    $$(".lang button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.lang === l)));
    $$("[data-ru-alt]").forEach(el => { if (!altEn.has(el)) altEn.set(el, el.getAttribute("aria-label") ?? el.alt);
      const v = l === "ru" ? el.dataset.ruAlt : altEn.get(el); if (el.tagName === "IMG") el.alt = v; else el.setAttribute("aria-label", v); });
    document.title = l === "ru" ? d.dataset.titleRu : d.dataset.titleEn;
    try { localStorage.setItem("mc-lang", l); } catch (e) {}
  }
  $$(".lang button").forEach(b => b.onclick = () => setLang(b.dataset.lang));
  setLang(d.classList.contains("ru") ? "ru" : "en");

  // top bar turns solid once the hero is out of view; the hero video pauses there too
  const top = $(".top"), hero = $(".hero"), hv = $(".hero-bg");
  new IntersectionObserver(([e]) => {
    top.classList.toggle("solid", !e.isIntersecting);
    if (hv) { if (e.isIntersecting && !still) hv.play().catch(() => {}); else hv.pause(); }
  }, { rootMargin: "-64px 0px 0px 0px" }).observe(hero);
  if (hv && still) { hv.removeAttribute("autoplay"); hv.pause(); }

  // reveal blocks as they come in
  const rv = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); rv.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
  $$(".rv").forEach(el => rv.observe(el));

  // loops: load on first view, play only while visible
  const lv = new IntersectionObserver(es => es.forEach(e => {
    const v = e.target;
    if (e.isIntersecting) { if (!v.src) v.src = v.dataset.src; if (!still) v.play().catch(() => {}); } else v.pause();
  }), { rootMargin: "120px 0px" });
  $$("video[data-src]").forEach(v => lv.observe(v));

  // trailer: a thumbnail until clicked, then the privacy-enhanced YouTube player
  $$(".play").forEach(b => b.onclick = () => {
    const f = document.createElement("iframe");
    f.src = `https://www.youtube-nocookie.com/embed/${b.dataset.yt}?autoplay=1&rel=0&hl=${d.lang}`;
    f.title = "Mortal Caps trailer"; f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen"; f.allowFullscreen = true;
    b.replaceWith(f);
  });

  // caps: tap or Enter flips (hover flips on mouse devices through CSS)
  $$(".flip").forEach(b => b.onclick = () => b.closest(".cap").classList.toggle("flipped"));

  // copy the press address
  $$("[data-copy]").forEach(b => b.onclick = async () => {
    const lbl = $$(".cl", b);
    try { await navigator.clipboard.writeText(b.dataset.copy); lbl.forEach(s => s.dataset.t = s.textContent);
      lbl.forEach(s => s.textContent = s.classList.contains("ru") ? "Скопировано" : "Copied");
      setTimeout(() => lbl.forEach(s => s.textContent = s.dataset.t), 1600); } catch (e) { location.href = "mailto:" + b.dataset.copy; }
  });

  // lightbox over every .zoom, grouped by data-g; arrows, Escape, download of the original
  const lb = $("#lb"), img = $(".lb-fig img", lb), cap = $(".lb-cap", lb), num = $(".lb-n", lb), dl = $(".lb-dl", lb);
  let group = [], at = 0;
  function show(i) {
    at = (i + group.length) % group.length; const z = group[at];
    img.src = z.dataset.full; img.className = z.dataset.alpha ? "alpha" : "";
    img.alt = (d.classList.contains("ru") ? z.dataset.capRu : z.dataset.capEn) || "";
    cap.innerHTML = `<span class="en">${z.dataset.capEn || ""}</span><span class="ru">${z.dataset.capRu || z.dataset.capEn || ""}</span>`;
    num.textContent = group.length > 1 ? `${at + 1} / ${group.length}` : "";
    dl.href = z.dataset.file; dl.querySelector("small").textContent = z.dataset.meta || "";
    $$(".lb-prev, .lb-next", lb).forEach(b => b.hidden = group.length < 2);
    const nx = group[(at + 1) % group.length]; if (nx) new Image().src = nx.dataset.full;
  }
  $$(".zoom").forEach(z => z.onclick = () => { group = $$(`.zoom[data-g="${z.dataset.g}"]`); show(group.indexOf(z)); lb.showModal(); });
  $(".lb-prev", lb).onclick = () => show(at - 1);
  $(".lb-next", lb).onclick = () => show(at + 1);
  $(".lb-close", lb).onclick = () => lb.close();
  lb.addEventListener("click", e => { if (e.target === lb || e.target.classList.contains("lb-fig")) lb.close(); });
  lb.addEventListener("keydown", e => { if (e.key === "ArrowLeft") show(at - 1); if (e.key === "ArrowRight") show(at + 1); });
  lb.addEventListener("close", () => { img.removeAttribute("src"); });
})();
