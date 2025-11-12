const DEFAULT_CONFIG = {
  particleCount: 90,
  edgeThreshold: 130,
  mouseRadius: 150,
  particleSize: 1.8,
  maxSpeed: 0.32,
  redColor: '#ff3b3b',
  reducedMotion: false
};

const MOTION_QUERY = window.matchMedia('(prefers-reduced-motion: reduce)');

class InteractiveTriangles {
  constructor(container, config = {}) {
    this.container = container;
    this.canvas = container.querySelector('canvas');
    if (!this.canvas) {
      throw new Error('interactive-bg requires a <canvas> inside the container');
    }

    this.ctx = this.canvas.getContext('2d');
    this.dpr = window.devicePixelRatio || 1;

    this.config = { ...DEFAULT_CONFIG, ...config };
    this.pointer = { active: false, x: 0, y: 0 };
    this.running = false;
    this.frameId = null;
    this.particles = [];
    this.edges = [];
    this.neighbors = [];
    this.adjacency = new Map();
    this.contentElement = container.querySelector('.interactive-bg__content');
    this.contentRect = null;
    this.contentPadding = 48;
    this.lastRectUpdate = 0;

    this._handleResize = this.handleResize.bind(this);
    this._handlePointerMove = this.handlePointerMove.bind(this);
    this._handlePointerLeave = this.handlePointerLeave.bind(this);
    this._handlePointerDown = this.handlePointerDown.bind(this);

    this.setup();
  }

  setup() {
    this.updateReducedMotion();
    this.applyResponsiveConfig();
    this.handleResize();
    window.addEventListener('resize', this._handleResize);
    window.addEventListener('pointermove', this._handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', this._handlePointerDown, { passive: true });
    window.addEventListener('pointerleave', this._handlePointerLeave, { passive: true });
    MOTION_QUERY.addEventListener('change', () => this.updateReducedMotion());
  }

  updateReducedMotion() {
    this.prefersReduced = this.config.reducedMotion || MOTION_QUERY.matches;
    if (this.prefersReduced) {
      this.stop();
      this.clearCanvas();
      if (this.canvas) {
        this.canvas.classList.add('interactive-bg--static');
      }
    } else {
      if (this.canvas) {
        this.canvas.classList.remove('interactive-bg--static');
      }
      if (this.running === false) {
        this.start();
      }
    }
  }

  applyResponsiveConfig() {
    const width = window.innerWidth;
    const deviceMemory = navigator.deviceMemory || 8;
    const scale = width < 768 ? 0.35 : deviceMemory <= 4 ? 0.6 : 1;
    this.particleCount = Math.max(20, Math.floor(this.config.particleCount * scale));
  }

  createParticles() {
    this.particles = new Array(this.particleCount);
    this.neighbors = new Array(this.particleCount);
    for (let i = 0; i < this.particleCount; i++) {
      const x = Math.random() * this.width;
      const y = Math.random() * this.height;
      const vx = (Math.random() - 0.5) * this.config.maxSpeed;
      const vy = (Math.random() - 0.5) * this.config.maxSpeed;
      this.particles[i] = { x, y, vx, vy };
      this.neighbors[i] = [];
    }
  }

  handleResize() {
    const rect = this.container.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    const canvas = this.canvas;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    if (dpr !== this.dpr) {
      this.dpr = dpr;
    }

    canvas.width = Math.round(this.width * this.dpr);
    canvas.height = Math.round(this.height * this.dpr);
    canvas.style.width = `${this.width}px`;
    canvas.style.height = `${this.height}px`;
    this.ctx.scale(this.dpr, this.dpr);

    this.createParticles();
    this.updateContentRect();
  }

  handlePointerMove(event) {
    const rect = this.container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    this.pointer = { active: true, x, y };
  }

  handlePointerDown(event) {
    this.handlePointerMove(event);
  }

  handlePointerLeave() {
    this.pointer.active = false;
  }

  updateParticles() {
    const maxSpeed = this.config.maxSpeed;
    const pointer = this.pointer;
    const width = this.width;
    const height = this.height;
    const mouseRadiusSq = this.config.mouseRadius * this.config.mouseRadius;

    for (let i = 0; i < this.particleCount; i++) {
      const p = this.particles[i];
      const jitterX = (Math.random() - 0.5) * 0.02;
      const jitterY = (Math.random() - 0.5) * 0.02;

      if (pointer.active) {
        const dx = pointer.x - p.x;
        const dy = pointer.y - p.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < mouseRadiusSq) {
          const force = 0.0006 * (1 - distSq / mouseRadiusSq);
          p.vx += dx * force;
          p.vy += dy * force;
        }
      }

      p.vx += jitterX;
      p.vy += jitterY;

      const speed = Math.hypot(p.vx, p.vy);
      if (speed > maxSpeed) {
        p.vx = (p.vx / speed) * maxSpeed;
        p.vy = (p.vy / speed) * maxSpeed;
      }

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = width; else if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height; else if (p.y > height) p.y = 0;
    }
  }

  buildGraph() {
    const thresholdSq = this.config.edgeThreshold * this.config.edgeThreshold;
    const particles = this.particles;
    const count = this.particleCount;
    const adjacency = this.adjacency;

    adjacency.clear();
    for (let i = 0; i < count; i++) {
      this.neighbors[i].length = 0;
    }

    for (let i = 0; i < count; i++) {
      const pi = particles[i];
      for (let j = i + 1; j < count; j++) {
        const pj = particles[j];
        const dx = pi.x - pj.x;
        const dy = pi.y - pj.y;
        const distSq = dx * dx + dy * dy;
        if (distSq <= thresholdSq) {
          this.neighbors[i].push(j);
          this.neighbors[j].push(i);
          adjacency.set(`${i}-${j}`, distSq);
        }
      }
    }
  }

