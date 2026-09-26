/**
 * @file appbar.component.js
 * @description Universal Floating Capsule App Bar UI component with Cyberpunk Audio Controller.
 * Part of Clean Architecture (Presentation Layer Component).
 */

window.Portfolio = window.Portfolio || {};
window.Portfolio.presentation = window.Portfolio.presentation || {};
window.Portfolio.presentation.components = window.Portfolio.presentation.components || {};

(function (exports) {
  "use strict";

  class AppbarComponent {
    /**
     * Generates universal App Bar HTML template
     * @returns {string}
     */
    static getTemplate() {
      const isHome = document.body && (document.body.id === "home-page" || document.body.id === "index-page");
      const projectsHref = isHome ? "#projects-carousel-section" : "index.html#projects-carousel-section";
      const activeClass = !isHome ? "active" : "";

      return `
        <div class="appbar-inner">
          <a href="index.html" class="appbar-brand" title="Home" data-sound-click="ui-click" data-sound-hover="ui-hover">
            <span class="hud-status-dot" aria-hidden="true"></span>
            <span class="brand-tag">&lt;</span><span class="brand-name">ahmedMansour</span><span class="brand-tag"> /&gt;</span>
          </a>
          <nav class="appbar-nav">
            <a href="${projectsHref}" class="appbar-link ${activeClass}" data-i18n-key="common.navProjects" data-sound-click="ui-click" data-sound-hover="ui-hover">Projects</a>
          </nav>
          <div class="appbar-actions">
            <!-- Cyber Audio Controller (Mute / Unmute Toggle) -->
            <button id="audio-toggle-btn" class="appbar-audio-btn" type="button" aria-label="Toggle Audio" title="Toggle Audio (Mute/Unmute)">
              <span class="audio-btn-icon" id="audio-btn-icon"></span>
              <span class="audio-wave-bars" aria-hidden="true">
                <span class="bar bar-1"></span>
                <span class="bar bar-2"></span>
                <span class="bar bar-3"></span>
              </span>
            </button>
            <div class="language-switcher">
              <button id="lang-en-btn" data-sound-click="ui-click" data-sound-hover="ui-hover">English</button>
              <button id="lang-ar-btn" data-sound-click="ui-click" data-sound-hover="ui-hover">العربية</button>
            </div>
          </div>
        </div>
      `;
    }

    /**
     * Updates Audio Toggle button icon and animated wave state
     * @param {boolean} isMuted
     */
    static updateAudioButtonUI(isMuted) {
      const btn = document.getElementById("audio-toggle-btn");
      const iconSpan = document.getElementById("audio-btn-icon");
      if (!btn) return;

      btn.classList.toggle("is-muted", isMuted);
      btn.setAttribute("aria-pressed", isMuted ? "false" : "true");
      btn.setAttribute("title", isMuted ? "Unmute Audio FX" : "Mute Audio FX");

      if (iconSpan) {
        const iconName = isMuted ? "volumeXmark" : "volumeHigh";
        if (window.Icons && typeof window.Icons.get === "function") {
          iconSpan.innerHTML = window.Icons.get(iconName);
        } else {
          // Fallback SVG if Icons registry is still loading
          iconSpan.innerHTML = isMuted
            ? '<svg class="app-icon" viewBox="0 0 640 512" fill="currentColor"><path d="M380 448c-12.7 0-24.9-5.1-33.9-14.1L217.9 306 144 306c-26.5 0-48-21.5-48-48l0-64c0-26.5 21.5-48 48-48l73.9 0 128.1-127.9C355.1 8.9 367.3 3.8 380 3.8c24.3 0 44 19.7 44 44l0 356.3c0 24.3-19.7 44-44 44zM497 199l35-35c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-35 35 35 35c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-35-35-35 35c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l35-35-35-35c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l35 35z"/></svg>'
            : '<svg class="app-icon" viewBox="0 0 640 512" fill="currentColor"><path d="M533.6 32.5C598.5 85.3 640 165.8 640 256s-41.5 170.7-106.4 223.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C557.5 398.2 592 331.2 592 256s-34.5-142.2-88.7-186.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM473.1 107c6.1-12 20.8-16.8 32.8-10.7 48.2 24.4 82.1 74.5 82.1 132.3s-33.9 107.9-82.1 132.3c-12 6.1-26.7 1.3-32.8-10.7s-1.3-26.7 10.7-32.8C520.1 308.8 544 272.7 544 256s-23.9-52.8-60.2-71.2c-12-6.1-16.8-20.8-10.7-32.8zM380 448c-12.7 0-24.9-5.1-33.9-14.1L217.9 306 144 306c-26.5 0-48-21.5-48-48l0-64c0-26.5 21.5-48 48-48l73.9 0 128.1-127.9C355.1 8.9 367.3 3.8 380 3.8c24.3 0 44 19.7 44 44l0 356.3c0 24.3-19.7 44-44 44z"/></svg>';
        }
      }
    }

    /**
     * Binds Audio Toggle button listeners and synchronizes with AudioService
     */
    static setupAudioControls() {
      const AudioService =
        window.AudioService ||
        (window.Portfolio &&
          window.Portfolio.data &&
          window.Portfolio.data.datasources &&
          window.Portfolio.data.datasources.AudioService);

      const audioBtn = document.getElementById("audio-toggle-btn");
      if (!audioBtn) return;

      const refreshUI = () => {
        const isMuted = AudioService ? AudioService.isMuted() : false;
        this.updateAudioButtonUI(isMuted);
      };

      refreshUI();

      if (AudioService && typeof AudioService.addMuteListener === "function") {
        AudioService.addMuteListener((isMuted) => {
          this.updateAudioButtonUI(isMuted);
        });
      }

      if (!audioBtn.dataset.hasClickListener) {
        audioBtn.dataset.hasClickListener = "true";
        audioBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (AudioService) {
            AudioService.toggleMute();
          }
        });
      }
    }

    /**
     * Injects the App Bar into target container and binds controls
     * @param {string|HTMLElement} [target="#appbar-container"]
     */
    static init(target = "#appbar-container") {
      const container = typeof target === "string" ? document.querySelector(target) : target;
      if (!container) return;

      container.classList.add("appbar");
      // Always re-render to ensure audio toggle button is present (sub-pages may have hardcoded markup)
      container.innerHTML = this.getTemplate();

      // Initialize audio controls
      this.setupAudioControls();
      container.dataset.initialized = "true";
    }
  }

  // Auto-init if container exists
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => AppbarComponent.init());
  } else {
    AppbarComponent.init();
  }

  exports.AppbarComponent = AppbarComponent;
})(window.Portfolio.presentation.components);
