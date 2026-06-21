/* ═══════════════════════════════════════════════════════════════
   development-pattern-guide · guide.js
   Vanilla, dependency-free progressive enhancement for generated
   pattern-tutorial sites. Safe to load with `defer`.
   Provides: fly-out Table of Contents (keyboard/click + hover),
   accessible (stackable) modal dialogs for architecture nodes, an
   offline SVG node-graph renderer for the architecture chapter, and
   automatic "current page" highlighting in the contents panel.
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

  /* ── Accessible modal dialogs (architecture nodes, etc.) ────── */
  var modalStack = [];

  function topModal() {
    return modalStack.length ? modalStack[modalStack.length - 1].modal : null;
  }

  function openModal(modal) {
    if (!modal || !modal.hidden) return;
    modalStack.push({ modal: modal, focus: document.activeElement });
    modal.hidden = false;
    /* stack nested modals above their parent (base .modal z-index is 1000) */
    modal.style.zIndex = String(1000 + modalStack.length * 10);
    document.body.classList.add("modal-open");
    /* nested architecture graphs have no geometry until the modal is shown */
    drawGraphsIn(modal);
    var focusable = modal.querySelectorAll(FOCUSABLE);
    var first = focusable.length
      ? focusable[0]
      : modal.querySelector(".modal__dialog");
    if (first && first.focus) first.focus();
  }

  function closeModal(modal) {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    modal.style.zIndex = "";
    for (var i = modalStack.length - 1; i >= 0; i--) {
      if (modalStack[i].modal === modal) {
        var saved = modalStack[i].focus;
        modalStack.splice(i, 1);
        if (saved && saved.focus) saved.focus();
        break;
      }
    }
    if (!modalStack.length) document.body.classList.remove("modal-open");
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
      var openOne = topModal();
      if (!openOne) return;
      if (e.key === "Escape") closeModal(openOne);
      else trapFocus(openOne, e);
    });
  }

  /* ── Architecture node graph (offline SVG edge routing) ─────── */
  var SVGNS = "http://www.w3.org/2000/svg";

  function svgEl(name, attrs) {
    var el = document.createElementNS(SVGNS, name);
    if (attrs) {
      for (var k in attrs) {
        if (attrs.hasOwnProperty(k)) el.setAttribute(k, attrs[k]);
      }
    }
    return el;
  }

  function layerIndexOf(node) {
    var layer = node.closest(".arch-layer");
    if (!layer || !layer.parentNode) return 0;
    var layers = layer.parentNode.querySelectorAll(":scope > .arch-layer");
    for (var i = 0; i < layers.length; i++) {
      if (layers[i] === layer) return i;
    }
    return 0;
  }

  /* Greedily wrap a label's words so no rendered line exceeds maxWidth (in the
     graph's user space). Measures with the live SVG <text> node so it matches
     the real font. Returns an array of line strings (at least one). */
  function wrapLabel(textEl, label, maxWidth) {
    var words = String(label).split(/\s+/);
    var lines = [];
    var current = "";
    for (var w = 0; w < words.length; w++) {
      var candidate = current ? current + " " + words[w] : words[w];
      textEl.textContent = candidate;
      if (current && textEl.getComputedTextLength() > maxWidth) {
        lines.push(current);
        current = words[w];
      } else {
        current = candidate;
      }
    }
    if (current) lines.push(current);
    textEl.textContent = "";
    return lines.length ? lines : [String(label)];
  }

  function drawGraph(graph) {
    try {
      var gr = graph.getBoundingClientRect();
      if (!gr.width || !gr.height) return; /* hidden / no geometry yet */

      var svg = graph.querySelector(":scope > svg.arch-graph__svg");
      if (!svg) {
        svg = svgEl("svg", { "class": "arch-graph__svg", "aria-hidden": "true" });
        graph.insertBefore(svg, graph.firstChild);
      }
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      svg.setAttribute("viewBox", "0 0 " + gr.width + " " + gr.height);

      /* Labels live in a second overlay ABOVE the nodes so a label that lands
         over a card is never covered by it (the edge svg stays behind nodes). */
      var labelSvg = graph.querySelector(":scope > svg.arch-graph__labels");
      if (!labelSvg) {
        labelSvg = svgEl("svg", { "class": "arch-graph__labels", "aria-hidden": "true" });
        graph.appendChild(labelSvg);
      }
      while (labelSvg.firstChild) labelSvg.removeChild(labelSvg.firstChild);
      labelSvg.setAttribute("viewBox", "0 0 " + gr.width + " " + gr.height);

      var gid = graph.id || "g";
      var defs = svgEl("defs");
      var headIds = [
        { id: "arch-arrow-" + gid, cls: "arch-arrowhead" },
        { id: "arch-arrow-agg-" + gid, cls: "arch-arrowhead arch-arrowhead--agg" }
      ];
      for (var h = 0; h < headIds.length; h++) {
        var marker = svgEl("marker", {
          id: headIds[h].id,
          markerWidth: "10", markerHeight: "10",
          refX: "8", refY: "5", orient: "auto", markerUnits: "userSpaceOnUse"
        });
        marker.appendChild(svgEl("path", { d: "M0,0 L9,5 L0,10 z", "class": headIds[h].cls }));
        defs.appendChild(marker);
      }
      svg.appendChild(defs);

      var edges = graph.querySelectorAll(":scope > .arch-edges > li");
      var outCount = {}, inCount = {}, outIdx = {}, inIdx = {};
      var i, li, f, t;
      for (i = 0; i < edges.length; i++) {
        f = edges[i].getAttribute("data-from");
        t = edges[i].getAttribute("data-to");
        outCount[f] = (outCount[f] || 0) + 1;
        inCount[t] = (inCount[t] || 0) + 1;
      }

      for (i = 0; i < edges.length; i++) {
        li = edges[i];
        var fromId = li.getAttribute("data-from");
        var toId = li.getAttribute("data-to");
        var from = document.getElementById(fromId);
        var to = document.getElementById(toId);
        if (!from || !to) continue;
        var fr = from.getBoundingClientRect();
        var tr = to.getBoundingClientRect();

        outIdx[fromId] = (outIdx[fromId] || 0) + 1;
        inIdx[toId] = (inIdx[toId] || 0) + 1;
        var ofrac = outIdx[fromId] / (outCount[fromId] + 1);
        var ifrac = inIdx[toId] / (inCount[toId] + 1);

        var sx = fr.right - gr.left;
        var sy = fr.top - gr.top + fr.height * ofrac;
        var tx = tr.left - gr.left;
        var ty = tr.top - gr.top + tr.height * ifrac;

        var dx = Math.max(40, Math.abs(tx - sx) * 0.5);
        var span = Math.abs(layerIndexOf(to) - layerIndexOf(from));
        /* bow skip-layer edges away from the mid line so they clear inner nodes */
        var bow = span > 1 ? (span - 1) * 46 : 0;
        var sign = (sy + ty) / 2 < gr.height / 2 ? -1 : 1;
        var c1x = sx + dx, c1y = sy + bow * sign;
        var c2x = tx - dx, c2y = ty + bow * sign;

        var d = "M" + sx + "," + sy +
                " C" + c1x + "," + c1y + " " + c2x + "," + c2y + " " + tx + "," + ty;
        var agg = li.hasAttribute("data-aggregate");
        svg.appendChild(svgEl("path", {
          d: d,
          "class": "arch-edge" + (agg ? " arch-edge--aggregate" : ""),
          "marker-end": "url(#arch-arrow" + (agg ? "-agg-" : "-") + gid + ")"
        }));

        var label = li.getAttribute("data-label");
        if (label) {
          try {
            var u = 0.5, m = 1 - u;
            var lx = m*m*m*sx + 3*m*m*u*c1x + 3*m*u*u*c2x + u*u*u*tx;
            var ly = m*m*m*sy + 3*m*m*u*c1y + 3*m*u*u*c2y + u*u*u*ty;
            /* Keep the label no wider than the horizontal gap between the two
               nodes so it never spills over a node or another edge's text.
               Wrap the words onto as many lines as needed to fit that width. */
            var gap = Math.abs(tx - sx);
            var maxLabelWidth = Math.max(48, gap - 16);
            var text = svgEl("text", {
              x: lx, "class": "arch-edge__label",
              "text-anchor": "middle", "dominant-baseline": "middle"
            });
            labelSvg.appendChild(text);
            var lines = wrapLabel(text, label, maxLabelWidth);
            var lineH = 13;
            var startY = ly - (lines.length - 1) * lineH / 2;
            for (var ln = 0; ln < lines.length; ln++) {
              var tspan = svgEl("tspan", { x: lx, y: startY + ln * lineH });
              tspan.textContent = lines[ln];
              text.appendChild(tspan);
            }
            var bb = text.getBBox();
            var px = 6, py = 3;
            var bg = svgEl("rect", {
              x: bb.x - px, y: bb.y - py,
              width: bb.width + px * 2, height: bb.height + py * 2,
              rx: 6, "class": "arch-edge__label-bg"
            });
            labelSvg.insertBefore(bg, text);
          } catch (labelErr) {
            /* a label failure must not drop the edge */
          }
        }
      }
    } catch (err) {
      /* never let a drawing failure break the page */
    }
  }

  /* Shrink a graph uniformly so its centred cluster always fits the content
     column. The SVG edge overlay is a child, so it scales with the nodes;
     edges stay aligned because drawGraph measures the UNSCALED layout first. */
  var GRAPH_BASE_MARGIN = 32; /* matches .arch-graph margin-bottom default */
  function fitGraph(graph) {
    try {
      /* natural (unscaled) width: sum of layer columns + the gaps between them.
         scrollWidth is unreliable with justify-content:center + overflow. */
      var layers = graph.querySelectorAll(":scope > .arch-layer");
      if (!layers.length) return;
      var cs = window.getComputedStyle(graph);
      var gap = parseFloat(cs.columnGap || cs.gap) || 0;
      var padX = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
      var natural = gap * (layers.length - 1);
      for (var i = 0; i < layers.length; i++) natural += layers[i].offsetWidth;
      var available = graph.clientWidth - padX;
      if (!available || !natural) return;

      if (natural > available) {
        var f = available / natural;
        graph.style.transformOrigin = "top center";
        graph.style.transform = "scale(" + f + ")";
        /* transform doesn't shrink the layout box; pull following content up. */
        var slack = graph.scrollHeight * (1 - f);
        graph.style.marginBottom = (GRAPH_BASE_MARGIN - slack) + "px";
      } else {
        graph.style.transform = "";
        graph.style.transformOrigin = "";
        graph.style.marginBottom = "";
      }
    } catch (err) {
      /* a fit failure must never break the page */
    }
  }

  /* Draw a graph in its unscaled coordinate space, then scale it to fit. */
  function renderGraph(graph) {
    if (!graph) return;
    graph.style.transform = "";
    graph.style.transformOrigin = "";
    graph.style.marginBottom = "";
    drawGraph(graph);
    fitGraph(graph);
  }

  function drawGraphsIn(root) {
    if (!root || !root.querySelectorAll) return;
    if (root.classList && root.classList.contains("arch-graph")) renderGraph(root);
    var graphs = root.querySelectorAll(".arch-graph");
    for (var i = 0; i < graphs.length; i++) renderGraph(graphs[i]);
  }

  function initArchGraph() {
    var graphs = document.querySelectorAll(".arch-graph");
    if (!graphs.length) return;
    function drawAll() {
      for (var i = 0; i < graphs.length; i++) renderGraph(graphs[i]);
    }
    drawAll();
    window.addEventListener("load", drawAll);
    var t;
    window.addEventListener("resize", function () {
      clearTimeout(t);
      t = setTimeout(drawAll, 150);
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
    initArchGraph();
    initHighlight();
  });
})();
