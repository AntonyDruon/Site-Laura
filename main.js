(() => {
  const header = document.querySelector(".site-header");
  const menuToggle = document.querySelector(".menu-toggle");
  const navigation = document.querySelector("#navigation");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ----- Menu (bouton à gauche) ----- */
  const setMenu = (open) => {
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    navigation.classList.toggle("is-open", open);
  };

  menuToggle.addEventListener("click", () => {
    setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
  });

  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenu(false);
  });

  document.addEventListener("click", (event) => {
    if (!header.contains(event.target)) setMenu(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMenu(false);
      menuToggle.focus();
    }
  });

  /* ----- Ombre de l'en-tête au défilement ----- */
  const updateHeader = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  /* ----- Apparitions douces ----- */
  if (!prefersReducedMotion.matches && "IntersectionObserver" in window) {
    const revealTargets = document.querySelectorAll(".reveal");
    document.documentElement.classList.add("motion-ready");

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -36px 0px" }
    );

    revealTargets.forEach((target, index) => {
      target.setAttribute("data-reveal", "");
      if (target.classList.contains("price-card") || target.classList.contains("offer-card")) {
        target.style.transitionDelay = `${(index % 4) * 90}ms`;
      }
      revealObserver.observe(target);
    });

    /* Léger effet de profondeur sur le portrait (accueil) */
    const portrait = document.querySelector(".hero-portrait-frame");
    if (portrait) {
      let frame = 0;
      const updateParallax = () => {
        frame = 0;
        const bounds = portrait.getBoundingClientRect();
        const offset = (window.innerHeight / 2 - (bounds.top + bounds.height / 2)) * 0.035;
        portrait.style.setProperty("--parallax-offset", `${Math.max(-14, Math.min(14, offset))}px`);
      };
      const requestUpdate = () => {
        if (!frame) frame = window.requestAnimationFrame(updateParallax);
      };
      new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          updateParallax();
          window.addEventListener("scroll", requestUpdate, { passive: true });
          window.addEventListener("resize", requestUpdate);
        } else {
          window.removeEventListener("scroll", requestUpdate);
          window.removeEventListener("resize", requestUpdate);
        }
      }).observe(portrait);
    }
  }

  /* ----- Formulaire de contact ----- */
  const form = document.querySelector("#contact-form");
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const subject = `Demande de contact — ${data.get("name")}`;
      const body = [
        `Nom : ${data.get("name")}`,
        `E-mail : ${data.get("email")}`,
        `Téléphone : ${data.get("phone") || "Non renseigné"}`,
        "",
        "Message :",
        data.get("message"),
      ].join("\n");
      document.querySelector("#form-status").textContent =
        "Votre application e-mail va s’ouvrir avec votre message prêt à être envoyé.";
      window.location.href = `mailto:druonlaura@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
  }

  const year = document.querySelector("#year");
  if (year) year.textContent = new Date().getFullYear();
})();
