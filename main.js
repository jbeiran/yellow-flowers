"use strict";
const cvs = document.getElementById("c");
const cx = cvs.getContext("2d");
let W,
  H,
  GY,
  hillPts = [];

function onResize() {
  W = cvs.width = window.innerWidth;
  H = cvs.height = window.innerHeight;
  GY = H * 0.73;
  hillPts = computeHills();
}
window.addEventListener("resize", onResize);

const rnd = (a, b) => a + Math.random() * (b - a);
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const eOut3 = (t) => 1 - (1 - t) ** 3;

const STARS = Array.from({ length: 210 }, () => ({
  rx: Math.random(),
  ry: rnd(0, 0.65),
  r: rnd(0.28, 1.85),
  ph: rnd(0, Math.PI * 2),
  sp: rnd(0.0004, 0.0028),
}));

function drawStars() {
  for (const s of STARS) {
    const a = clamp(
      0.22 + Math.sin(performance.now() * s.sp + s.ph) * 0.32,
      0,
      1,
    );
    cx.beginPath();
    cx.arc(s.rx * W, s.ry * H, s.r, 0, Math.PI * 2);
    cx.fillStyle = `rgba(255,255,225,${a})`;
    cx.fill();
  }
}

function drawMoon() {
  const mx = W * 0.82,
    my = H * 0.1,
    mr = 36;
  const mg = cx.createRadialGradient(
    mx - mr * 0.2,
    my - mr * 0.2,
    mr * 0.1,
    mx,
    my,
    mr,
  );
  mg.addColorStop(0, "rgba(255,252,205,1)");
  mg.addColorStop(0.7, "rgba(240,224,155,.92)");
  mg.addColorStop(1, "rgba(200,174,95,.55)");
  cx.beginPath();
  cx.arc(mx, my, mr, 0, Math.PI * 2);
  cx.fillStyle = mg;
  cx.fill();

  const halo = cx.createRadialGradient(mx, my, mr, mx, my, mr * 5);
  halo.addColorStop(0, "rgba(255,235,130,.1)");
  halo.addColorStop(1, "rgba(255,235,130,0)");
  cx.beginPath();
  cx.arc(mx, my, mr * 5, 0, Math.PI * 2);
  cx.fillStyle = halo;
  cx.fill();
}

function computeHills() {
  const pts = [],
    seg = 30;
  for (let i = 0; i <= seg; i++) {
    const t = i / seg;
    pts.push({
      x: t * W,
      y:
        GY -
        Math.sin(t * Math.PI * 3.2 + 0.9) * 24 -
        Math.sin(t * Math.PI * 1.8 + 2.2) * 15 -
        Math.sin(t * Math.PI * 6.1 + 0.3) * 7,
    });
  }
  return pts;
}

function drawBackground() {
  const sky = cx.createLinearGradient(0, 0, 0, GY);
  sky.addColorStop(0, "#050510");
  sky.addColorStop(0.38, "#08082a");
  sky.addColorStop(0.72, "#0e0d2c");
  sky.addColorStop(1, "#0e1508");
  cx.fillStyle = sky;
  cx.fillRect(0, 0, W, GY);

  const gnd = cx.createLinearGradient(0, GY, 0, H);
  gnd.addColorStop(0, "#162212");
  gnd.addColorStop(0.4, "#0f1a0c");
  gnd.addColorStop(1, "#080d06");
  cx.fillStyle = gnd;
  cx.fillRect(0, GY, W, H - GY);

  if (hillPts.length > 1) {
    cx.beginPath();
    cx.moveTo(hillPts[0].x, hillPts[0].y);
    for (let i = 1; i < hillPts.length - 1; i++) {
      const mx = (hillPts[i].x + hillPts[i + 1].x) / 2;
      const my = (hillPts[i].y + hillPts[i + 1].y) / 2;
      cx.quadraticCurveTo(hillPts[i].x, hillPts[i].y, mx, my);
    }
    cx.lineTo(W, H);
    cx.lineTo(0, H);
    cx.closePath();
    const hg = cx.createLinearGradient(0, GY - 30, 0, GY + 55);
    hg.addColorStop(0, "#203416");
    hg.addColorStop(0.4, "#152810");
    hg.addColorStop(1, "#0c1a08");
    cx.fillStyle = hg;
    cx.fill();
  }
}

