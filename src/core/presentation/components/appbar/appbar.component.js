/**
 * @file appbar.component.js
 * @description Universal Floating Capsule App Bar UI component.
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
          <a href="index.html" class="appbar-brand" title="Home">
            <span class="hud-status-dot" aria-hidden="true"></span>
            <span class="brand-tag">&lt;</span><span class="brand-name">ahmedMansour</span><span class="brand-tag"> /&gt;</span>
          </a>
          <nav class="appbar-nav">
            <a href="${projectsHref}" class="appbar-link ${activeClass}" data-i18n-key="common.navProjects">Projects</a>
          </nav>
          <div class="appbar-actions">
            <div class="language-switcher">
              <button id="lang-en-btn">English</button>
              <button id="lang-ar-btn">العربية</button>
            </div>
          </div>
        </div>
      `;
    }

    /**
     * Injects the App Bar into target container
     * @param {string|HTMLElement} [target="#appbar-container"]
     */
    static init(target = "#appbar-container") {
      const container = typeof target === "string" ? document.querySelector(target) : target;
      if (!container || container.dataset.initialized === "true") return;
      container.dataset.initialized = "true";
      container.classList.add("appbar");
      container.innerHTML = this.getTemplate();
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
