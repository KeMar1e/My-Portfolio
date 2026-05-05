/* ── CLOCK ────────────────────────────────── */
function tick() {
  document.getElementById('clock').textContent =
    new Date().toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', hour12: true }) +
    ' · ' +
    new Date().toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
}
tick();
setInterval(tick, 1000);

/* ── WINDOW STACK ─────────────────────────── */
let z = 100;

function centerWin(win) {
  const vw = window.innerWidth, vh = window.innerHeight;
  const w = win.offsetWidth  || parseInt(win.style.width) || 480;
  const h = win.offsetHeight || 400;
  win.style.left = Math.max(8, (vw - w) / 2) + 'px';
  win.style.top  = Math.max(8, (vh - h) / 2) + 'px';
}

function openWin(id) {
  const win = document.getElementById(id);
  win.classList.remove('closing');
  win.style.zIndex = ++z;
  win.classList.add('open');
  requestAnimationFrame(() => centerWin(win));
}

function closeWin(id) {
  const win = document.getElementById(id);
  win.classList.add('closing');
  win.addEventListener('animationend', () => win.classList.remove('open', 'closing'), { once: true });
}

/* bring to front on click */
document.querySelectorAll('.win').forEach(w =>
  w.addEventListener('mousedown', () => w.style.zIndex = ++z)
);

/* ── DRAG ─────────────────────────────────── */
let drag = null, ox = 0, oy = 0;

function startDrag(e, id) {
  if (e.target.classList.contains('win-close')) return;
  e.preventDefault();
  const win = document.getElementById(id);
  win.style.zIndex = ++z;
  ox = e.clientX - win.getBoundingClientRect().left;
  oy = e.clientY - win.getBoundingClientRect().top;
  drag = win;
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
}

function onDrag(e) {
  if (!drag) return;
  let nx = e.clientX - ox;
  let ny = e.clientY - oy;
  nx = Math.max(0, Math.min(nx, window.innerWidth  - drag.offsetWidth));
  ny = Math.max(0, Math.min(ny, window.innerHeight - drag.offsetHeight));
  drag.style.left = nx + 'px';
  drag.style.top  = ny + 'px';
}

function stopDrag() {
  drag = null;
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
}

/* ── LIGHTBOX ─────────────────────────────── */
function openLb(src) {
  document.getElementById('lb-img').src = src;
  document.getElementById('lb').classList.add('open');
}

function closeLb(e) {
  // close when clicking the backdrop or the X button, NOT when clicking the image itself
  if (!e || e.target !== document.getElementById('lb-img')) {
    document.getElementById('lb-img').src = '';
    document.getElementById('lb').classList.remove('open');
  }
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });

/* ── DARK MODE ────────────────────────────── */
const toggle = document.getElementById('theme-toggle');
let dark = false;

toggle.addEventListener('click', () => {
  dark = !dark;
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : '');
  toggle.textContent = dark ? '🌙' : '🔆';
});

/* ── FAIRY DUST CURSOR ────────────────────── */
(function fairyDust() {
  const colours = ['#c89dc8', '#f5b8c8', '#e8c8f0', '#fde8f0', '#d4a8e0', '#ffffff'];
  const hasPointerEvents = 'onpointermove' in window;
  let width = window.innerWidth, height = window.innerHeight;
  let particles = [];

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;top:0;left:0;pointer-events:none;z-index:9999;';
  canvas.width = width;
  canvas.height = height;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  window.addEventListener(hasPointerEvents ? 'pointermove' : 'mousemove', e => {
    for (let i = 0; i < 3; i++) spawnParticle(e.clientX, e.clientY);
  });

  function spawnParticle(x, y) {
    particles.push({
      x, y,
      vx: (Math.random() - .5) * 2.5,
      vy: (Math.random() - .8) * 2.5,
      size: Math.random() * 5 + 2,
      colour: colours[Math.floor(Math.random() * colours.length)],
      alpha: 1,
      shape: Math.random() > .5 ? 'star' : 'circle',
      rotation: Math.random() * Math.PI * 2,
    });
  }

  function drawStar(cx, cy, r, rot) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      ctx.lineTo( Math.cos((18 + i * 72) * Math.PI / 180) * r,        -Math.sin((18 + i * 72) * Math.PI / 180) * r);
      ctx.lineTo( Math.cos((54 + i * 72) * Math.PI / 180) * (r * .4), -Math.sin((54 + i * 72) * Math.PI / 180) * (r * .4));
    }
    ctx.closePath();
    ctx.restore();
  }

  function loop() {
    ctx.clearRect(0, 0, width, height);
    particles = particles.filter(p => p.alpha > 0.02);
    for (const p of particles) {
      p.x  += p.vx;
      p.y  += p.vy;
      p.vy += 0.06;
      p.alpha    *= 0.94;
      p.rotation += 0.08;
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle   = p.colour;
      if (p.shape === 'star') {
        drawStar(p.x, p.y, p.size, p.rotation);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * .6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(loop);
  }

  loop();
})();