function drawHeartGlow(now) {
  const hcx = W * 0.5;
  const hcy = H * 0.28;
  const sc = Math.min(W, H) * 0.011;
  const pulse = 0.7 + Math.sin(now * 0.0018) * 0.3;

  const gr = Math.min(W, H) * 0.42;
  const g = cx.createRadialGradient(hcx, hcy, 0, hcx, hcy, gr);
  g.addColorStop(0, `rgba(255,190,0,${0.14 * pulse})`);
  g.addColorStop(0.45, `rgba(255,140,0,${0.07 * pulse})`);
  g.addColorStop(1, "rgba(255,140,0,0)");
  cx.beginPath();
  cx.arc(hcx, hcy, gr, 0, Math.PI * 2);
  cx.fillStyle = g;
  cx.fill();

  function heartPath() {
    cx.beginPath();
    for (let i = 0; i <= 220; i++) {
      const t = (i / 220) * Math.PI * 2;
      const hx = hcx + sc * 16 * Math.pow(Math.sin(t), 3);
      const hy =
        hcy -
        sc *
          (13 * Math.cos(t) -
            5 * Math.cos(2 * t) -
            2 * Math.cos(3 * t) -
            Math.cos(4 * t));
      if (i === 0) cx.moveTo(hx, hy);
      else cx.lineTo(hx, hy);
    }
    cx.closePath();
  }

  heartPath();
  cx.strokeStyle = `rgba(255,200,50,${0.14 * pulse})`;
  cx.lineWidth = 18;
  cx.stroke();

  heartPath();
  cx.strokeStyle = `rgba(255,225,90,${0.28 * pulse})`;
  cx.lineWidth = 3.5;
  cx.stroke();
}

function drawVignette() {
  const g = cx.createRadialGradient(
    W * 0.5,
    H * 0.5,
    H * 0.28,
    W * 0.5,
    H * 0.5,
    H * 0.9,
  );
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(0,0,0,.54)");
  cx.fillStyle = g;
  cx.fillRect(0, 0, W, H);
}

class Firefly {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = rnd(0.05, 0.95);
    this.y = rnd(0.22, 0.72);
    this.vx = rnd(-0.3, 0.3);
    this.vy = rnd(-0.3, 0.3);
    this.ph = rnd(0, Math.PI * 2);
    this.sp = rnd(0.01, 0.025);
    this.r = rnd(1.2, 3.1);
  }
  update(dt) {
    this.vx += rnd(-0.07, 0.07) * dt * 60;
    this.vy += rnd(-0.07, 0.07) * dt * 60;
    const s = Math.hypot(this.vx, this.vy);
    if (s > 0.85) {
      this.vx *= 0.85 / s;
      this.vy *= 0.85 / s;
    }
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    if (this.x < 0 || this.x > 1 || this.y < 0.08 || this.y > 0.82)
      this.reset();
  }
  draw(alpha) {
    const a = clamp(
      (0.25 + Math.sin(performance.now() * this.sp + this.ph) * 0.3) * alpha,
      0,
      1,
    );
    const px = this.x * W,
      py = this.y * H;
    const g = cx.createRadialGradient(px, py, 0, px, py, this.r * 7);
    g.addColorStop(0, `rgba(255,245,80,${a})`);
    g.addColorStop(1, "rgba(255,245,80,0)");
    cx.beginPath();
    cx.arc(px, py, this.r * 7, 0, Math.PI * 2);
    cx.fillStyle = g;
    cx.fill();
    cx.beginPath();
    cx.arc(px, py, this.r, 0, Math.PI * 2);
    cx.fillStyle = `rgba(255,255,185,${clamp(a * 2.2, 0, 1)})`;
    cx.fill();
  }
}
const fireflies = Array.from({ length: 28 }, () => new Firefly());

