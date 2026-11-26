/* ==========================================================================
   L'aura Hypnose — motion design (sans bibliothèque)
   Intro « respiration », voile entre les pages, aura vivante, titres mot à
   mot, arbre qui pousse + pétales, vagues qui ondulent, citations qui
   s'illuminent, cartes en relief, boutons magnétiques, barre de lecture.
   ========================================================================== */
(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const root = document.documentElement;

  if (reduce) return;
  root.classList.add("motion-on");

  const store = {
    get(key) {
      try { return window.sessionStorage.getItem(key); } catch (e) { return null; }
    },
    set(key, value) {
      try { window.sessionStorage.setItem(key, value); } catch (e) { /* stockage indisponible */ }
    },
  };

  /* ---------- Intro « respiration » : une seule fois par visite ---------- */
  const playIntro = !store.get("aura-intro");
  if (playIntro) {
    store.set("aura-intro", "1");
    const intro = document.createElement("div");
    intro.className = "intro";
    intro.setAttribute("aria-hidden", "true");
    const letters = [..."L’aura Hypnose"]
      .map((ch, i) => `<span style="--i:${i}">${ch === " " ? "&nbsp;" : ch}</span>`)
      .join("");
    intro.innerHTML = `
      <div class="intro-stage">
        <div class="intro-breath"></div>
        <div class="intro-ring"></div>
        <div class="intro-ring"></div>
        <div class="intro-word">${letters}</div>
      </div>
      <p class="intro-hint">Inspirez… expirez</p>`;
    document.body.appendChild(intro);
    const close = () => {
      intro.classList.add("is-done");
      setTimeout(() => intro.remove(), 1000);
    };
    const timer = setTimeout(close, 1900);
    intro.addEventListener("click", () => { clearTimeout(timer); close(); });
  }

  /* ---------- Voile doux entre les pages ---------- */
  const veil = document.createElement("div");
  veil.className = "veil";
  veil.setAttribute("aria-hidden", "true");
  if (playIntro) veil.classList.add("is-hidden");
  document.body.appendChild(veil);
  requestAnimationFrame(() => requestAnimationFrame(() => veil.classList.add("is-hidden")));

  window.addEventListener("pageshow", (event) => {
    if (event.persisted) veil.classList.add("is-hidden");
  });

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link || event.defaultPrevented) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    if (link.target === "_blank" || link.hasAttribute("download")) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || !/\.html?$/.test(url.pathname)) return;
    if (url.pathname === location.pathname && url.hash) return;
    event.preventDefault();
    veil.classList.remove("is-hidden");
    setTimeout(() => { location.href = url.href; }, 480);
  });

  /* ---------- Barre de progression de lecture ---------- */
  const progress = document.createElement("div");
  progress.className = "scroll-progress";
  progress.setAttribute("aria-hidden", "true");
  document.body.appendChild(progress);

  /* ---------- Aura vivante derrière les en-têtes ---------- */
  document.querySelectorAll(".hero, .page-hero").forEach((zone) => {
    const field = document.createElement("div");
    field.className = "aura-field";
    field.setAttribute("aria-hidden", "true");
    field.innerHTML = '<span class="aura-blob"></span><span class="aura-blob"></span><span class="aura-blob"></span>';
    zone.prepend(field);
  });

  const hero = document.querySelector(".hero");
  if (hero && finePointer) {
    const glow = document.createElement("div");
    glow.className = "aura-cursor";
    glow.setAttribute("aria-hidden", "true");
    hero.prepend(glow);
    let tx = 0, ty = 0, x = 0, y = 0, running = false;
    const follow = () => {
      x += (tx - x) * 0.08;
      y += (ty - y) * 0.08;
      glow.style.setProperty("--mx", `${x}px`);
      glow.style.setProperty("--my", `${y}px`);
      running = Math.abs(tx - x) > 0.5 || Math.abs(ty - y) > 0.5;
      if (running) requestAnimationFrame(follow);
    };
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
      if (!hero.classList.contains("is-pointer")) { x = tx; y = ty; hero.classList.add("is-pointer"); }
      if (!running) { running = true; requestAnimationFrame(follow); }
    });
    hero.addEventListener("pointerleave", () => hero.classList.remove("is-pointer"));
  }

  /* ---------- Découpage en mots (titres et citations) ---------- */
  const splitWords = (el, cls) => {
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === 3) {
          const parts = child.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const span = document.createElement("span");
            span.className = cls;
            span.textContent = part;
            frag.appendChild(span);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1 && child.tagName !== "CITE") {
          walk(child);
        }
      });
    };
    walk(el);
    return el.querySelectorAll(`.${cls}`);
  };

  const onView = (el, cb, options = { threshold: 0.2 }) => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { cb(entry.target); io.unobserve(entry.target); }
      });
    }, options);
    io.observe(el);
  };

  document.querySelectorAll(".hero h1, .page-hero h1, .section-title, .offer-card h2, .contact-copy h2").forEach((title) => {
    title.classList.remove("reveal");
    title.removeAttribute("data-reveal");
    splitWords(title, "word").forEach((w, i) => w.style.setProperty("--w", i));
    title.classList.add("split-ready");
    const delay = playIntro && title.closest(".hero, .page-hero") ? 1500 : 0;
    onView(title, (t) => setTimeout(() => t.classList.add("is-in"), delay));
  });

  /* ---------- Citations qui s'illuminent mot après mot au défilement ---------- */
  const glowBlocks = [...document.querySelectorAll(".quote-band blockquote, .about-quote p")].map((block) => {
    block.classList.add("glow-words");
    return { block, words: [...splitWords(block, "gw")] };
  });

  /* ---------- Listes qui apparaissent en cascade ---------- */
  document.querySelectorAll(".support-list").forEach((list) => {
    [...list.children].forEach((li, i) => li.style.setProperty("--n", i));
    list.classList.add("stagger-in");
    onView(list, (l) => l.classList.add("is-in"), { threshold: 0.15 });
  });

  /* ---------- L'arbre pousse depuis ses racines, puis des pétales tombent ---------- */
  const tree = document.querySelector(".tree-hang");
  if (tree) {
    const petalSvg = '<svg viewBox="0 0 40 25" aria-hidden="true"><path d="M2 12.5C10 1 30 1 38 12.5 30 24 10 24 2 12.5Z" fill="rgb(232 170 170 / 85%)"/><path d="M4 12.5H36" stroke="rgb(190 120 120 / 50%)" stroke-width="1"/></svg>';
    const count = window.innerWidth < 700 ? 6 : 11;
    for (let i = 0; i < count; i += 1) {
      const petal = document.createElement("span");
      petal.className = "petal";
      const rand = (a, b) => a + Math.random() * (b - a);
      petal.style.cssText = [
        `--x:${rand(22, 74)}%`,
        `--y:${rand(38, 70)}%`,
        `--size:${rand(10, 18)}px`,
        `--t:${rand(9, 15)}s`,
        `--delay:${rand(0, 9) + 2.6}s`,
        `--dx:${rand(-120, 120)}px`,
        `--dy:${rand(160, 320)}px`,
      ].join(";");
      petal.innerHTML = petalSvg;
      tree.appendChild(petal);
    }
    onView(tree, (t) => setTimeout(() => t.classList.add("is-grown"), playIntro ? 1300 : 150), { threshold: 0.05 });
  }

  /* ---------- Les vagues ondulent lentement ---------- */
  document.querySelectorAll(".wave path").forEach((path, index) => {
    const d = path.getAttribute("d");
    if (!d || typeof path.animate !== "function") return;
    let k = 0;
    const alt = d.replace(/(\d+(?:\.\d+)?),(\d+(?:\.\d+)?)/g, (match, px, py) => {
      const x = Number(px), y = Number(py);
      if (y >= 90) return match;
      k += 1;
      const shift = (k % 2 ? 1 : -1) * (x === 0 || x === 1440 ? 8 : 16);
      return `${x},${Math.max(4, Math.min(86, y + shift))}`;
    });
    try {
      path.animate([{ d: `path("${d}")` }, { d: `path("${alt}")` }], {
        duration: 9000 + index * 1300,
        direction: "alternate",
        iterations: Infinity,
        easing: "ease-in-out",
      });
    } catch (e) { /* navigateur sans animation de tracé : vague fixe */ }
  });

  /* ---------- Cartes en relief + boutons magnétiques (souris uniquement) ---------- */
  if (finePointer) {
    document.querySelectorAll(".soft-card, .price-card").forEach((card) => {
      card.classList.add("tilt");
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        card.classList.add("is-tilting");
        card.style.setProperty("--ry", `${(px - 0.5) * 5}deg`);
        card.style.setProperty("--rx", `${(0.5 - py) * 5}deg`);
        card.style.setProperty("--gx", `${px * 100}%`);
        card.style.setProperty("--gy", `${py * 100}%`);
      });
      card.addEventListener("pointerleave", () => {
        card.classList.remove("is-tilting");
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
      });
    });

    document.querySelectorAll(".hero-actions .button, .page-actions .button, .header-cta").forEach((btn) => {
      btn.classList.add("magnetic");
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        btn.style.transform = `translate(${dx * 0.18}px, ${dy * 0.28}px)`;
      });
      btn.addEventListener("pointerleave", () => { btn.style.transform = ""; });
    });
  }

  /* ---------- Une seule boucle de défilement pour tout ---------- */
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const max = root.scrollHeight - window.innerHeight;
    progress.style.setProperty("--progress", max > 0 ? (window.scrollY / max).toFixed(4) : 0);

    const vh = window.innerHeight;
    glowBlocks.forEach(({ block, words }) => {
      const r = block.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      // 0 quand le bloc entre par le bas, 1 quand il atteint le tiers haut
      const p = Math.min(1, Math.max(0, (vh * 0.9 - r.top) / (vh * 0.9 - vh * 0.35)));
      const lit = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle("is-lit", i < lit));
    });
  };
  const requestScroll = () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  };
  window.addEventListener("scroll", requestScroll, { passive: true });
  window.addEventListener("resize", requestScroll);
  onScroll();
})();