  draw() {
    const ctx = this.ctx;
    const width = this.width;
    const height = this.height;
    const particles = this.particles;
    const neighbors = this.neighbors;
    const red = this.config.redColor;

    ctx.clearRect(0, 0, width, height);

    ctx.lineWidth = 0.55;
    ctx.strokeStyle = hexToRgba(red, 0.18);

    const insideMask = new Array(this.particleCount);
    for (let i = 0; i < this.particleCount; i++) {
      insideMask[i] = this.isInsideContent(particles[i]);
    }

    for (let i = 0; i < this.particleCount; i++) {
      const pi = particles[i];
      const nb = neighbors[i];
      for (let n = 0; n < nb.length; n++) {
        const j = nb[n];
        if (j <= i) continue;
        const pj = particles[j];
        if (insideMask[i] || insideMask[j]) continue;
        ctx.beginPath();
        ctx.moveTo(pi.x, pi.y);
        ctx.lineTo(pj.x, pj.y);
        ctx.stroke();
      }
    }

    ctx.fillStyle = hexToRgba(red, 0.05);
    for (let i = 0; i < this.particleCount; i++) {
      const nb = neighbors[i];
      const len = nb.length;
      if (len < 2) continue;
      for (let a = 0; a < len; a++) {
        for (let b = a + 1; b < len; b++) {
          const j = nb[a];
          const k = nb[b];
          if (j <= i || k <= j) continue;
          if (!this.adjacency.has(`${Math.min(j, k)}-${Math.max(j, k)}`)) continue;
          if (insideMask[i] || insideMask[j] || insideMask[k]) continue;
          const p1 = particles[i];
          const p2 = particles[j];
          const p3 = particles[k];
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.lineTo(p3.x, p3.y);
          ctx.closePath();
          ctx.fill();
        }
      }
    }

    ctx.fillStyle = hexToRgba('#ffffff', 0.55);
    const size = this.config.particleSize;
    for (let i = 0; i < this.particleCount; i++) {
      const p = particles[i];
      if (insideMask[i]) continue;
      ctx.beginPath();
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  clearCanvas() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.width || 0, this.height || 0);
  }

  loop = () => {
    this.frameId = requestAnimationFrame(this.loop);
    const now = performance.now();
    if (now - this.lastRectUpdate > 400) {
      this.updateContentRect();
      this.lastRectUpdate = now;
    }
    this.updateParticles();
    this.buildGraph();
    this.draw();
  };

  start() {
    if (this.running || this.prefersReduced) return;
    this.running = true;
    this.loop();
  }

  stop() {
    if (!this.running) return;
    cancelAnimationFrame(this.frameId);
    this.frameId = null;
    this.running = false;
  }

  destroy() {
    this.stop();
    window.removeEventListener('resize', this._handleResize);
    window.removeEventListener('pointermove', this._handlePointerMove);
    window.removeEventListener('pointerdown', this._handlePointerDown);
    window.removeEventListener('pointerleave', this._handlePointerLeave);
    this.clearCanvas();
    this.particles = [];
    this.neighbors = [];
    this.adjacency.clear();
  }

  setConfig(newConfig = {}) {
    this.config = { ...this.config, ...newConfig };
    this.applyResponsiveConfig();
    this.createParticles();
    this.updateContentRect();
  }

  updateContentRect() {
    if (!this.contentElement) {
      this.contentRect = null;
      return;
    }
    const contentBox = this.contentElement.getBoundingClientRect();
    const containerBox = this.container.getBoundingClientRect();
    const padding = this.contentPadding;
    this.contentRect = {
      x: Math.max(0, contentBox.left - containerBox.left - padding),
      y: Math.max(0, contentBox.top - containerBox.top - padding),
      width: Math.min(containerBox.width, contentBox.width + padding * 2),
      height: Math.min(containerBox.height, contentBox.height + padding * 2)
    };
  }

  isInsideContent(point) {
    if (!this.contentRect) return false;
    const rect = this.contentRect;
    return point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height;
  }
}

function hexToRgba(hex, alpha) {
  const h = hex.replace('#', '');
  const bigint = parseInt(h.length === 3 ? h.repeat(2) : h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function initInteractiveBg(containerOrSelector, config = {}) {
  const container = typeof containerOrSelector === 'string'
    ? document.querySelector(containerOrSelector)
    : containerOrSelector;

  if (!container) {
    throw new Error('initInteractiveBg: container not found');
  }

  const instance = new InteractiveTriangles(container, config);
  if (!instance.prefersReduced) {
    instance.start();
  }

  return {
    start: () => instance.start(),
    stop: () => instance.stop(),
    destroy: () => instance.destroy(),
    setConfig: (cfg) => instance.setConfig(cfg)
  };
}

// Default config explanation for HypeRank integration
export const hypeRankDefaultConfig = {
  particleCount: 90,
  edgeThreshold: 130,
  mouseRadius: 150,
  particleSize: 1.8,
  maxSpeed: 0.32,
  redColor: '#ff3b3b'
};

/*
Performance tuning:
- Lower particleCount to improve FPS (e.g., 60 for mid-range laptops, 25 for mobile).
- edgeThreshold controls connection density; reducing it sparsifies triangles and lowers CPU usage.
*/