class Petal {
  constructor(spread = false) {
    this.reset(spread);
  }
  reset(spread = false) {
    this.x = rnd(0, W);
    this.y = spread ? rnd(-H, 0) : rnd(-80, -10);
    this.sz = rnd(4, 10);
    this.vy = rnd(0.55, 1.75);
    this.vx = rnd(-0.6, 0.6);
    this.rot = rnd(0, Math.PI * 2);
    this.rv = rnd(-0.045, 0.045);
    this.hue = rnd(37, 54);
    this.lum = rnd(55, 72) | 0;
    this.a = rnd(0.45, 0.9);
  }
  update() {
    this.y += this.vy;
    this.x += this.vx + Math.sin(this.y * 0.017) * 0.44;
    this.rot += this.rv;
    if (this.y > H + 20) this.reset();
  }
  draw(alpha) {
    cx.save();
    cx.translate(this.x, this.y);
    cx.rotate(this.rot);
    cx.globalAlpha = this.a * alpha;
    cx.beginPath();
    cx.ellipse(0, 0, this.sz * 0.34, this.sz, 0, 0, Math.PI * 2);
    cx.fillStyle = `hsl(${this.hue},100%,${this.lum}%)`;
    cx.fill();
    cx.restore();
  }
}
const petals = Array.from({ length: 55 }, (_, i) => new Petal(i < 30));

class Sparkle {
  constructor(x, y) {
    this.ox = x;
    this.oy = y;
    this.t0 = performance.now();
    this.dur = 900;
    this.pts = Array.from({ length: 14 }, () => ({
      px: 0,
      py: 0,
      vx: Math.cos(rnd(0, Math.PI * 2)) * rnd(1.8, 5.5),
      vy: Math.sin(rnd(0, Math.PI * 2)) * rnd(1.8, 5.5) - 1.2,
      r: rnd(2, 5.5),
      hue: rnd(38, 55),
    }));
  }
  update() {
    for (const p of this.pts) {
      p.px += p.vx;
      p.py += p.vy;
      p.vy += 0.22;
      p.vx *= 0.93;
      p.vy *= 0.93;
    }
    return performance.now() - this.t0 < this.dur;
  }
  draw() {
    const life = clamp(1 - (performance.now() - this.t0) / this.dur, 0, 1);
    for (const p of this.pts) {
      cx.beginPath();
      cx.arc(this.ox + p.px, this.oy + p.py, p.r * life, 0, Math.PI * 2);
      cx.fillStyle = `hsla(${p.hue},100%,65%,${life * 0.9})`;
      cx.fill();
    }
  }
}
let sparkles = [];

class FlyingParticle {
  constructor(fx, fy, tx, ty, startAt, onArrival) {
    this.fx = fx;
    this.fy = fy;
    this.tx = tx;
    this.ty = ty;
    this.t0 = startAt;
    this.dur = rnd(1000, 1600);
    this.onArrival = onArrival;
    this.done = false;
    this.progress = 0;
    this.hue = rnd(38, 52);
    this.np = 6 + Math.floor(rnd(0, 3));
    this.spinOff = rnd(0, Math.PI * 2);
  }

  _pos(t) {
    const et = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    const ctrlX = lerp(this.fx, this.tx, 0.5);
    const ctrlY = Math.max(
      20,
      this.ty - Math.abs(this.fy - this.ty) * 0.5 - 80,
    );
    return {
      x:
        (1 - et) * (1 - et) * this.fx +
        2 * (1 - et) * et * ctrlX +
        et * et * this.tx,
      y:
        (1 - et) * (1 - et) * this.fy +
        2 * (1 - et) * et * ctrlY +
        et * et * this.ty,
    };
  }

  update(now) {
    if (this.done) return;
    const elapsed = now - this.t0;
    if (elapsed < 0) return;
    this.progress = Math.min(1, elapsed / this.dur);
    if (this.progress >= 1 && !this.done) {
      this.done = true;
      this.onArrival();
    }
  }

  draw(now) {
    if (this.done || this.progress <= 0) return;
    const { x, y } = this._pos(this.progress);
    const a =
      this.progress < 0.08
        ? this.progress / 0.08
        : this.progress > 0.88
          ? (1 - this.progress) / 0.12
          : 1;

    const r = 11;
    const angle = this.spinOff + this.progress * Math.PI * 2;

    cx.save();
    cx.translate(x, y);
    cx.rotate(angle);
    cx.globalAlpha = a;

    const gl = cx.createRadialGradient(0, 0, 0, 0, 0, r * 2.8);
    gl.addColorStop(0, `rgba(255,215,0,0.45)`);
    gl.addColorStop(1, "rgba(255,200,0,0)");
    cx.beginPath();
    cx.arc(0, 0, r * 2.8, 0, Math.PI * 2);
    cx.fillStyle = gl;
    cx.fill();

    for (let i = 0; i < this.np; i++) {
      cx.save();
      cx.rotate((i / this.np) * Math.PI * 2);
      cx.beginPath();
      cx.ellipse(0, -r * 0.62, r * 0.32, r * 0.6, 0, 0, Math.PI * 2);
      cx.fillStyle = `hsl(${this.hue + 8}, 100%, 75%)`;
      cx.fill();
      cx.restore();
    }

    cx.beginPath();
    cx.arc(0, 0, r * 0.32, 0, Math.PI * 2);
    cx.fillStyle = "#6b3a12";
    cx.fill();

    cx.restore();
  }
}
let flyParticles = [];

