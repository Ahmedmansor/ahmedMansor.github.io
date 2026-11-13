window.Portfolio = window.Portfolio || {};
window.Portfolio.presentation = window.Portfolio.presentation || {};
window.Portfolio.presentation.components = window.Portfolio.presentation.components || {};

(function (exports) {
  "use strict";

  const presets = {
    light: { counts: [23, 9, 3], dpr: 1, fps: 30 },
    balanced: { counts: [40, 16, 5], dpr: 1.5, fps: 30 },
    full: { counts: [140, 55, 25], dpr: 2, fps: 60 }
  };
  const colors = ["#fff", "#f0f8ff", "#e1f8ff"];

  class SpaceHeroComponent {
    init() {
      this.stage = document.getElementById("space-hero-stage");
      this.canvas = document.getElementById("space-stars-canvas");
      if (!this.stage || !this.canvas) return;
      this.ctx = this.canvas.getContext("2d");
      if (!this.ctx) return;

      this.motion = matchMedia("(prefers-reduced-motion: reduce)");
      this.finePointer = matchMedia("(hover: hover) and (pointer: fine)");
      const bounds = this.stage.getBoundingClientRect();
      this.isVisible = bounds.bottom > 0 && bounds.top < window.innerHeight;
      this.needsResize = true;
      this.mouseX = this.mouseY = this.targetX = this.targetY = 0;
      this.onFrame = (now) => this.frame(now);
      this.onVisibility = () => this.sync();
      this.onQuality = () => {
        this.needsResize = true;
        this.sync();
      };
      this.onResize = () => {
        clearTimeout(this.resizeTimer);
        this.resizeTimer = setTimeout(this.onQuality, 150);
      };
      this.onPointer = (event) => {
        this.targetX = 2 * event.clientX / window.innerWidth - 1;
        this.targetY = 2 * event.clientY / window.innerHeight - 1;
      };

      window.addEventListener("resize", this.onResize, { passive: true });
      window.addEventListener("portfolio-effects-change", this.onQuality);
      document.addEventListener("visibilitychange", this.onVisibility);
      this.motion.addEventListener("change", this.onQuality);

      if (window.IntersectionObserver) {
        this.observer = new IntersectionObserver(([entry]) => {
          this.isVisible = entry.isIntersecting;
          this.sync();
        });
        this.observer.observe(this.stage);
      }
      this.sync();
    }

    resize() {
      const { width, height } = this.stage.getBoundingClientRect();
      const quality = document.documentElement.dataset.effectsQuality;
      const preset = this.motion.matches ? presets.light : presets[quality] || presets.full;
      const dpr = Math.min(window.devicePixelRatio || 1, preset.dpr);
      this.width = width;
      this.height = height;
      this.interval = 1000 / preset.fps;
      this.canvas.width = Math.floor(width * dpr);
      this.canvas.height = Math.floor(height * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const counts = preset === presets.full && width < 768 ? [45, 18, 7] : preset.counts;
      this.stars = counts.flatMap((count, layer) => Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 0.5 + layer * 0.6 + Math.random() * 0.8,
        speed: 0.08 + layer * 0.1 + Math.random() * 0.15,
        alpha: 0.35 + layer * 0.13 + Math.random() * 0.27,
        phase: Math.random() * Math.PI * 2,
        layer
      })));
      this.needsResize = false;
    }

    sync() {
      if (document.hidden || !this.isVisible) {
        this.stop();
        return;
      }
      if (this.needsResize) {
        this.resize();
        this.draw(0);
      }
      if (this.motion.matches) {
        this.stop();
        return;
      }
      if (this.frameId) return;
      if (this.finePointer.matches) {
        window.addEventListener("pointermove", this.onPointer, { passive: true });
      }
      this.lastFrame = this.lastDraw = this.nextDraw = 0;
      this.samples = this.slowFrames = 0;
      this.lastScrollY = window.scrollY;
      this.lastScroll = -Infinity;
      this.frameId = requestAnimationFrame(this.onFrame);
    }

    stop() {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
      window.removeEventListener("pointermove", this.onPointer);
    }

    destroy() {
      if (!this.onVisibility) return;
      this.stop();
      clearTimeout(this.resizeTimer);
      this.observer?.disconnect();
      window.removeEventListener("resize", this.onResize);
      window.removeEventListener("portfolio-effects-change", this.onQuality);
      document.removeEventListener("visibilitychange", this.onVisibility);
      this.motion.removeEventListener("change", this.onQuality);
    }

    frame(now) {
      this.frameId = requestAnimationFrame(this.onFrame);
      if (window.scrollY !== this.lastScrollY) {
        this.lastScrollY = window.scrollY;
        this.lastScroll = now;
      }

      // Sample delivered browser frames during scrolling, independently of the canvas draw cap.
      const frameTime = now - this.lastFrame;
      if (now - this.lastScroll > 250 || frameTime > 250) {
        this.samples = this.slowFrames = 0;
      } else if (this.lastFrame && document.documentElement.dataset.effectsQuality !== "light") {
        this.samples++;
        if (frameTime > 25) this.slowFrames++;
        if (this.samples >= 36) {
          if (this.slowFrames >= 10) window.PortfolioEffects?.lowerQuality();
          this.samples = this.slowFrames = 0;
        }
      }
      this.lastFrame = now;

      if (now + 0.5 < this.nextDraw) return;
      const elapsed = this.lastDraw ? Math.min(now - this.lastDraw, 64) : 0;
      this.nextDraw = Math.max((this.nextDraw || now) + this.interval, now + 1);
      this.lastDraw = now;
      this.draw(elapsed / (1000 / 60));
    }

    draw(step) {
      const { ctx, width, height } = this;
      const ease = 1 - Math.pow(0.94, step);
      this.mouseX += (this.targetX - this.mouseX) * ease;
      this.mouseY += (this.targetY - this.mouseY) * ease;
      ctx.clearRect(0, 0, width, height);

      let lastLayer = -1;
      for (const star of this.stars) {
        const { layer } = star;
        if (layer !== lastLayer) {
          ctx.fillStyle = colors[layer];
          lastLayer = layer;
        }
        star.y -= star.speed * step;
        if (star.y < -5) {
          star.y = height + 5;
          star.x = Math.random() * width;
        }
        star.phase += 0.012 * (layer + 1) * step;
        ctx.globalAlpha = Math.min(1, star.alpha + Math.sin(star.phase) * 0.2);
        const depth = (layer + 1) * 7;
        ctx.beginPath();
        ctx.arc(star.x + this.mouseX * depth, star.y + this.mouseY * depth, star.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  }

  exports.SpaceHeroComponent = SpaceHeroComponent;
})(window.Portfolio.presentation.components);
