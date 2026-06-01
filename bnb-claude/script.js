/**
 * B&B Suite Partenopea — script.js
 * Features: sticky header, mobile menu, scroll animations,
 *           parallax, smooth scroll, form validation, FAQ
 */

'use strict';

/* ================================================================
   1. UTILITY
================================================================ */

/** Debounce fn — limit fire rate */
function debounce(fn, delay = 100) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/** Throttle fn — max once per frame */
function throttle(fn) {
  let ticking = false;
  return (...args) => {
    if (!ticking) {
      requestAnimationFrame(() => { fn(...args); ticking = false; });
      ticking = true;
    }
  };
}


/* ================================================================
   2. HEADER — sticky + scroll style change
================================================================ */

const header    = document.getElementById('header');
const SCROLL_TH = 60; // px before header changes style

function updateHeader() {
  const scrolled = window.scrollY > SCROLL_TH;
  header.classList.toggle('scrolled', scrolled);
}

window.addEventListener('scroll', throttle(updateHeader), { passive: true });
updateHeader(); // run on load


/* ================================================================
   3. MOBILE MENU — hamburger toggle
================================================================ */

const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
const mobileLinks = mobileMenu.querySelectorAll('.mobile-link, .btn');

function openMenu() {
  hamburger.classList.add('open');
  hamburger.setAttribute('aria-expanded', 'true');
  mobileMenu.classList.add('open');
  mobileMenu.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  mobileMenu.classList.remove('open');
  mobileMenu.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', () => {
  const isOpen = hamburger.classList.contains('open');
  isOpen ? closeMenu() : openMenu();
});

// Close on link click
mobileLinks.forEach(link => link.addEventListener('click', closeMenu));

// Close on ESC
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMenu();
});

// Close on outside tap
mobileMenu.addEventListener('click', e => {
  if (e.target === mobileMenu) closeMenu();
});


/* ================================================================
   4. SMOOTH SCROLL — internal anchors
================================================================ */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();

    const headerH = header.offsetHeight;
    const top     = target.getBoundingClientRect().top + window.scrollY - headerH - 8;

    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ================================================================
   5. SCROLL ANIMATIONS — Intersection Observer
================================================================ */

const animSelector = '.reveal-up:not(.hero *), .slide-in-left, .slide-in-right';
const animElements = document.querySelectorAll(animSelector);

// Respect reduced-motion preference
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReduced && animElements.length) {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // fire once
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    }
  );

  animElements.forEach(el => observer.observe(el));
} else {
  // No animation: make everything visible immediately
  animElements.forEach(el => el.classList.add('visible'));
}


/* ================================================================
   6. PARALLAX — locality section background
================================================================ */

const parallaxImg = document.querySelector('.localita__parallax-img');

if (parallaxImg && !prefersReduced) {
  function updateParallax() {
    const section = parallaxImg.closest('.localita');
    if (!section) return;

    const rect   = section.getBoundingClientRect();
    const winH   = window.innerHeight;
    const inView = rect.top < winH && rect.bottom > 0;

    if (!inView) return;

    // Progress: -1 (above) → 0 (center) → 1 (below)
    const progress = (rect.top - winH / 2) / (winH + rect.height);
    const shift    = progress * 60; // max ±60px
    parallaxImg.style.transform = `translateY(${shift}px)`;
  }

  window.addEventListener('scroll', throttle(updateParallax), { passive: true });
  updateParallax();
}


/* ================================================================
   7. GALLERY — keyboard & accessibility
================================================================ */

const galleryItems = document.querySelectorAll('.gallery__item');

galleryItems.forEach(item => {
  // Make focusable
  item.setAttribute('tabindex', '0');
  item.setAttribute('role', 'img');

  // Use img alt as label if present
  const img = item.querySelector('img');
  if (img && img.alt) {
    item.setAttribute('aria-label', img.alt);
  }

  // Subtle focus ring via JS class
  item.addEventListener('focus', () => item.classList.add('focused'));
  item.addEventListener('blur',  () => item.classList.remove('focused'));
});


/* ================================================================
   8. FAQ — details/summary enhancements
================================================================ */

const faqItems = document.querySelectorAll('.faq__item');

faqItems.forEach(details => {
  details.addEventListener('toggle', () => {
    if (details.open) {
      // Close others
      faqItems.forEach(other => {
        if (other !== details && other.open) other.open = false;
      });

      // Smooth open: animate height
      const answer = details.querySelector('.faq__answer');
      if (answer) {
        answer.style.overflow = 'hidden';
        answer.style.maxHeight = '0';
        answer.style.transition = 'max-height 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
        requestAnimationFrame(() => {
          answer.style.maxHeight = answer.scrollHeight + 'px';
        });
        answer.addEventListener('transitionend', () => {
          answer.style.maxHeight = 'none';
          answer.style.overflow  = '';
        }, { once: true });
      }
    }
  });
});


/* ================================================================
   9. BOOKING FORM — validation + WhatsApp redirect
================================================================ */

const form = document.getElementById('booking-form');