class Flower {
  constructor(x, y, size, delay = 0, glow = false, nostem = false) {
    this.bx = x;
    this.by = y;
    this.sz = size;
    this.delay = delay;
    this.glow = glow;
    this.nostem = nostem;
    this.stemH = nostem ? 0 : size * 2.9 + rnd(-size * 0.45, size * 0.45);
    this.np = 6 + Math.floor(rnd(0, 3));
    this.hue = rnd(38, 52);
    this.swPh = rnd(0, Math.PI * 2);
    this.leaves = [
      { t: rnd(0.33, 0.5), side: 1, ls: rnd(0.6, 0.9) },
      { t: rnd(0.52, 0.68), side: -1, ls: rnd(0.5, 0.82) },
    ];
    this.progress = 0;
    this.active = false;
    this.t0 = 0;
    this.dur = rnd(1700, 2700);
  }

  bloom(at) {
    this.active = true;
    this.t0 = at + this.delay;
  }

  update(now) {
    if (!this.active) return;
    const elapsed = now - this.t0;
    if (elapsed < 0) return;
    this.progress = Math.min(1, eOut3(elapsed / this.dur));
  }

  tipPos(now) {
    const sway = Math.sin(now * 0.00088 + this.swPh) * this.sz * 0.38;
    const sp = clamp(this.progress * 1.65, 0, 1);
    return { x: this.bx + sway * sp, y: this.by - this.stemH * sp };
  }

  draw(now) {
    if (!this.active || this.progress <= 0) return;

    const sp = clamp(this.progress * 1.65, 0, 1);
    const fp = clamp((this.progress - 0.22) / 0.78, 0, 1);
    const tp = this.tipPos(now);

    if (!this.nostem && sp > 0) {
      cx.beginPath();
      cx.moveTo(this.bx, this.by);
      cx.quadraticCurveTo(
        lerp(this.bx, tp.x, 0.5),
        lerp(this.by, tp.y, 0.5),
        tp.x,
        tp.y,
      );
      cx.strokeStyle = "#2a5516";
      cx.lineWidth = Math.max(1.5, this.sz * 0.09);
      cx.lineCap = "round";
      cx.stroke();

      for (const lf of this.leaves) {
        if (sp < lf.t) continue;
        const lp = clamp(((sp - lf.t) / (1 - lf.t)) * 2.8, 0, 1);
        const lx = lerp(this.bx, tp.x, lf.t);
        const ly = lerp(this.by, tp.y, lf.t);
        this._leaf(lx, ly, lf.side, this.sz * 0.75 * lf.ls, lp);
      }
    }

    if (fp <= 0) return;

    const gr = this.sz * 3.5 * fp;
    const ga = (this.glow ? 0.32 : 0.12) * fp;
    const gg = cx.createRadialGradient(tp.x, tp.y, 0, tp.x, tp.y, gr);
    gg.addColorStop(0, `rgba(255,205,0,${ga})`);
    gg.addColorStop(1, "rgba(255,205,0,0)");
    cx.beginPath();
    cx.arc(tp.x, tp.y, gr, 0, Math.PI * 2);
    cx.fillStyle = gg;
    cx.fill();

    cx.save();
    cx.translate(tp.x, tp.y);

    for (let i = 0; i < this.np; i++) {
      cx.save();
      cx.rotate((i / this.np) * Math.PI * 2);
      const pw = this.sz * 0.33 * fp;
      const ph = this.sz * 0.63 * fp;
      cx.beginPath();
      cx.ellipse(0, -this.sz * 0.58 * fp, pw, ph, 0, 0, Math.PI * 2);
      const pg = cx.createRadialGradient(
        0,
        -this.sz * 0.44 * fp,
        0,
        0,
        -this.sz * 0.44 * fp,
        ph,
      );
      pg.addColorStop(0, `hsl(${this.hue + 11},100%,82%)`);
      pg.addColorStop(1, `hsl(${this.hue},95%,54%)`);
      cx.fillStyle = pg;
      cx.fill();
      cx.restore();
    }

    for (let i = 0; i < this.np; i++) {
      cx.save();
      cx.rotate((i / this.np) * Math.PI * 2 + Math.PI / this.np);
      const fp2 = fp * 0.84;
      cx.beginPath();
      cx.ellipse(
        0,
        -this.sz * 0.52 * fp2,
        this.sz * 0.27 * fp2,
        this.sz * 0.51 * fp2,
        0,
        0,
        Math.PI * 2,
      );
      cx.fillStyle = `hsl(${this.hue - 4},94%,60%)`;
      cx.fill();
      cx.restore();
    }

    const cr = this.sz * 0.31 * fp;
    const cg = cx.createRadialGradient(-cr * 0.15, -cr * 0.15, 0, 0, 0, cr);
    cg.addColorStop(0, "#8c5425");
    cg.addColorStop(0.6, "#5c3212");
    cg.addColorStop(1, "#3a1f08");
    cx.beginPath();
    cx.arc(0, 0, cr, 0, Math.PI * 2);
    cx.fillStyle = cg;
    cx.fill();

    if (fp > 0.7) {
      const da = (fp - 0.7) / 0.3;
      for (let i = 0; i < 22; i++) {
        const a = (i / 22) * Math.PI * 2;
        const dr = cr * (0.55 + Math.sin(a * 5 + 1.2) * 0.08);
        cx.beginPath();
        cx.arc(Math.cos(a) * dr, Math.sin(a) * dr, cr * 0.09, 0, Math.PI * 2);
        cx.fillStyle = `rgba(255,170,38,${da * 0.72})`;
        cx.fill();
      }
    }

    cx.restore();
  }

