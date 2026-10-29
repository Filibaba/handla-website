// Floating nav, the hero's rotating headline word, and the 3D phone's tilt.

const floatingNav   = document.getElementById('floatingNav');
const headerLogo    = document.querySelector('.handla-logo');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

// ── Rotating word in the headline ────────────────────────────────────────────
(function rotateTagline() {
  const tagline = document.querySelector('.tagline');
  if (!tagline) return;
  const words = Array.from(tagline.querySelectorAll('span'));

  // On a phone the word has a line of its own and the box spans it; elsewhere the box
  // is as wide as the word showing.
  const fit = () => {
    const inline = getComputedStyle(tagline).display === 'inline-block';
    tagline.style.width = inline ? words[0].offsetWidth + 'px' : '';
  };
  fit();
  document.fonts.ready.then(fit);
  window.addEventListener('resize', fit, { passive: true });

  if (words.length < 2 || reducedMotion) return;
  setInterval(() => {
    words[0].classList.remove('active');
    words[0].classList.add('goingAway');
    words[1].classList.add('active');
    words[words.length - 1].classList.remove('goingAway');
    words.push(words.shift());
    fit();
  }, 2000);
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
