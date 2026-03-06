/* ============================================================
   scroll.js  —  Horizontal Scroll Engine
   ============================================================
   Manages all panel navigation for the horizontal scroll layout.

   EXPORTS (globals used by HTML onclick attributes):
   • goTo(index)   — navigate to panel by index (0-based)

   INTERNAL:
   • render()      — updates DOM state for current panel
                     (progress bar, nav dots, counter, label,
                      reveal classes, chart trigger)
   • triggerCharts() — called from interactions.js; bridged here

   INPUT METHODS HANDLED:
   • Mouse wheel / trackpad  (desktop only)
   • Touch swipe             (distinguishes h/v intent)
   • Keyboard ← →            (desktop only)

   DEPENDENCIES:
   • interactions.js must be loaded BEFORE this file so
     triggerCharts() is available when render() calls it.
   • DOM elements: #scroll-container, #progress-bar,
     #nav-dots, #cur-panel, #panel-label, #scroll-hint,
     .panel, .nav-dot, .reveal

   HOW TO REUSE:
   1. Keep the same HTML structure (#scroll-container > .panel)
   2. Include interactions.js first, then this file
   3. Call goTo(0) manually if you need a programmatic start
   ============================================================ */

// ── STATE ──────────────────────────────────────────
const panels = document.querySelectorAll('.panel');
const totalPanels = panels.length;
let current = 0;
let isAnimating = false;

// ── BUILD NAV DOTS ─────────────────────────────────
const dotsContainer = document.getElementById('nav-dots');
panels.forEach((p, i) => {
  const d = document.createElement('button');
  d.className = 'nav-dot' + (i === 0 ? ' active' : '');
  d.title = p.dataset.label || '';
  d.addEventListener('click', () => goTo(i));
  dotsContainer.appendChild(d);
});
document.getElementById('tot-panels').textContent = totalPanels;

// ── GO TO PANEL ────────────────────────────────────
function goTo(index) {
  if (index < 0 || index >= totalPanels || index === current) return;
  current = index;
  render();
}

function render() {
  const container = document.getElementById('scroll-container');
  // Always use horizontal transform (desktop + mobile)
  container.style.transform = `translateX(-${current * 100}vw)`;
  // Reset any vertical scroll so panel content starts at top
  window.scrollTo(0, 0);

  // Progress bar
  const pct = totalPanels > 1 ? (current / (totalPanels - 1)) * 100 : 100;
  document.getElementById('progress-bar').style.width = pct + '%';

  // Nav dots
  document.querySelectorAll('.nav-dot').forEach((d, i) => d.classList.toggle('active', i === current));

  // Counter
  document.getElementById('cur-panel').textContent = current + 1;

  // Label
  document.getElementById('panel-label').textContent = panels[current].dataset.label || '';

  // Active panel
  panels.forEach((p, i) => p.classList.toggle('active', i === current));

  // Scroll/swipe hint — only on first panel
  document.getElementById('scroll-hint').style.visibility = current === 0 ? 'visible' : 'hidden';
  const sh = document.getElementById('swipe-hint');
  if (sh) sh.style.visibility = current === 0 ? 'visible' : 'hidden';

  // Trigger chart animations for the newly active panel
  triggerCharts(panels[current]);
}

// ── INIT ───────────────────────────────────────────
render();

