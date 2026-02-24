const canvas = document.getElementById("constellationCanvas");
const ctx = canvas.getContext("2d");

let width, height;
let ripples = [];
let dapples = [];

// Resize canvas to fit window perfectly
function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
}

window.addEventListener("resize", resize);
resize();

// --- INTERACTIVE RIPPLES ---
class Ripple {
  constructor(x, y, isAuto = false) {
    this.x = x;
    this.y = y;
    this.radius = 2;
    // Auto ripples (raindrops) are smaller, mouse ripples are larger
    this.maxRadius = isAuto ? Math.random() * 30 + 40 : Math.random() * 60 + 80;
    this.alpha = isAuto ? 0.3 : 0.5; // Starting opacity
    this.speed = isAuto ? 0.8 : 1.5; // Expansion speed
  }

  update() {
    this.radius += this.speed;
    // Fade out gradually as the ripple expands
    this.alpha -= (this.speed / this.maxRadius) * 0.8;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    // Using your Cobalt Blue for the water ripples!
    ctx.strokeStyle = `rgba(0, 74, 173, ${Math.max(0, this.alpha)})`;
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }
}

// Mouse interaction tracking
let lastMouse = {x: 0, y: 0};
window.addEventListener("mousemove", (e) => {
  // Only create a new ripple if the mouse has moved enough distance (prevents clutter)
  const dist = Math.hypot(e.x - lastMouse.x, e.y - lastMouse.y);
  if (dist > 45) {
    ripples.push(new Ripple(e.x, e.y, false));
    lastMouse.x = e.x;
    lastMouse.y = e.y;
  }
});

// --- AMBIENT DAPPLED LIGHT ---
class Dapple {
  constructor() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.radius = Math.random() * 250 + 150; // Very large, soft orbs
    this.vx = (Math.random() - 0.5) * 0.2; // Extremely slow drifting
    this.vy = (Math.random() - 0.5) * 0.2;
    // Very faint, soft light colors
    this.alpha = Math.random() * 0.08 + 0.02;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    // Smoothly wrap around edges
    if (this.x < -this.radius) this.x = width + this.radius;
    if (this.x > width + this.radius) this.x = -this.radius;
    if (this.y < -this.radius) this.y = height + this.radius;
    if (this.y > height + this.radius) this.y = -this.radius;
  }

  draw() {
    // Creates the blurred, soft-focus light effect
    const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
    gradient.addColorStop(0, `rgba(240, 245, 255, ${this.alpha})`); // Center of light
    gradient.addColorStop(1, `rgba(240, 245, 255, 0)`); // Faded edge

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
  }
}

// Initialize ambient background lighting
for (let i = 0; i < 12; i++) {
  dapples.push(new Dapple());
}

// --- ANIMATION LOOP ---
function animate() {
  ctx.clearRect(0, 0, width, height);

  // 1. Draw Dappled Light
  // 'lighter' blends the lights together beautifully like real optics
  ctx.globalCompositeOperation = "lighter";
  dapples.forEach((dapple) => {
    dapple.update();
    dapple.draw();
  });

  // Reset blending mode for the sharp ripples
  ctx.globalCompositeOperation = "source-over";

  // 2. Occasional Auto-Ripples (Raindrops)
  if (Math.random() < 0.015) {
    // 1.5% chance every frame to create a random ripple
    ripples.push(new Ripple(Math.random() * width, Math.random() * height, true));
  }

  // 3. Draw Ripples
  for (let i = ripples.length - 1; i >= 0; i--) {
    ripples[i].update();
    ripples[i].draw();

    // Clean up ripples that have faded out to keep the browser running fast
    if (ripples[i].alpha <= 0) {
      ripples.splice(i, 1);
    }
  }

  requestAnimationFrame(animate);
}

animate();
