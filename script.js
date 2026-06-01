'use strict';

(function () {
  const fontHref = 'https://fonts.googleapis.com/css2?family=Nunito+Sans:opsz,wght@6..12,300..1000&family=Source+Serif+4:opsz,wght@8..60,300..900&display=swap';
  if (!document.querySelector(`link[href="${fontHref}"]`)) {
    const font = document.createElement('link');
    font.rel = 'stylesheet';
    font.href = fontHref;
    document.head.appendChild(font);
  }

  const theme = document.createElement('style');
  theme.textContent = `
    :root {
      --ivory: #F7F1E7;
      --ivory-dark: #E9DCCA;
      --cream: #FCF8F1;
      --gold: #B56B45;
      --gold-dark: #8D4E35;
      --gold-light: #DDAF86;
      --terracotta: #A65B3F;
      --sage: #6F7F5F;
      --sage-light: #A7B49A;
      --noir: #1F1813;
      --noir-soft: #32261E;
      --charcoal: #463B33;
      --mid: #706358;
      --muted: #9C9187;
      --white: #FFFFFF;
      --font-display: 'Source Serif 4', Georgia, serif;
      --font-body: 'Nunito Sans', system-ui, sans-serif;
    }

    @media (max-width: 768px) {
      .punti-forza,
      .camere__grid,
      .gallery__grid,
      .recensioni__grid {
        display: flex;
        overflow-x: auto;
        scroll-snap-type: x mandatory;
        scroll-behavior: smooth;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
        touch-action: pan-x pan-y;
      }

      .punti-forza::-webkit-scrollbar,
      .camere__grid::-webkit-scrollbar,
      .gallery__grid::-webkit-scrollbar,
      .recensioni__grid::-webkit-scrollbar {
        display: none;
      }

      .punto,
      .camera-card,
      .gallery__item,
      .recensione-card {
        flex: 0 0 100%;
        scroll-snap-align: start;
        scroll-snap-stop: always;
      }

      .camere__grid::after {
        content: '>';
        position: sticky;
        right: 0.75rem;
        align-self: center;
        display: grid;
        place-items: center;
        flex: 0 0 0;
        width: 0;
        height: 1.75rem;
        margin-left: -1.75rem;
        color: var(--gold);
        font-family: var(--font-body);
        font-size: 1.25rem;
        font-weight: 600;
        pointer-events: none;
        z-index: 2;
      }

      .servizi__grid {
        border-radius: var(--radius-lg);
        background: rgba(255, 255, 255, 0.06);
        box-shadow: 0 0 0 1px rgba(31, 24, 19, 0.08);
      }
    }
  `;
  document.head.appendChild(theme);
})();

function debounce(fn, delay = 100) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function throttle(fn) {
  let ticking = false;
  return (...args) => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      fn(...args);
      ticking = false;
    });
  };
}

const header = document.getElementById('header');
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function updateHeader() {
  if (!header) return;
  header.classList.toggle('scrolled', window.scrollY > 60);
}

function openMenu() {
  if (!hamburger || !mobileMenu) return;
  hamburger.classList.add('open');
  hamburger.setAttribute('aria-expanded', 'true');
  mobileMenu.classList.add('open');
  mobileMenu.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  if (!hamburger || !mobileMenu) return;
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  mobileMenu.classList.remove('open');
  mobileMenu.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

window.addEventListener('scroll', throttle(updateHeader), { passive: true });
updateHeader();

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.contains('open') ? closeMenu() : openMenu();
  });

  mobileMenu.addEventListener('click', event => {
    if (event.target === mobileMenu) closeMenu();
  });
}

document.querySelectorAll('.mobile-link, .mobile-menu .btn').forEach(link => {
  link.addEventListener('click', closeMenu);
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeMenu();
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', event => {
    const selector = anchor.getAttribute('href');
    if (!selector || selector === '#') return;
    const target = document.querySelector(selector);
    if (!target) return;

    event.preventDefault();
    const headerHeight = header ? header.offsetHeight : 0;
    const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 8;
    window.scrollTo({ top, behavior: prefersReduced ? 'auto' : 'smooth' });
  });
});

const animElements = document.querySelectorAll('.reveal-up:not(.hero *), .slide-in-left, .slide-in-right');
if (!prefersReduced && animElements.length && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  animElements.forEach(element => observer.observe(element));
} else {
  animElements.forEach(element => element.classList.add('visible'));
}

