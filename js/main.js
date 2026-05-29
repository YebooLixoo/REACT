/* ============================================================
   REACT project page — interactions
   ============================================================ */
(function () {
  "use strict";

  // Mark JS as available so CSS can gate JS-only affordances (e.g. zoom cursor).
  document.documentElement.classList.add("js");

  /* ----------------------------------------------------------
     LINK CONFIG — fill these in when available.
       arxiv : arXiv / preprint URL. Leave "" to hide the button.
       code  : code repository URL. Leave "" to fall back to a
               "Code (on request)" mailto to the corresponding author.
     ---------------------------------------------------------- */
  var LINKS = {
    arxiv: "",
    code: "",
    corrEmail: "chenxi.liu@utah.edu",
  };

  // arXiv: hide unless a URL is set
  var arxivBtn = document.getElementById("link-arxiv");
  if (arxivBtn) {
    if (LINKS.arxiv) { arxivBtn.href = LINKS.arxiv; }
    else { arxivBtn.remove(); }
  }
  // Code: real repo if provided, else "on request" email
  var codeBtn = document.getElementById("link-code");
  if (codeBtn) {
    if (LINKS.code) {
      codeBtn.href = LINKS.code;
    } else {
      codeBtn.href = "mailto:" + LINKS.corrEmail + "?subject=REACT%20code%20request";
      codeBtn.removeAttribute("target");
      codeBtn.innerHTML = '<span class="btn-ico">&#128231;</span> Code (on request)';
    }
  }

  /* ---------------- Sticky nav: show after hero, highlight section ---------------- */
  var navbar = document.getElementById("navbar");
  var hero = document.querySelector(".hero");
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-links a"));

  if (navbar) {
    // Cache the hero height (constant after load) so the scroll handler does not
    // force a layout read on every scroll tick; refresh it on resize.
    var heroH = hero ? hero.offsetHeight : 400;
    var onScroll = function () {
      if (window.scrollY > heroH - 80) navbar.classList.add("visible");
      else navbar.classList.remove("visible");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", function () { heroH = hero ? hero.offsetHeight : 400; }, { passive: true });
    onScroll();
  }

  // active section highlight
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);
  if ("IntersectionObserver" in window && sections.length) {
    var visible = {};
    var order = sections.map(function (s) { return s.id; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) visible[e.target.id] = true;
        else delete visible[e.target.id];
      });
      var current = order.filter(function (id) { return visible[id]; })[0];
      if (!current) return; // between observed sections — keep the last highlight rather than clearing all
      navLinks.forEach(function (a) {
        var isActive = a.getAttribute("href") === "#" + current;
        a.classList.toggle("active", isActive);
        if (isActive) a.setAttribute("aria-current", "true");
        else a.removeAttribute("aria-current");
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------------- Metric count-up ---------------- */
  var counters = Array.prototype.slice.call(document.querySelectorAll(".count"));
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function animateCount(el) {
    var target = parseFloat(el.dataset.target);
    var decimals = parseInt(el.dataset.decimals || "0", 10);
    if (reduceMotion) { el.textContent = target.toFixed(decimals); return; }
    var start = null;
    var dur = 1400;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = (target * eased).toFixed(decimals);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toFixed(decimals);
    }
    requestAnimationFrame(step);
  }

  if ("IntersectionObserver" in window && counters.length) {
    var counted = new WeakSet();
    var mObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && !counted.has(e.target)) {
          counted.add(e.target);
          animateCount(e.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { mObs.observe(c); });
  } else {
    counters.forEach(function (c) {
      c.textContent = parseFloat(c.dataset.target).toFixed(parseInt(c.dataset.decimals || "0", 10));
    });
  }

  /* ---------------- Copy BibTeX ---------------- */
  var copyBtn = document.getElementById("copyBibtex");
  var bibtex = document.getElementById("bibtexContent");
  if (copyBtn && bibtex) {
    copyBtn.addEventListener("click", function () {
      var text = bibtex.textContent;
      function done() {
        copyBtn.textContent = "Copied!";
        copyBtn.classList.add("copied");
        setTimeout(function () { copyBtn.textContent = "Copy"; copyBtn.classList.remove("copied"); }, 1800);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(fallback);
      } else { fallback(); }
      function fallback() {
        var ta = document.createElement("textarea");
        ta.value = text; document.body.appendChild(ta); ta.select();
        var ok = false;
        try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
        document.body.removeChild(ta);
        if (ok) { done(); }
        else {
          copyBtn.textContent = "Press ⌘/Ctrl+C";
          setTimeout(function () { copyBtn.textContent = "Copy"; }, 2400);
        }
      }
    });
  }

  /* ---------------- Figure lightbox ---------------- */
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightboxImg");
  var lightboxClose = document.getElementById("lightboxClose");
  var lastFocused = null;
  // Top-level regions to hide from assistive tech and disable while the modal is open,
  // so the dialog's aria-modal contract holds for SR virtual cursors too.
  var bgRegions = Array.prototype.slice.call(
    document.querySelectorAll("body > nav, body > header, body > main, body > footer")
  );
  function setBackgroundInert(on) {
    bgRegions.forEach(function (el) {
      if (on) { el.setAttribute("aria-hidden", "true"); el.setAttribute("inert", ""); }
      else { el.removeAttribute("aria-hidden"); el.removeAttribute("inert"); }
    });
  }
  function openLightbox(src, alt) {
    if (!lightbox) return;
    lastFocused = document.activeElement;
    lightboxImg.src = src; lightboxImg.alt = alt || "";
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    setBackgroundInert(true);
    lightboxClose.focus();
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.hidden = true; lightboxImg.src = "";
    document.body.style.overflow = "";
    setBackgroundInert(false);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }
  if (lightbox) {
    Array.prototype.slice.call(document.querySelectorAll("img.zoomable")).forEach(function (img) {
      // Make figures keyboard-operable (the only trigger was a mouse click)
      img.setAttribute("tabindex", "0");
      img.setAttribute("role", "button");
      if (!img.getAttribute("aria-label")) {
        img.setAttribute("aria-label", "Enlarge figure: " + (img.alt || "image"));
      }
      img.addEventListener("click", function () { openLightbox(img.src, img.alt); });
      img.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
          e.preventDefault();
          openLightbox(img.src, img.alt);
        }
      });
    });
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox || e.target === lightboxImg) closeLightbox();
    });
    lightboxClose.addEventListener("click", closeLightbox);
    document.addEventListener("keydown", function (e) {
      if (lightbox.hidden) return;
      if (e.key === "Escape") { closeLightbox(); }
      else if (e.key === "Tab") { e.preventDefault(); lightboxClose.focus(); } // trap focus inside dialog
    });
  }
})();
