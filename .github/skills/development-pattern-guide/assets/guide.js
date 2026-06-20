/* ═══════════════════════════════════════════════════════════════
   development-pattern-guide · guide.js
   Vanilla, dependency-free progressive enhancement for generated
   pattern-tutorial sites. Safe to load with `defer`.
   Provides: fly-out Table of Contents (keyboard/click + hover),
   accessible modal dialogs for architecture cards, and automatic
   "current page" highlighting in the contents panel.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var FOCUSABLE =
    'a[href], button:not([disabled]), textarea, input, select, ' +
    '[tabindex]:not([tabindex="-1"])';

  /* ── Fly-out Table of Contents ──────────────────────────────── */
  function initFlyout() {
    var flyout = document.querySelector(".toc-flyout");
    if (!flyout) return;
    var tab = flyout.querySelector(".toc-flyout__tab");
    if (!tab) return;

    function open() {
      flyout.classList.add("is-open");
      tab.setAttribute("aria-expanded", "true");
    }
    function close() {
      flyout.classList.remove("is-open");
      tab.setAttribute("aria-expanded", "false");
    }
    function toggle() {
      flyout.classList.contains("is-open") ? close() : open();
    }

    tab.setAttribute("aria-expanded", "false");
    tab.addEventListener("click", function (e) {
      e.stopPropagation();
      toggle();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && flyout.classList.contains("is-open")) {
        close();
        tab.focus();
      }
    });
    document.addEventListener("click", function (e) {
      if (flyout.classList.contains("is-open") && !flyout.contains(e.target)) {
        close();
      }
    });
  }

  /* ── Current-page highlighting in the contents panel ────────── */
  function currentFile() {
    var path = window.location.pathname.split("/").pop();
    return path === "" ? "index.html" : path;
  }
  function markCurrent() {
    var here = currentFile();
    var links = document.querySelectorAll(".toc-flyout__link");
    for (var i = 0; i < links.length; i++) {
      var href = (links[i].getAttribute("href") || "").split("/").pop();
      if (href === here) {
        links[i].classList.add("is-current");
        links[i].setAttribute("aria-current", "page");
      }
    }
  }

  /* ── Accessible modal dialogs (architecture cards, etc.) ────── */
  var lastFocused = null;

  function openModal(modal) {
    if (!modal) return;
    lastFocused = document.activeElement;
    modal.hidden = false;
    document.body.classList.add("modal-open");
    var focusable = modal.querySelectorAll(FOCUSABLE);
    var first = focusable.length
      ? focusable[0]
      : modal.querySelector(".modal__dialog");
    if (first && first.focus) first.focus();
  }

  function closeModal(modal) {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove("modal-open");
    if (lastFocused && lastFocused.focus) lastFocused.focus();
    lastFocused = null;
  }

  function trapFocus(modal, e) {
    if (e.key !== "Tab") return;
    var focusable = Array.prototype.filter.call(
      modal.querySelectorAll(FOCUSABLE),
      function (el) {
        return el.offsetParent !== null;
      }
    );
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function initModals() {
    /* Open triggers: any element with data-modal="<modal id>" */
    document.addEventListener("click", function (e) {
      var trigger = e.target.closest("[data-modal]");
      if (trigger) {
        e.preventDefault();
        openModal(document.getElementById(trigger.getAttribute("data-modal")));
        return;
      }
      /* Close triggers: backdrop or any [data-close] inside a modal */
      var closer = e.target.closest("[data-close]");
      if (closer) {
        e.preventDefault();
        closeModal(closer.closest(".modal"));
      }
    });

    document.addEventListener("keydown", function (e) {
      var openOne = document.querySelector(".modal:not([hidden])");
      if (!openOne) return;
      if (e.key === "Escape") closeModal(openOne);
      else trapFocus(openOne, e);
    });
  }

  /* ── Syntax highlighting (highlight.js, bundled & offline) ──── */
  function initHighlight() {
    if (typeof window.hljs === "undefined") return;
    var blocks = document.querySelectorAll("pre.codeblock > code");
    for (var i = 0; i < blocks.length; i++) {
      try {
        window.hljs.highlightElement(blocks[i]);
      } catch (err) {
        /* never let a highlight failure break the page */
      }
    }
  }

  /* ── Boot ───────────────────────────────────────────────────── */
  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }
  ready(function () {
    initFlyout();
    markCurrent();
    initModals();
    initHighlight();
  });
})();