const parallaxImg = document.querySelector('.localita__parallax-img');
if (parallaxImg && !prefersReduced) {
  const updateParallax = throttle(() => {
    const section = parallaxImg.closest('.localita');
    if (!section) return;
    const rect = section.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (!inView) return;
    const progress = (rect.top - window.innerHeight / 2) / (window.innerHeight + rect.height);
    parallaxImg.style.transform = `translateY(${progress * 60}px)`;
  });
  window.addEventListener('scroll', updateParallax, { passive: true });
  updateParallax();
}

document.querySelectorAll('.gallery__item').forEach(item => {
  item.setAttribute('tabindex', '0');
  item.setAttribute('role', 'img');
  const img = item.querySelector('img');
  if (img && img.alt) item.setAttribute('aria-label', img.alt);
  item.addEventListener('focus', () => item.classList.add('focused'));
  item.addEventListener('blur', () => item.classList.remove('focused'));
});

function initMobileCarousel(selector, options = {}) {
  const track = document.querySelector(selector);
  if (!track) return;

  const { autoplay = false, interval = 4000 } = options;
  const mobileQuery = window.matchMedia('(max-width: 768px)');
  let timer = null;

  const getSlides = () => Array.from(track.children).filter(child => child.nodeType === 1);
  const getSlideLeft = slide => slide.offsetLeft - track.offsetLeft;

  const getCurrentIndex = () => {
    const slides = getSlides();
    if (!slides.length) return 0;

    return slides.reduce((closestIndex, slide, index) => {
      const closestSlide = slides[closestIndex];
      const closestDistance = Math.abs(getSlideLeft(closestSlide) - track.scrollLeft);
      const slideDistance = Math.abs(getSlideLeft(slide) - track.scrollLeft);
      return slideDistance < closestDistance ? index : closestIndex;
    }, 0);
  };

  const goToSlide = index => {
    const slides = getSlides();
    if (!slides.length) return;
    const target = slides[index % slides.length];
    track.scrollTo({ left: getSlideLeft(target), behavior: prefersReduced ? 'auto' : 'smooth' });
  };

  const stop = () => {
    if (!timer) return;
    clearInterval(timer);
    timer = null;
  };

  const start = () => {
    stop();
    if (!autoplay || prefersReduced || !mobileQuery.matches) return;
    timer = setInterval(() => {
      const slides = getSlides();
      if (slides.length < 2) return;
      goToSlide((getCurrentIndex() + 1) % slides.length);
    }, interval);
  };

  const refresh = () => {
    if (!mobileQuery.matches) {
      stop();
      track.scrollLeft = 0;
      return;
    }
    start();
  };

  track.addEventListener('pointerdown', stop, { passive: true });
  track.addEventListener('pointerup', start, { passive: true });
  track.addEventListener('touchstart', stop, { passive: true });
  track.addEventListener('touchend', start, { passive: true });

  if (mobileQuery.addEventListener) mobileQuery.addEventListener('change', refresh);
  else mobileQuery.addListener(refresh);

  window.addEventListener('resize', debounce(refresh, 150));
  refresh();
}

initMobileCarousel('.punti-forza', { autoplay: true, interval: 4200 });
initMobileCarousel('.camere__grid');
initMobileCarousel('.gallery__grid', { autoplay: true, interval: 3200 });
initMobileCarousel('.recensioni__grid', { autoplay: true, interval: 5000 });

document.querySelectorAll('.faq__item').forEach(details => {
  details.addEventListener('toggle', () => {
    if (!details.open) return;
    document.querySelectorAll('.faq__item').forEach(other => {
      if (other !== details && other.open) other.open = false;
    });

    const answer = details.querySelector('.faq__answer');
    if (!answer) return;
    answer.style.overflow = 'hidden';
    answer.style.maxHeight = '0';
    answer.style.transition = 'max-height 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
    requestAnimationFrame(() => {
      answer.style.maxHeight = `${answer.scrollHeight}px`;
    });
    answer.addEventListener('transitionend', () => {
      answer.style.maxHeight = 'none';
      answer.style.overflow = '';
    }, { once: true });
  });
});

