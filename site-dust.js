const DEFAULT_DUST_CONFIG = {
  particleCount: 90,
  color: 'rgba(255, 60, 60, 0.08)',
  maxSize: 1.8,
  minSize: 0.6,
  maxSpeed: 0.12,
  twinkleChance: 0.005,
  reducedMotion: false
};

const RM_QUERY = window.matchMedia('(prefers-reduced-motion: reduce)');

class DustField {
  constructor(container, config = {}) {
    this.container = container;
    this.canvas = document.createElement('canvas');
    this.canvas.setAttribute('aria-hidden', 'true');
    container.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d');
    this.config = { ...DEFAULT_DUST_CONFIG, ...config };
    this.dpr = window.devicePixelRatio || 1;
    this.particles = [];
    this.running = false;
    this.frameId = null;
    this.resizeTimeout = null;

    this.handleResize = this.handleResize.bind(this);
    this.loop = this.loop.bind(this);

    this.updateReducedMotion();
    this.handleResize();
    window.addEventListener('resize', this.handleResize);
    RM_QUERY.addEventListener('change', () => this.updateReducedMotion());
  }

  updateReducedMotion() {
    this.prefersReduced = this.config.reducedMotion || RM_QUERY.matches;
    if (this.prefersReduced) {
      this.stop();
      this.clear();
      this.canvas.style.display = 'none';
    } else {
      this.canvas.style.display = 'block';
      if (!this.running) this.start();
    }
  }

  handleResize() {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      const rect = this.container.getBoundingClientRect();
      this.width = rect.width;
      this.height = rect.height;
      const dpr = window.devicePixelRatio || 1;
      if (dpr !== this.dpr) this.dpr = dpr;
      this.canvas.width = Math.round(this.width * this.dpr);
      this.canvas.height = Math.round(this.height * this.dpr);
      this.canvas.style.width = `${this.width}px`;
      this.canvas.style.height = `${this.height}px`;
      this.ctx.scale(this.dpr, this.dpr);
      this.createParticles();
    }, 100);
  }

  createParticles() {
    const count = this.config.particleCount;
    this.particles.length = count;
    for (let i = 0; i < count; i++) {
      this.particles[i] = this.generateParticle();
    }
  }

  generateParticle() {
    return {
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      vx: (Math.random() - 0.5) * this.config.maxSpeed,
      vy: (Math.random() - 0.5) * this.config.maxSpeed,
      size: lerp(this.config.minSize, this.config.maxSize, Math.random()),
      opacity: Math.random() * 0.5 + 0.2,
      twinkle: Math.random() < this.config.twinkleChance,
      twinklePhase: Math.random() * Math.PI * 2
    };
  }

  updateParticles() {
    const w = this.width;
    const h = this.height;
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -20 || p.x > w + 20 || p.y < -20 || p.y > h + 20) {
        this.particles[i] = this.generateParticle();
        continue;
      }

      if (p.twinkle) {
        p.twinklePhase += 0.02;
        p.opacity = 0.2 + Math.abs(Math.sin(p.twinklePhase)) * 0.35;
      }
    }
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.fillStyle = this.config.color;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      ctx.globalAlpha = p.opacity;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  loop() {
    this.frameId = requestAnimationFrame(this.loop);
    this.updateParticles();
    this.draw();
  }

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

  clear() {
    this.ctx && this.ctx.clearRect(0, 0, this.width || 0, this.height || 0);
  }

  destroy() {
    this.stop();
    window.removeEventListener('resize', this.handleResize);
    this.container.removeChild(this.canvas);
    this.particles = [];
  }

  setConfig(cfg = {}) {
    this.config = { ...this.config, ...cfg };
    this.createParticles();
  }
}

function lerp(min, max, t) {
  return min + (max - min) * t;
}

export default function initSiteDust(containerSelector = 'body', config = {}) {
  const container = document.querySelector(containerSelector);
  if (!container) throw new Error('initSiteDust: container not found');

  let host = document.querySelector('.site-dust');
  if (!host) {
    host = document.createElement('div');
    host.className = 'site-dust';
    document.body.appendChild(host);
  }

  const instance = new DustField(host, config);
  if (!instance.prefersReduced) instance.start();

  return {
    start: () => instance.start(),
    stop: () => instance.stop(),
    destroy: () => instance.destroy(),
    setConfig: (cfg) => instance.setConfig(cfg)
  };
}

export const hypeRankDustConfig = {
  particleCount: 90,
  color: 'rgba(255, 60, 60, 0.08)',
  maxSize: 1.6,
  minSize: 0.6,
  maxSpeed: 0.1,
  twinkleChance: 0.01
};
