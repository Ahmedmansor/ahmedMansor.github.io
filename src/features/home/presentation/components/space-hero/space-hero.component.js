/**
 * @file space-hero.component.js
 * @description High-Performance Canvas Starfield & Gravity Space Hero Component.
 * Implements 3-layer parallax star drift, interactive mouse tilt, and auto-pause on scroll.
 * Part of Clean Architecture (Presentation Layer Component).
 */

window.Portfolio = window.Portfolio || {};
window.Portfolio.presentation = window.Portfolio.presentation || {};
window.Portfolio.presentation.components = window.Portfolio.presentation.components || {};

(function (exports) {
  "use strict";

  class SpaceHeroComponent {
    constructor() {
      this.canvas = null;
      this.ctx = null;
      this.stage = null;
      this.horizon = null;
      this.stars = [];
      this.animationFrameId = null;
      this.isRunning = false;
      this.isVisible = true;

      // Mouse parallax state
      this.mouseX = 0;
      this.mouseY = 0;
      this.targetMouseX = 0;
      this.targetMouseY = 0;

      // Star layer counts (optimized for 60fps)
      this.smallCount = 140;
      this.mediumCount = 55;
      this.bigCount = 25;
    }

    /**
     * Initializes the Space Hero Canvas and interaction listeners
     */
    init() {
      this.stage = document.getElementById("space-hero-stage");
      this.canvas = document.getElementById("space-stars-canvas");
      this.horizon = document.getElementById("space-horizon");
      this.earth = document.getElementById("earth-sphere");

      if (!this.stage || !this.canvas) return;

      this.ctx = this.canvas.getContext("2d", { alpha: true });
      this.resize();
      this.initStars();
      this.setupEventListeners();
      this.setupIntersectionObserver();
      this.start();
    }

    /**
     * Resizes canvas to match container with High-DPI support
     */
    resize() {
      if (!this.canvas || !this.stage) return;
      const rect = this.stage.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      this.width = rect.width;
      this.height = rect.height;

      this.canvas.width = this.width * dpr;
      this.canvas.height = this.height * dpr;
      this.canvas.style.width = `${this.width}px`;
      this.canvas.style.height = `${this.height}px`;

      if (this.ctx) {
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    }

    /**
     * Spawns multi-depth stars
     */
    initStars() {
      this.stars = [];
      const totalStars = this.smallCount + this.mediumCount + this.bigCount;

      for (let i = 0; i < totalStars; i++) {
        let layer, radius, speed, alpha, twinkleSpeed;

        if (i < this.smallCount) {
          layer = 1;
          radius = Math.random() * 0.8 + 0.5;
          speed = Math.random() * 0.15 + 0.08;
          alpha = Math.random() * 0.4 + 0.3;
          twinkleSpeed = 0.01;
        } else if (i < this.smallCount + this.mediumCount) {
          layer = 2;
          radius = Math.random() * 0.9 + 1.1;
          speed = Math.random() * 0.3 + 0.18;
          alpha = Math.random() * 0.5 + 0.5;
          twinkleSpeed = 0.02;
        } else {
          layer = 3;
          radius = Math.random() * 1.2 + 1.8;
          speed = Math.random() * 0.45 + 0.28;
          alpha = Math.random() * 0.4 + 0.6;
          twinkleSpeed = 0.035;
        }

        this.stars.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          radius,
          speed,
          alpha,
          baseAlpha: alpha,
          twinkleSpeed,
          twinklePhase: Math.random() * Math.PI * 2,
          layer
        });
      }
    }

    /**
     * Mouse move parallax and window resize
     */
    setupEventListeners() {
      window.addEventListener("resize", () => {
        this.resize();
        this.initStars();
      }, { passive: true });

      // Window-wide subtle mouse parallax on desktop
      window.addEventListener("mousemove", (e) => {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        // Normalized between -1 and 1
        this.targetMouseX = (e.clientX - cx) / cx;
        this.targetMouseY = (e.clientY - cy) / cy;
      }, { passive: true });
    }

    /**
     * Auto-pause canvas loop when scrolled out of viewport
     */
    setupIntersectionObserver() {
      if (!window.IntersectionObserver || !this.stage) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            this.isVisible = entry.isIntersecting;
            if (this.isVisible) {
              this.start();
            } else {
              this.stop();
            }
          });
        },
        { threshold: 0.05 }
      );

      observer.observe(this.stage);
    }

    start() {
      if (this.isRunning) return;
      this.isRunning = true;
      this.loop();
    }

    stop() {
      this.isRunning = false;
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
    }

    /**
     * Main rendering loop (smooth 60fps)
     */
    loop() {
      if (!this.isRunning) return;

      // Smooth lerp mouse interpolation
      this.mouseX += (this.targetMouseX - this.mouseX) * 0.06;
      this.mouseY += (this.targetMouseY - this.mouseY) * 0.06;

      // Parallax tilt on Horizon element
      if (this.horizon) {
        const tiltX = this.mouseX * 12;
        const tiltY = this.mouseY * 8;
        this.horizon.style.transform = `translateX(calc(-50% + ${tiltX}px)) translateY(${tiltY}px)`;
      }

      // Parallax tilt on Earth sphere (multiplane depth parallax)
      if (this.earth) {
        const tiltX = this.mouseX * 6;
        const tiltY = this.mouseY * 4;
        this.earth.style.transform = `translateX(calc(-50% + ${tiltX}px)) translateY(${tiltY}px)`;
      }

      this.ctx.clearRect(0, 0, this.width, this.height);

      for (let i = 0; i < this.stars.length; i++) {
        const star = this.stars[i];

        // Move upward like original CodePen animStar
        star.y -= star.speed;
        if (star.y < -5) {
          star.y = this.height + 5;
          star.x = Math.random() * this.width;
        }

        // Twinkle
        star.twinklePhase += star.twinkleSpeed;
        const twinkleFactor = Math.sin(star.twinklePhase) * 0.25;
        const currentAlpha = Math.max(0.1, Math.min(1, star.baseAlpha + twinkleFactor));

        // Depth parallax offset from mouse
        const depthFactor = star.layer * 6;
        const drawX = star.x + this.mouseX * depthFactor;
        const drawY = star.y + this.mouseY * depthFactor;

        this.ctx.beginPath();
        this.ctx.arc(drawX, drawY, star.radius, 0, Math.PI * 2);

        if (star.layer === 3) {
          // Subtle celestial blue/white glow for big stars
          this.ctx.fillStyle = `rgba(215, 245, 255, ${currentAlpha})`;
          this.ctx.shadowColor = "rgba(0, 229, 255, 0.6)";
          this.ctx.shadowBlur = 4;
        } else {
          this.ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha})`;
          this.ctx.shadowBlur = 0;
        }

        this.ctx.fill();
      }

      this.animationFrameId = requestAnimationFrame(() => this.loop());
    }
  }

  exports.SpaceHeroComponent = SpaceHeroComponent;
})(window.Portfolio.presentation.components);