  _leaf(x, y, side, size, progress) {
    cx.save();
    cx.translate(x, y);
    cx.rotate(side * (0.62 + (1 - progress) * 0.32));
    cx.beginPath();
    cx.ellipse(
      side * size * 0.34,
      0,
      size * 0.21 * progress,
      size * 0.5 * progress,
      side * 0.26,
      0,
      Math.PI * 2,
    );
    const lg = cx.createLinearGradient(0, -size * 0.4, 0, size * 0.4);
    lg.addColorStop(0, "#5cb82e");
    lg.addColorStop(1, "#2d5a14");
    cx.fillStyle = lg;
    cx.fill();
    cx.restore();
  }
}

let fieldFlowers = [],
  interFlowers = [],
  heartFlowers = [],
  centerFlower = null;

function buildField() {
  fieldFlowers = [];
  const n = Math.max(14, Math.floor(W / 80));
  for (let i = 0; i < n; i++) {
    fieldFlowers.push(
      new Flower(
        rnd(W * 0.04, W * 0.96),
        GY + rnd(-8, 18),
        rnd(13, 33),
        rnd(0, 2800),
      ),
    );
  }
}

function buildHeart() {
  heartFlowers = [];
  const hcx = W * 0.5;
  const hcy = H * 0.28;
  const sc = Math.min(W, H) * 0.011;

  const total = 44;
  let delay = 0;
  for (let i = 0; i < total; i++) {
    const t = (i / total) * Math.PI * 2;
    if (Math.abs(t - Math.PI) < 0.22) continue;
    const hx = hcx + sc * 16 * Math.pow(Math.sin(t), 3);
    const hy =
      hcy -
      sc *
        (13 * Math.cos(t) -
          5 * Math.cos(2 * t) -
          2 * Math.cos(3 * t) -
          Math.cos(4 * t));
    heartFlowers.push(new Flower(hx, hy, rnd(13, 19), 0, true, true));
    delay++;
  }

  [-0.1, 0, 0.1].forEach((offset, idx) => {
    const t = Math.PI + offset;
    const hx = hcx + sc * 16 * Math.pow(Math.sin(t), 3);
    const hy =
      hcy -
      sc *
        (13 * Math.cos(t) -
          5 * Math.cos(2 * t) -
          2 * Math.cos(3 * t) -
          Math.cos(4 * t));
    heartFlowers.push(new Flower(hx, hy, rnd(9, 13), 0, true, true));
  });
}