const form = document.getElementById('booking-form');
if (form) {
  const today = new Date().toISOString().split('T')[0];
  const checkin = document.getElementById('checkin');
  const checkout = document.getElementById('checkout');
  if (checkin) checkin.setAttribute('min', today);
  if (checkout) checkout.setAttribute('min', today);

  if (checkin) {
    checkin.addEventListener('change', () => {
      if (!checkout || !checkin.value) return;
      checkout.setAttribute('min', checkin.value);
      if (checkout.value && checkout.value < checkin.value) checkout.value = checkin.value;
    });
  }

  const inputs = form.querySelectorAll('.form-input[required]');
  const validateField = input => {
    input.dataset.touched = '1';
    input.style.borderColor = input.checkValidity() ? 'var(--gold)' : 'var(--terracotta)';
  };

  inputs.forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.dataset.touched) validateField(input);
    });
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    let valid = true;
    inputs.forEach(input => {
      validateField(input);
      if (!input.checkValidity()) valid = false;
    });

    if (!valid) {
      const first = form.querySelector('.form-input[required]:invalid');
      if (first) first.focus();
      showNotice(form, 'Per favore compila tutti i campi obbligatori.', 'error');
      return;
    }

    const nome = document.getElementById('nome')?.value || '';
    const email = document.getElementById('email')?.value || '';
    const tel = document.getElementById('telefono')?.value || '';
    const ci = document.getElementById('checkin')?.value || '';
    const co = document.getElementById('checkout')?.value || '';
    const ospiti = document.getElementById('ospiti')?.value || '';
    const msg = document.getElementById('messaggio')?.value || '';

    const waText = encodeURIComponent(
      `Ciao! Vorrei prenotare al B&B Suite Partenopea.\n` +
      `Nome: ${nome}\n` +
      `Email: ${email}\n` +
      (tel ? `Tel: ${tel}\n` : '') +
      (ci ? `Arrivo: ${ci}\n` : '') +
      (co ? `Partenza: ${co}\n` : '') +
      (ospiti ? `Ospiti: ${ospiti}\n` : '') +
      (msg ? `Note: ${msg}` : '')
    );

    showNotice(form, 'Richiesta inviata. Ti reindirizzo a WhatsApp.', 'success');
    setTimeout(() => {
      window.open(`https://wa.me/39081000000?text=${waText}`, '_blank', 'noopener,noreferrer');
      form.reset();
      inputs.forEach(input => {
        input.style.borderColor = '';
        delete input.dataset.touched;
      });
    }, 900);
  });
}

function showNotice(form, text, type) {
  let notice = form.querySelector('.form-notice');
  if (!notice) {
    notice = document.createElement('p');
    notice.className = 'form-notice';
    notice.style.cssText = 'margin-top:0.75rem;padding:0.75rem 1rem;border-radius:4px;font-size:0.85rem;font-weight:400;text-align:center;transition:opacity 0.3s;';
    form.appendChild(notice);
  }

  notice.textContent = text;
  notice.style.backgroundColor = type === 'success' ? 'rgba(111, 127, 95, 0.15)' : 'rgba(166, 91, 63, 0.15)';
  notice.style.color = type === 'success' ? 'var(--sage)' : 'var(--terracotta)';
  notice.style.border = `1px solid ${type === 'success' ? 'var(--sage-light)' : 'var(--terracotta)'}`;
  notice.style.opacity = '1';

  if (type === 'error') setTimeout(() => { notice.style.opacity = '0'; }, 4000);
}

const sections = document.querySelectorAll('section[id], div[id]');
const navLinks = document.querySelectorAll('.nav-link');
function updateActiveLink() {
  const headerHeight = header ? header.offsetHeight : 0;
  const scrollY = window.scrollY + headerHeight + 40;
  sections.forEach(section => {
    const top = section.offsetTop;
    const bottom = top + section.offsetHeight;
    if (scrollY < top || scrollY >= bottom) return;
    navLinks.forEach(link => {
      const href = link.getAttribute('href')?.slice(1);
      link.classList.toggle('active', href === section.id);
    });
  });
}
window.addEventListener('scroll', throttle(updateActiveLink), { passive: true });
updateActiveLink();

document.querySelectorAll('img[loading="lazy"]').forEach(img => {
  if (img.complete) img.style.opacity = '1';
  else {
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.5s ease';
    img.addEventListener('load', () => { img.style.opacity = '1'; });
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const style = document.createElement('style');
  style.textContent = `
    .nav-link.active::after { width: 100% !important; }
    .nav-link.active { color: var(--white) !important; }
    .header.scrolled .nav-link.active { color: var(--gold) !important; }
    .gallery__item.focused { outline: 2px solid var(--gold); outline-offset: 3px; }
  `;
  document.head.appendChild(style);
});
