(() => {
  const header = document.querySelector("[data-header]");
  const toggle = document.querySelector("[data-nav-toggle]");
  const navPanel = document.querySelector("[data-nav-panel]");
  const parallax = document.querySelector("[data-parallax]");
  const navLinks = document.querySelectorAll(".nav-links a, .nav-cta");
  const form = document.querySelector(".booking-form");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

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
    if (!parallax || prefersReducedMotion.matches) return;
    const offset = Math.min(window.scrollY * 0.1, 72);
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

  navLinks.forEach((link) => link.addEventListener("click", closeMenu));

  const setReveal = () => {
    const elements = document.querySelectorAll(".reveal, .reveal-card");
    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16 }
    );

    elements.forEach((element) => observer.observe(element));
  };

  const initCarousel = (root) => {
    const track = root.querySelector(".loop-track");
    const viewport = root.querySelector(".loop-viewport");
    const dotsWrap = root.querySelector(".carousel-dots");
    const baseSlides = Array.from(track?.children || []);
    if (!track || !viewport || baseSlides.length < 2) return;

    const desktopStatic = () => window.matchMedia("(min-width: 1041px)").matches && (root.classList.contains("bnb-carousel") || root.classList.contains("room-carousel"));
    const autoplay = root.dataset.autoplay === "true" && !prefersReducedMotion.matches;
    const interval = Number(root.dataset.interval || 4200);
    let index = 1;
    let slideWidth = 0;
    let timer = 0;
    let dragging = false;
    let startX = 0;
    let currentX = 0;
    let startTranslate = 0;
    let dots = [];

    const firstClone = baseSlides[0].cloneNode(true);
    const lastClone = baseSlides[baseSlides.length - 1].cloneNode(true);
    firstClone.setAttribute("aria-hidden", "true");
    lastClone.setAttribute("aria-hidden", "true");
    firstClone.classList.add("is-clone");
    lastClone.classList.add("is-clone");
    track.insertBefore(lastClone, baseSlides[0]);
    track.appendChild(firstClone);

    const slides = Array.from(track.children);

    const realIndex = () => {
      if (index === 0) return baseSlides.length - 1;
      if (index === slides.length - 1) return 0;
      return index - 1;
    };

    const updateDots = () => {
      const active = realIndex();
      dots.forEach((dot, dotIndex) => {
        const isActive = dotIndex === active;
        dot.classList.toggle("is-active", isActive);
        dot.setAttribute("aria-current", isActive ? "true" : "false");
      });
    };

    const setTransition = (enabled) => {
      track.style.transition = enabled ? "transform 620ms cubic-bezier(0.22, 1, 0.36, 1)" : "none";
    };

    const translateTo = (targetIndex, withTransition = true) => {
      if (desktopStatic()) {
        track.style.transition = "none";
        track.style.transform = "none";
        return;
      }
      setTransition(withTransition);
      index = targetIndex;
      track.style.transform = `translate3d(${-slideWidth * index}px, 0, 0)`;
      updateDots();
    };

    const measure = () => {
      if (desktopStatic()) {
        slides.forEach((slide) => {
          slide.style.flexBasis = "";
          slide.style.minWidth = "";
        });
        translateTo(index, false);
        return;
      }

      slideWidth = viewport.getBoundingClientRect().width;
      slides.forEach((slide) => {
        if (!root.classList.contains("gallery-carousel") || window.matchMedia("(max-width: 759px)").matches) {
          slide.style.flexBasis = `${slideWidth}px`;
          slide.style.minWidth = `${slideWidth}px`;
        } else {
          slide.style.flexBasis = "";
          slide.style.minWidth = "";
        }
      });
      slideWidth = slides[0].getBoundingClientRect().width;
      translateTo(index, false);
    };

    const stop = () => {
      if (timer) window.clearInterval(timer);
      timer = 0;
    };

    const next = () => translateTo(index + 1, true);
    const previous = () => translateTo(index - 1, true);

    const start = () => {
      stop();
      if (!autoplay || desktopStatic()) return;
      timer = window.setInterval(next, interval);
    };

    if (dotsWrap) {
      dotsWrap.innerHTML = "";
      dots = baseSlides.map((_, dotIndex) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", `Vai alla slide ${dotIndex + 1}`);
        dot.addEventListener("click", () => {
          stop();
          translateTo(dotIndex + 1, true);
          start();
        });
        dotsWrap.appendChild(dot);
        return dot;
      });
    }

    track.addEventListener("transitionend", () => {
      if (index === 0) translateTo(baseSlides.length, false);
      if (index === slides.length - 1) translateTo(1, false);
    });

    viewport.addEventListener("pointerdown", (event) => {
      if (desktopStatic()) return;
      dragging = true;
      startX = event.clientX;
      currentX = startX;
      startTranslate = -slideWidth * index;
      stop();
      root.classList.add("is-dragging");
      setTransition(false);
      viewport.setPointerCapture?.(event.pointerId);
    });

    viewport.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      currentX = event.clientX;
      const delta = currentX - startX;
      track.style.transform = `translate3d(${startTranslate + delta}px, 0, 0)`;
    });

    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      root.classList.remove("is-dragging");
      const delta = currentX - startX;
      const threshold = Math.min(90, slideWidth * 0.18);
      if (delta < -threshold) next();
      else if (delta > threshold) previous();
      else translateTo(index, true);
      start();
    };

    viewport.addEventListener("pointerup", endDrag);
    viewport.addEventListener("pointercancel", endDrag);
    viewport.addEventListener("pointerleave", endDrag);
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    window.addEventListener("resize", measure);

    measure();
    updateDots();
    start();
  };

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

  setReveal();
  document.querySelectorAll("[data-carousel]").forEach(initCarousel);
  updateHeader();
  updateParallax();
  window.addEventListener("scroll", updateHeader, { passive: true });
  window.addEventListener("scroll", updateParallax, { passive: true });
  window.addEventListener("resize", closeMenu);
})();