const tcEl = document.getElementById("tc");
const hintEl = document.getElementById("hint");
const dotsEl = document.getElementById("dots");
const uiEl = document.getElementById("ui");

const SCENES = [
  {
    text: `<h1>Para Ti, el amor de mi vida</h1><p>Una historia contada<br>en flores amarillas de como cambiaste mi vida</p>`,
    hint: "Haz clic para comenzar",
    auto: 0,
  },

  {
    text: `<p>Antes de conocerte,<br>mi mundo era un campo vacío…</p>`,
    hint: "Continuar",
    auto: 0,
  },

  { text: `<h2>Entonces llegaste tú</h2>`, hint: null, auto: 5200 },

  {
    text: `<p>Sin avisar,<br>sin pedir permiso,<br>simplemente apareciste<br>y cambiaste todo</p>`,
    hint: null,
    auto: 5800,
  },

  {
    text: `<p>Planta flores donde vayas<br><small>Haz clic en el campo</small></p>`,
    hint: "Continuar",
    auto: 20000,
  },

  {
    text: `<h2>Mi mundo se llenó de luz</h2><p>De color, de vida, de ti</p>`,
    hint: null,
    auto: 5200,
  },

  {
    text: `<h2>Eres mi flor amarilla</h2><p>La que florece<br>en cada rincón de mi vida</p>`,
    hint: null,
    auto: 4800,
  },

  {
    text: `<h1>Te Amo</h1><p>Hoy, mañana,<br>y cada día que me queda</p>`,
    hint: "♡  volver a empezar  ♡",
    auto: 0,
  },
];

SCENES.forEach((_, i) => {
  const d = document.createElement("div");
  d.className = "dot";
  d.id = `d${i}`;
  dotsEl.appendChild(d);
});

function showText(html, delay = 400) {
  tcEl.classList.remove("show");
  tcEl.classList.add("hide");
  setTimeout(() => {
    tcEl.innerHTML = html;
    void tcEl.offsetWidth;
    tcEl.classList.remove("hide");
    setTimeout(() => tcEl.classList.add("show"), 60);
  }, delay + 250);
}

function setDots(n) {
  document
    .querySelectorAll(".dot")
    .forEach((d, i) => d.classList.toggle("on", i === n));
}

let sceneIdx = -1,
  sceneT = 0,
  autoTmr = null;
let planting = false,
  showHeart = false;
let fireFlyAlpha = 0,
  petalAlpha = 0;

function resetAll() {
  buildField();
  buildHeart();
  centerFlower = null;
  interFlowers = [];
  sparkles = [];
  flyParticles = [];
  fireFlyAlpha = 0;
  petalAlpha = 0;
  showHeart = false;
  planting = false;
  tcEl.classList.remove("scene-final");
}

function goScene(n) {
  if (n < 0) return;
  if (n >= SCENES.length) {
    resetAll();
    goScene(0);
    return;
  }

  sceneIdx = n;
  sceneT = performance.now();
  const s = SCENES[n];

  showText(s.text, n === 0 ? 900 : 400);
  hintEl.textContent = s.hint || "";
  setDots(n);

  if (autoTmr) {
    clearTimeout(autoTmr);
    autoTmr = null;
  }
  planting = false;
  showHeart = false;
  tcEl.classList.remove("scene-final");

  switch (n) {
    case 0:
    case 1:
      break;

    case 2:
      centerFlower = new Flower(W * 0.5, GY + 4, 50, 0, true, false);
      centerFlower.bloom(performance.now() + 500);
      autoTmr = setTimeout(() => goScene(3), s.auto);
      break;

    case 3: {
      const t3 = performance.now();
      const half = Math.floor(fieldFlowers.length / 2);
      for (let i = 0; i < half; i++) fieldFlowers[i].bloom(t3);
      autoTmr = setTimeout(() => goScene(4), s.auto);
      break;
    }

    case 4:
      planting = true;
      interFlowers = [];
      autoTmr = setTimeout(() => goScene(5), s.auto);
      break;

    case 5: {
      const t5 = performance.now();
      for (const f of fieldFlowers) if (!f.active) f.bloom(t5);
      autoTmr = setTimeout(() => goScene(6), s.auto);
      break;
    }

    case 6:
      autoTmr = setTimeout(() => goScene(7), s.auto);
      break;

    case 7: {
      showHeart = true;
      flyParticles = [];
      tcEl.classList.add("scene-final");
      const t7 = performance.now();

      const groundSources = [
        ...interFlowers.map((f) => ({ x: f.bx, y: f.by })),
        ...fieldFlowers
          .filter((f) => f.active)
          .map((f) => ({
            x: f.tipPos(t7).x,
            y: f.by,
          })),
      ];

      if (groundSources.length === 0) {
        for (let i = 0; i < 20; i++)
          groundSources.push({
            x: rnd(W * 0.1, W * 0.9),
            y: GY + rnd(-10, 10),
          });
      }

      heartFlowers.forEach((flower, idx) => {
        const src = groundSources[idx % groundSources.length];
        const srcX = src.x + rnd(-25, 25);
        const srcY = src.y + rnd(-10, 5);
        const startAt = t7 + 600 + idx * 50 + rnd(0, 40);

        flyParticles.push(
          new FlyingParticle(srcX, srcY, flower.bx, flower.by, startAt, () => {
            flower.bloom(performance.now());
            sparkles.push(new Sparkle(flower.bx, flower.by));
          }),
        );
      });
      break;
    }
  }
}

