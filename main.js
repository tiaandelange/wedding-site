
/* =========================================================
   Nina & Tiaan — Luxury Editorial Wedding Microsite
   Vanilla JS only. Lightweight motion + scroll interactions.
========================================================= */

(() => {
  // QUICK EDIT GUIDE:
  // - Smooth-scroll offset is controlled by `offset` in handleAnchorClick().
  // - Mobile menu behavior is in openMenu()/closeMenu().
  // - Active nav highlighting uses sectionIds[].
  // - Hero slideshow: which deck is visible follows CSS (computed display), not only matchMedia — avoids Samsung mismatch (grey gaps after slide 4).
  const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const nav = $(".nav");
  const siteHeader = $(".site-header");
  const navToggle = $(".nav__toggle");
  const navMenu = $("#navMenu");
  const navBackdrop = $("[data-nav-backdrop]");
  const navLinks = $$(".nav__link");
  const revealEls = $$("[data-reveal]");
  const splitEls = $$("[data-split]");

  // ---------- Helpers ----------
  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));

  function setBackdropVisible(visible) {
    if (!navBackdrop) return;
    if (visible) {
      navBackdrop.hidden = false;
      requestAnimationFrame(() => navBackdrop.style.opacity = "1");
    } else {
      navBackdrop.style.opacity = "0";
      // Keep it simple: hide after transition window
      window.setTimeout(() => { navBackdrop.hidden = true; }, 220);
    }
  }

  function closeMenu() {
    if (!nav || !navToggle) return;
    nav.classList.remove("is-open");
    siteHeader && siteHeader.classList.remove("menu-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
    setBackdropVisible(false);
    document.documentElement.style.overflow = "";
  }

  function openMenu() {
    if (!nav || !navToggle) return;
    nav.classList.add("is-open");
    siteHeader && siteHeader.classList.add("menu-open");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Close menu");
    setBackdropVisible(true);
    document.documentElement.style.overflow = "hidden";
  }

  // ---------- Split text reveal (hero title) ----------
  // Wrap hero title text in an inner span to animate from below.
  splitEls.forEach(el => {
    const text = el.textContent;
    el.textContent = "";
    const inner = document.createElement("span");
    inner.className = "split__inner";
    inner.textContent = text.trim();
    el.appendChild(inner);
  });

  // ---------- Hero slideshow (desktop 6 / mobile 4 images, 4s interval) ----------
  const heroMedia = $(".hero__media");
  const mqMobileHero = window.matchMedia("(max-width: 720px)");
  let heroIntervalId = null;
  let heroIdx = 0;
  let heroSyncTimer = null;

  /** Slides for whichever deck is actually visible (must match CSS, not only matchMedia). */
  function getHeroSlides() {
    if (!heroMedia) return [];
    const mobileDeck = $(".hero__deck--mobile", heroMedia);
    const desktopDeck = $(".hero__deck--desktop", heroMedia);
    if (mobileDeck && getComputedStyle(mobileDeck).display !== "none") {
      return $$(".hero__slide", mobileDeck);
    }
    if (desktopDeck) {
      return $$(".hero__slide", desktopDeck);
    }
    return [];
  }

  function clearHeroInterval() {
    if (heroIntervalId != null) {
      window.clearInterval(heroIntervalId);
      heroIntervalId = null;
    }
  }

  function scheduleHeroSync() {
    if (heroSyncTimer != null) window.clearTimeout(heroSyncTimer);
    heroSyncTimer = window.setTimeout(() => {
      heroSyncTimer = null;
      syncHeroSlides();
    }, 120);
  }

  function syncHeroSlides() {
    if (!heroMedia) return;
    clearHeroInterval();
    const slides = getHeroSlides();
    $$(".hero__slide", heroMedia).forEach((slide) => {
      slide.classList.remove("is-active");
      slide.setAttribute("aria-hidden", "true");
    });
    heroIdx = 0;
    slides.forEach((slide, i) => {
      const on = i === 0;
      slide.classList.toggle("is-active", on);
      slide.setAttribute("aria-hidden", on ? "false" : "true");
    });
    if (slides.length <= 1 || prefersReduced) return;
    heroIntervalId = window.setInterval(() => {
      const cur = getHeroSlides();
      if (!cur.length) return;
      heroIdx = heroIdx % cur.length;
      heroIdx = (heroIdx + 1) % cur.length;
      cur.forEach((slide, i) => {
        const on = i === heroIdx;
        slide.classList.toggle("is-active", on);
        slide.setAttribute("aria-hidden", on ? "false" : "true");
      });
    }, 4000);
  }

  if (heroMedia) {
    syncHeroSlides();
    window.addEventListener("resize", scheduleHeroSync);
    window.addEventListener("orientationchange", scheduleHeroSync);
    if (mqMobileHero.addEventListener) {
      mqMobileHero.addEventListener("change", scheduleHeroSync);
    } else if (mqMobileHero.addListener) {
      mqMobileHero.addListener(scheduleHeroSync);
    }
    requestAnimationFrame(() => {
      requestAnimationFrame(syncHeroSlides);
    });
  }

  // ---------- Page load reveal ----------
  window.addEventListener("load", () => {
    document.body.classList.add("is-loaded");
  });

  // ---------- Smooth scrolling ----------
  // Use scrollIntoView for lightweight smooth anchors.
  function handleAnchorClick(e) {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;

    const href = a.getAttribute("href");
    if (!href || href === "#") return;

    const target = $(href);
    if (!target) return;

    e.preventDefault();
    closeMenu();

    // Brand/home anchor should always return to true top (hero + dark header state).
    // Other section anchors still account for the fixed nav height.
    let y = 0;
    if (href !== "#top") {
      const top = target.getBoundingClientRect().top + window.scrollY;
      const offset = 92; // Sticky header offset (increase if anchors land too high).
      y = Math.max(0, top - offset);
    }

    window.scrollTo({ top: y, behavior: prefersReduced ? "auto" : "smooth" });
  }
  document.addEventListener("click", handleAnchorClick);

  // ---------- Mobile nav toggle ----------
  if (navToggle) {
    navToggle.addEventListener("click", () => {
      const expanded = navToggle.getAttribute("aria-expanded") === "true";
      expanded ? closeMenu() : openMenu();
    });
  }

  if (navBackdrop) {
    navBackdrop.addEventListener("click", closeMenu);
  }

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  // Close menu if resizing up
  window.addEventListener("resize", () => {
    if (window.innerWidth > 720) closeMenu();
  });

  // ---------- Navbar scroll state ----------
  function updateNavScrolled() {
    if (!nav) return;
    const scrolled = window.scrollY > 18;
    nav.classList.toggle("is-scrolled", scrolled);
  }

  // ---------- Header visibility on scroll direction ----------
  function showHeader() {
    if (!siteHeader) return;
    siteHeader.classList.remove("header-hidden");
    siteHeader.classList.add("header-visible");
  }

  function hideHeader() {
    if (!siteHeader || (nav && nav.classList.contains("is-open"))) return;
    siteHeader.classList.remove("header-visible");
    siteHeader.classList.add("header-hidden");
  }

  let lastScrollY = window.scrollY;
  let isHeaderTicking = false;
  function updateHeaderOnScroll() {
    const y = Math.max(0, window.scrollY);
    const delta = y - lastScrollY;

    if (y <= 12) {
      showHeader();
      lastScrollY = y;
      return;
    }

    if (delta > 6) hideHeader();
    if (delta < -6) showHeader();
    lastScrollY = y;
  }

  // ---------- Active section link ----------
  // Keep this in sync with anchor links you want highlighted in the nav.
  const sectionIds = ["#story", "#itinerary", "#palette", "#accommodation", "#gifts", "#rsvp"];
  const sections = sectionIds.map(id => $(id)).filter(Boolean);

  let activeId = null;
  function setActiveLink(id) {
    if (activeId === id) return;
    activeId = id;
    navLinks.forEach(link => {
      const match = link.getAttribute("href") === id;
      link.classList.toggle("is-active", match);
    });
  }

  // ---------- Reveal on scroll (with stagger) ----------
  function initReveal() {
    // Performance: avoid animating lots of elements on scroll.
    // Keep the site mostly static; just render everything immediately.
    revealEls.forEach(el => el.classList.add("is-in"));
  }

  // ---------- Keep nav state in sync ----------
  window.addEventListener("scroll", () => {
    updateNavScrolled();
    if (isHeaderTicking) return;
    isHeaderTicking = true;
    requestAnimationFrame(() => {
      updateHeaderOnScroll();
      isHeaderTicking = false;
    });
  }, { passive: true });
  window.addEventListener("resize", updateNavScrolled, { passive: true });

  // ---------- Section active tracking ----------
  function initActiveSection() {
    if (!sections.length) return;

    const io = new IntersectionObserver((entries) => {
      // Pick the most visible intersecting section
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visible && visible.target && visible.target.id) {
        setActiveLink(`#${visible.target.id}`);
      }
    }, { threshold: [0.25, 0.45, 0.6], rootMargin: "-15% 0px -60% 0px" });

    sections.forEach(s => io.observe(s));
  }

  // ---------- Micro hover polish (optional) ----------
  // Adds a subtle “tilt-less” glow via CSS class; no heavy listeners.
  function initHoverEnhancements() {
    if (prefersReduced) return;
    $$(".card, .swatch, .info__panel").forEach(el => el.classList.add("hover-lift"));
  }

  // ---------- Accommodation carousel dots (mobile) ----------
  function initAccommodationCarousel() {
    const dotsHost = $("[data-accom-dots]");
    const track = $(".accommodation .cards");
    if (!dotsHost || !track) return;

    const cards = $$(".accommodation .cards .card");
    if (cards.length < 2) return;

    dotsHost.innerHTML = "";
    const dotsInner = document.createElement("div");
    dotsInner.className = "cards__dots-inner";
    dotsHost.appendChild(dotsInner);

    const dots = cards.map((_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "cards__dot";
      b.setAttribute("aria-label", `Go to accommodation ${i + 1}`);
      b.setAttribute("aria-current", i === 0 ? "true" : "false");
      b.addEventListener("click", () => {
        cards[i].scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", inline: "start", block: "nearest" });
      });
      dotsInner.appendChild(b);
      return b;
    });

    let active = 0;
    function setActive(i) {
      if (i === active) return;
      active = i;
      dots.forEach((d, idx) => d.setAttribute("aria-current", idx === i ? "true" : "false"));
    }

    const io = new IntersectionObserver((entries) => {
      // Choose the most visible card inside the scroller
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;
      const idx = cards.indexOf(visible.target);
      if (idx >= 0) setActive(idx);
    }, { root: track, threshold: [0.55, 0.7, 0.85] });

    cards.forEach(c => io.observe(c));

    // Keep dots aligned if user snaps back to start on resize
    window.addEventListener("resize", () => {
      if (window.innerWidth > 720) return;
      const nearest = cards.reduce((best, card, idx) => {
        const d = Math.abs(card.getBoundingClientRect().left - track.getBoundingClientRect().left);
        return d < best.d ? { d, idx } : best;
      }, { d: Infinity, idx: 0 });
      setActive(nearest.idx);
    }, { passive: true });
  }

  // ---------- Init ----------
  updateNavScrolled();
  showHeader();
  initReveal();
  initActiveSection();
  initHoverEnhancements();
  initAccommodationCarousel();
})();
