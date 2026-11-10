// Floating nav and the 3D phone's tilt.

const floatingNav   = document.getElementById('floatingNav');
const headerLogo    = document.querySelector('.handla-logo');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const touchScreen   = window.matchMedia('(any-pointer: coarse)').matches;

// ── Nav: a glass pill once the big logo has scrolled away ────────────────────
// Pages without the hero logo (support, privacy) keep the pill from the start.
if (floatingNav) {
  if (headerLogo) {
    new IntersectionObserver(([entry]) => {
      floatingNav.classList.toggle('is-scrolled', !entry.isIntersecting);
    }).observe(headerLogo);
  } else {
    floatingNav.classList.add('is-scrolled');
  }
}

// ── Hero photograph: drifts and goes out of focus as you scroll ──────────────
// Wider screens only, as on plantry.app: blurring it on a phone costs more than it shows. Not on
// touch screens at any width either (iPad, iPhone Duo unfolded), where the photo just sits still.
(function focusHero() {
  const hero = document.querySelector('.hero');
  const photo = document.querySelector('.hero-bg img');
  if (!hero || !photo) return;
  let queued = false;
  const update = () => {
    queued = false;
    const y = window.scrollY, width = window.innerWidth, height = window.innerHeight;
    if (width < 568 || touchScreen) { photo.style.transform = photo.style.filter = ''; return; }
    const blur = y / height * 30;
    // The scale keeps the blur's soft edge off the sides of the page.
    const drift = reducedMotion ? 0 : y * 500 / (hero.offsetHeight + height);
    photo.style.transform = `translate3d(0, ${drift}px, 0) scale(${1 + 3 * blur / width})`;
    photo.style.filter = `blur(${blur}px)`;
  };
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue, { passive: true });
  update();
}());

// ── 3D phone: follows the cursor a little and tips back as you scroll ────────
let viewportW = window.innerWidth, viewportH = window.innerHeight, scrollY = window.scrollY;
let mouseX = 0, mouseY = 0, smoothX = 0, smoothY = 0;

window.addEventListener('resize', () => { viewportW = window.innerWidth; viewportH = window.innerHeight; }, { passive: true });
window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });
if (!reducedMotion) {
  window.addEventListener('mousemove', e => {
    mouseX = (e.clientX / viewportW - 0.5) * 2;
    mouseY = (e.clientY / viewportH - 0.5) * 2;
  }, { passive: true });
}

let lastRx = null, lastRy = null;
(function tilt() {
  const phone = window.__splinePhone, base = window.__splinePhoneBase;
  if (phone && base) {
    let rx = base.rx, ry = base.ry;
    if (!reducedMotion) {
      smoothX += (mouseX - smoothX) * 0.06;
      smoothY += (mouseY - smoothY) * 0.06;
      rx = base.rx - Math.min(scrollY / 700, 1) * 0.45 + smoothY * 0.12;
      ry = base.ry + smoothX * 0.18;
    }
    // Only write when something moved, so an idle page doesn't re-render the scene.
    if (lastRx === null || Math.abs(rx - lastRx) > 1e-5 || Math.abs(ry - lastRy) > 1e-5) {
      phone.rotation.x = rx;
      phone.rotation.y = ry;
      lastRx = rx; lastRy = ry;
    }
  }
  requestAnimationFrame(tilt);
}());