document.addEventListener("click", (e) => {
  if (planting && e.clientY > GY - 35) {
    const f = new Flower(
      e.clientX,
      GY + rnd(-5, 14),
      rnd(18, 38),
      0,
      false,
      false,
    );
    f.bloom(performance.now());
    interFlowers.push(f);
    sparkles.push(new Sparkle(e.clientX, e.clientY));
  } else {
    if (SCENES[sceneIdx]?.hint) goScene(sceneIdx + 1);
  }
});

document.addEventListener("keydown", (e) => {
  if (
    ["Space", "ArrowRight", "Enter"].includes(e.code) &&
    SCENES[sceneIdx]?.hint
  )
    goScene(sceneIdx + 1);
});

let lastT = 0;

function frame(now) {
  const dt = clamp((now - lastT) / 1000, 0, 0.05);
  lastT = now;

  cx.clearRect(0, 0, W, H);
  drawBackground();
  drawStars();
  drawMoon();

  if (sceneIdx >= 3) fireFlyAlpha = Math.min(1, fireFlyAlpha + dt / 2.5);
  if (sceneIdx >= 4) petalAlpha = Math.min(1, petalAlpha + dt / 3.5);

  if (fireFlyAlpha > 0)
    for (const f of fireflies) {
      f.update(dt);
      f.draw(fireFlyAlpha);
    }

  const allF = [];
  if (sceneIdx >= 2 && sceneIdx < 7 && centerFlower) {
    centerFlower.update(now);
    allF.push(centerFlower);
  }
  if (sceneIdx >= 3 && sceneIdx < 7)
    for (const f of fieldFlowers) {
      f.update(now);
      allF.push(f);
    }
  if (sceneIdx >= 4 && sceneIdx < 7)
    for (const f of interFlowers) {
      f.update(now);
      allF.push(f);
    }
  if (showHeart)
    for (const f of heartFlowers) {
      f.update(now);
      allF.push(f);
    }

  allF.sort((a, b) => {
    if (a.nostem && !b.nostem) return 1;
    if (!a.nostem && b.nostem) return -1;
    return a.by - b.by;
  });
  if (showHeart) drawHeartGlow(now);

  if (sceneIdx === 7) {
    const fadeT = clamp(1 - (now - sceneT) / 700, 0, 1);
    if (fadeT > 0) {
      cx.globalAlpha = fadeT;
      const groundF = [
        ...(centerFlower ? [centerFlower] : []),
        ...fieldFlowers,
        ...interFlowers,
      ]
        .filter((f) => f.active && f.progress > 0)
        .sort((a, b) => a.by - b.by);
      for (const gf of groundF) gf.draw(now);
      cx.globalAlpha = 1;
    }
  }

  for (const p of flyParticles) {
    p.update(now);
    p.draw(now);
  }
  for (const f of allF) f.draw(now);

  sparkles = sparkles.filter((s) => {
    const ok = s.update();
    s.draw();
    return ok;
  });

  if (petalAlpha > 0)
    for (const p of petals) {
      p.update();
      p.draw(petalAlpha);
    }

  drawVignette();
  requestAnimationFrame(frame);
}

onResize();
buildField();
buildHeart();
goScene(0);
requestAnimationFrame(frame);
