const canvas = document.getElementById("constellationCanvas");
const ctx = canvas.getContext("2d");

// STATE TRACKER
let isDarkMode = false;
let width, height;

// Resize canvas to fit window perfectly
function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
}
window.addEventListener("resize", resize);
resize();

// --- MOUSE TRACKING ---
let mouse = {x: null, y: null};
let lastMouse = {x: 0, y: 0};

window.addEventListener("mousemove", (e) => {
  mouse.x = e.x;
  mouse.y = e.y;

  // Only drop ripples if we are in Dark Mode!
  if (isDarkMode) {
    const dist = Math.hypot(e.x - lastMouse.x, e.y - lastMouse.y);
    if (dist > 45) {
      ripples.push(new Ripple(e.x, e.y, false));
      lastMouse.x = e.x;
      lastMouse.y = e.y;
    }
  }
});

window.addEventListener("mouseout", () => {
  mouse.x = null;
  mouse.y = null;
});

// ==========================================
// EFFECT 1: LIGHT MODE (FLOATING DUST)
// ==========================================
let particles = [];
const particleCount = 120;

class Particle {
  constructor() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * 0.15;
    this.vy = (Math.random() - 0.5) * 0.15;
    this.size = Math.random() * 1.5 + 0.5;
    this.color = Math.random() > 0.15 ? "0, 74, 173" : "193, 18, 31";
    this.baseAlpha = Math.random() * 0.4 + 0.1;
    this.alpha = this.baseAlpha;
    this.alphaChange = Math.random() * 0.01 - 0.005;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha += this.alphaChange;

    if (this.alpha <= 0.05 || this.alpha >= 0.6) this.alphaChange *= -1;

    if (this.x < 0) this.x = width;
    if (this.x > width) this.x = 0;
    if (this.y < 0) this.y = height;
    if (this.y > height) this.y = 0;

    if (mouse.x != null && mouse.y != null) {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 150) {
        const force = (150 - distance) / 150;
        this.x -= (dx / distance) * force * 1.5;
        this.y -= (dy / distance) * force * 1.5;
        this.alpha = Math.min(this.alpha + 0.05, 0.9);
      }
    }
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
    ctx.fill();
  }
}
for (let i = 0; i < particleCount; i++) particles.push(new Particle());

// ==========================================
// EFFECT 2: DARK MODE (ZEN RIPPLES)
// ==========================================
let ripples = [];
let dapples = [];

class Ripple {
  constructor(x, y, isAuto = false) {
    this.x = x;
    this.y = y;
    this.radius = 2;
    this.maxRadius = isAuto ? Math.random() * 30 + 40 : Math.random() * 60 + 80;
    this.alpha = isAuto ? 0.3 : 0.5;
    this.speed = isAuto ? 0.8 : 1.5;
  }
  update() {
    this.radius += this.speed;
    this.alpha -= (this.speed / this.maxRadius) * 0.8;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(0, 74, 173, ${Math.max(0, this.alpha)})`;
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }
}

class Dapple {
  constructor() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.radius = Math.random() * 250 + 150;
    this.vx = (Math.random() - 0.5) * 0.2;
    this.vy = (Math.random() - 0.5) * 0.2;
    this.alpha = Math.random() * 0.08 + 0.02;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < -this.radius) this.x = width + this.radius;
    if (this.x > width + this.radius) this.x = -this.radius;
    if (this.y < -this.radius) this.y = height + this.radius;
    if (this.y > height + this.radius) this.y = -this.radius;
  }
  draw() {
    const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
    gradient.addColorStop(0, `rgba(240, 245, 255, ${this.alpha})`);
    gradient.addColorStop(1, `rgba(240, 245, 255, 0)`);
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
  }
}
for (let i = 0; i < 12; i++) dapples.push(new Dapple());

// ==========================================
// THE SWITCH MECHANISM
// ==========================================
const logoTitle = document.querySelector(".logo-name");

if (logoTitle) {
  logoTitle.addEventListener("click", () => {
    // 1. Flip the state
    isDarkMode = !isDarkMode;

    // 2. Toggle the CSS classes on the Body and Logo
    document.body.classList.toggle("dark-mode");
    logoTitle.classList.toggle("is-white");

    // 3. Play the pulse animation
    logoTitle.classList.remove("logo-pulse");
    void logoTitle.offsetWidth;
    logoTitle.classList.add("logo-pulse");

    // 4. Wipe the canvas clean instantly so effects don't overlap
    ctx.clearRect(0, 0, width, height);
  });
}

// ==========================================
// MASTER ANIMATION LOOP
// ==========================================
function animate() {
  ctx.clearRect(0, 0, width, height);

  if (!isDarkMode) {
    // RUN LIGHT MODE LOGIC
    ctx.globalCompositeOperation = "source-over";
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }
  } else {
    // RUN DARK MODE LOGIC
    ctx.globalCompositeOperation = "lighter";
    dapples.forEach((dapple) => {
      dapple.update();
      dapple.draw();
    });

    ctx.globalCompositeOperation = "source-over";
    if (Math.random() < 0.015) ripples.push(new Ripple(Math.random() * width, Math.random() * height, true));

    for (let i = ripples.length - 1; i >= 0; i--) {
      ripples[i].update();
      ripples[i].draw();
      if (ripples[i].alpha <= 0) ripples.splice(i, 1);
    }
  }

  requestAnimationFrame(animate);
}

animate();
