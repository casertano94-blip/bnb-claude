(() => {
  const header = document.querySelector("[data-header]");
  const toggle = document.querySelector("[data-nav-toggle]");
  const navPanel = document.querySelector("[data-nav-panel]");
  const parallax = document.querySelector("[data-parallax]");
  const navLinks = document.querySelectorAll(".nav-links a, .nav-cta");
  const form = document.querySelector(".booking-form");

  const updateHeader = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 16);
  };

  const closeMenu = () => {
    if (!toggle || !navPanel) return;
    toggle.setAttribute("aria-expanded", "false");
    navPanel.classList.remove("is-open");
    document.body.classList.remove("nav-open");
  };

  const updateParallax = () => {
    if (!parallax || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const offset = Math.min(window.scrollY * 0.12, 90);
    parallax.style.transform = `translate3d(0, ${offset}px, 0) scale(1.03)`;
  };

  if (toggle && navPanel) {
    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      navPanel.classList.toggle("is-open", !expanded);
      document.body.classList.toggle("nav-open", !expanded);
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 }
    );

    document.querySelectorAll(".reveal, .reveal-card").forEach((element) => observer.observe(element));
  } else {
    document.querySelectorAll(".reveal, .reveal-card").forEach((element) => element.classList.add("is-visible"));
  }

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const message = [
        "Ciao B&B Suite Partenopea, vorrei richiedere disponibilita.",
        `Nome: ${data.get("name") || ""}`,
        `Email: ${data.get("email") || ""}`,
        `Telefono: ${data.get("phone") || ""}`,
        `Arrivo: ${data.get("arrival") || ""}`,
        `Partenza: ${data.get("departure") || ""}`,
        `Ospiti: ${data.get("guests") || ""}`,
        `Messaggio: ${data.get("message") || ""}`,
      ].join("\n");

      window.open(`https://wa.me/393331234567?text=${encodeURIComponent(message)}`, "_blank", "noopener");
    });
  }

  updateHeader();
  updateParallax();
  window.addEventListener("scroll", updateHeader, { passive: true });
  window.addEventListener("scroll", updateParallax, { passive: true });
  window.addEventListener("resize", closeMenu);
})();