if (form) {
  // Set min date = today on date inputs
  const today   = new Date().toISOString().split('T')[0];
  const checkin = document.getElementById('checkin');
  const checkout = document.getElementById('checkout');

  if (checkin)  checkin.setAttribute('min', today);
  if (checkout) checkout.setAttribute('min', today);

  // Ensure checkout >= checkin
  checkin && checkin.addEventListener('change', () => {
    if (checkout && checkin.value) {
      checkout.setAttribute('min', checkin.value);
      if (checkout.value && checkout.value < checkin.value) {
        checkout.value = checkin.value;
      }
    }
  });

  // Live validation feedback
  const inputs = form.querySelectorAll('.form-input[required]');

  inputs.forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.dataset.touched) validateField(input);
    });
  });

  function validateField(input) {
    input.dataset.touched = '1';
    const valid = input.checkValidity();
    input.style.borderColor = valid ? 'var(--gold)' : 'var(--terracotta)';
  }

  // Submit
  form.addEventListener('submit', e => {
    e.preventDefault();

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

    // Build WhatsApp message
    const nome    = document.getElementById('nome')?.value || '';
    const email   = document.getElementById('email')?.value || '';
    const tel     = document.getElementById('telefono')?.value || '';
    const ci      = document.getElementById('checkin')?.value || '';
    const co      = document.getElementById('checkout')?.value || '';
    const ospiti  = document.getElementById('ospiti')?.value || '';
    const msg     = document.getElementById('messaggio')?.value || '';

    const waText = encodeURIComponent(
      `Ciao! Vorrei prenotare al B&B Suite Partenopea.\n` +
      `Nome: ${nome}\n` +
      `Email: ${email}\n` +
      (tel    ? `Tel: ${tel}\n`    : '') +
      (ci     ? `Arrivo: ${ci}\n`  : '') +
      (co     ? `Partenza: ${co}\n`: '') +
      (ospiti ? `Ospiti: ${ospiti}\n` : '') +
      (msg    ? `Note: ${msg}`     : '')
    );

    showNotice(form, '✓ Richiesta inviata! Verrai reindirizzato a WhatsApp…', 'success');

    setTimeout(() => {
      window.open(`https://wa.me/39081000000?text=${waText}`, '_blank', 'noopener,noreferrer');
      form.reset();
      inputs.forEach(i => {
        i.style.borderColor = '';
        delete i.dataset.touched;
      });
    }, 1200);
  });
}

/** Show inline form notice */
function showNotice(form, text, type) {
  let notice = form.querySelector('.form-notice');
  if (!notice) {
    notice = document.createElement('p');
    notice.className = 'form-notice';
    notice.style.cssText = `
      margin-top: 0.75rem;
      padding: 0.75rem 1rem;
      border-radius: 4px;
      font-size: 0.85rem;
      font-weight: 400;
      text-align: center;
      transition: opacity 0.3s;
    `;
    form.appendChild(notice);
  }

  notice.textContent = text;
  notice.style.backgroundColor = type === 'success'
    ? 'rgba(122, 140, 114, 0.15)' : 'rgba(193, 123, 92, 0.15)';
  notice.style.color = type === 'success'
    ? 'var(--sage)' : 'var(--terracotta)';
  notice.style.border = `1px solid ${type === 'success' ? 'var(--sage-light)' : 'var(--terracotta)'}`;
  notice.style.opacity = '1';

  if (type === 'error') {
    setTimeout(() => { notice.style.opacity = '0'; }, 4000);
  }
}


/* ================================================================
   10. ACTIVE NAV LINK — highlight on scroll
================================================================ */

const sections = document.querySelectorAll('section[id], div[id]');
const navLinks  = document.querySelectorAll('.nav-link');

function updateActiveLink() {
  const scrollY = window.scrollY + header.offsetHeight + 40;

  sections.forEach(section => {
    const top    = section.offsetTop;
    const bottom = top + section.offsetHeight;

    if (scrollY >= top && scrollY < bottom) {
      navLinks.forEach(link => {
        const href = link.getAttribute('href')?.slice(1);
        link.classList.toggle('active', href === section.id);
      });
    }
  });
}

window.addEventListener('scroll', throttle(updateActiveLink), { passive: true });


/* ================================================================
   11. LAZY IMAGES — native loading fallback
================================================================ */

// Native loading="lazy" used in HTML.
// Extra: add fade-in when image loads.
document.querySelectorAll('img[loading="lazy"]').forEach(img => {
  if (img.complete) {
    img.style.opacity = '1';
  } else {
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.5s ease';
    img.addEventListener('load', () => { img.style.opacity = '1'; });
  }
});


/* ================================================================
   12. INIT
================================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Add active-link style via CSS if not present
  const style = document.createElement('style');
  style.textContent = `
    .nav-link.active::after { width: 100% !important; }
    .nav-link.active { color: var(--white) !important; }
    .header.scrolled .nav-link.active { color: var(--gold) !important; }
    .gallery__item.focused { outline: 2px solid var(--gold); outline-offset: 3px; }
  `;
  document.head.appendChild(style);

  console.log('%c✦ Suite Partenopea', 'color:#B8946A;font-size:14px;font-weight:bold;');
  console.log('%cDeveloped with ♥ in Napoli', 'color:#9B9189;font-size:11px;');
});
