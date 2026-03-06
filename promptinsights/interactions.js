/* ============================================================
   interactions.js  —  UI Interactions & Chart Animations
   ============================================================
   Handles all non-navigation interactivity:

   1. REVEAL OBSERVER
      IntersectionObserver on .reveal elements — adds the
      .panel.active class trigger is handled by scroll.js,
      but individual element reveals are managed here.

   2. CHART ANIMATIONS  (triggerCharts)
      Called by scroll.js on every panel transition.
      • Stat bar fills (.stat-bar-fill → .anim)
      • Donut arc animations (stroke-dashoffset)
      • SCT gap bar fills

   3. VALUE MAP ACCORDION  (hvmSelect — REMOVED, now static)
      The .hvm-action accordion (External Touchpoints) uses
      inline onclick="this.classList.toggle('open')" in HTML.
      No JS coordination needed — pure CSS transitions.

   DEPENDENCIES:
   • Must be loaded BEFORE scroll.js
   • Expects .stat-bar-fill, .donut-arc-el, .sct-fill in DOM

   HOW TO REUSE:
   • triggerCharts() is the main entry point — call it
     whenever a panel becomes visible.
   • The reveal system only needs .reveal on elements and
     the parent .panel to receive .active from scroll.js.
   ============================================================ */

// ── CHART ANIMATIONS ───────────────────────────────
const animatedPanels = new Set();

function triggerCharts(panel) {
  const idx = Array.from(panels).indexOf(panel);
  if (animatedPanels.has(idx)) return;
  animatedPanels.add(idx);

  // Bar fills
  panel.querySelectorAll('.sct-fill, .stat-bar-fill').forEach((el, i) => {
    setTimeout(() => el.classList.add('anim'), 300 + i * 120);
  });

  // Donuts
  panel.querySelectorAll('.donut-arc-el').forEach((el, i) => {
    const da = el.dataset.da;
    if (da) setTimeout(() => {
      el.style.strokeDasharray = da;
      el.classList.add('anim');
    }, 400 + i * 200);
  });

  // Gap bars
  panel.querySelectorAll('.stat-gap-fill').forEach((el, i) => {
    setTimeout(() => el.classList.add('anim'), 300 + i * 200);
  });
}

// ── INPUT HANDLING ─────────────────────────────────

const isMobile = () => window.innerWidth <= 768;

// Wheel / trackpad (desktop only)
let wheelAcc = 0;
let wheelTimer = null;
window.addEventListener('wheel', (e) => {
  if (isMobile()) return;
  e.preventDefault();
  const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
  wheelAcc += delta;
  clearTimeout(wheelTimer);
  wheelTimer = setTimeout(() => { wheelAcc = 0; }, 200);
  if (Math.abs(wheelAcc) > 60) {
    if (wheelAcc > 0) goTo(current + 1);
    else goTo(current - 1);
    wheelAcc = 0;
  }
}, { passive: false });

// Touch handling
let touchStartX = 0;
let touchStartY = 0;
let touchMoved = false;
let swipeIntent = null; // 'h' = horizontal, 'v' = vertical, null = undecided

window.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
  touchMoved = false;
  swipeIntent = null;
}, { passive: true });

window.addEventListener('touchmove', (e) => {
  touchMoved = true;
  const dx = Math.abs(e.touches[0].clientX - touchStartX);
  const dy = Math.abs(e.touches[0].clientY - touchStartY);

  // Determine intent on first significant move
  if (!swipeIntent && (dx > 8 || dy > 8)) {
    swipeIntent = dx > dy ? 'h' : 'v';
  }

  if (!isMobile()) {
    // Desktop: prevent default on horizontal swipe
    if (swipeIntent === 'h') e.preventDefault();
  } else {
    // Mobile: only block scroll if clearly horizontal swipe
    if (swipeIntent === 'h') e.preventDefault();
    // vertical swipe: let browser scroll naturally
  }
}, { passive: false });

window.addEventListener('touchend', (e) => {
  if (!touchMoved) return;
  const dx = touchStartX - e.changedTouches[0].clientX;
  const dy = touchStartY - e.changedTouches[0].clientY;
  // Navigate if horizontal swipe is dominant and long enough
  if (swipeIntent === 'h' && Math.abs(dx) > Math.abs(dy) * 1.5 && Math.abs(dx) > 45) {
    goTo(dx > 0 ? current + 1 : current - 1);
  }
  swipeIntent = null;
});

// Keyboard (desktop only)
window.addEventListener('keydown', (e) => {
  if (isMobile()) return;
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown') goTo(current + 1);
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') goTo(current - 1);
  if (e.key === 'Home') goTo(0);
  if (e.key === 'End') goTo(totalPanels - 1);
});

