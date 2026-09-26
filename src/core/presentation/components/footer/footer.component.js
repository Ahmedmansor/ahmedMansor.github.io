/**
 * @file footer.component.js
 * @description Universal Footer & Social Contact Dock UI component.
 * Part of Clean Architecture (Presentation Layer Component).
 */

window.Portfolio = window.Portfolio || {};
window.Portfolio.presentation = window.Portfolio.presentation || {};
window.Portfolio.presentation.components = window.Portfolio.presentation.components || {};

(function (exports) {
  "use strict";

  class FooterComponent {
    /**
     * Generates the universal footer contact dock HTML template
     * @returns {string}
     */
    static getTemplate() {
      return `
        <div class="footer-contact-container">
          <div class="footer-contact-header">
            <span class="contact-label" data-i18n-key="common.contactMe">Contact Me</span>
          </div>
          <div class="footer-neon-divider"></div>
          <div class="footer-social-icons">
            <a
              href="https://github.com/Ahmedmansor"
              target="_blank"
              class="footer-contact-btn github-btn"
              title="GitHub"
              aria-label="GitHub"
              data-sound-hover="ui-hover"
              data-sound-click="ui-click"
            >
              ${window.Icons ? window.Icons.github() : '<i class="fab fa-github"></i>'}
            </a>
            <a
              href="https://linkedin.com/in/ahmed-mansour-343716209"
              target="_blank"
              class="footer-contact-btn linkedin-btn"
              title="LinkedIn"
              aria-label="LinkedIn"
              data-sound-hover="ui-hover"
              data-sound-click="ui-click"
            >
              ${window.Icons ? window.Icons.linkedin() : '<i class="fab fa-linkedin"></i>'}
            </a>
            <a
              href="mailto:ahmedmansour70000@gmail.com"
              class="footer-contact-btn email-btn"
              title="Gmail: ahmedmansour70000@gmail.com"
              aria-label="Gmail"
              data-sound-hover="ui-hover"
              data-sound-click="ui-click"
            >
              ${window.Icons ? window.Icons.envelope() : '<i class="fas fa-envelope"></i>'}
            </a>
            <a
              href="https://wa.me/201000872150"
              target="_blank"
              class="footer-contact-btn whatsapp-btn"
              title="WhatsApp: +201000872150"
              aria-label="WhatsApp"
              data-sound-hover="ui-hover"
              data-sound-click="ui-click"
            >
              ${window.Icons ? window.Icons.whatsapp() : '<i class="fab fa-whatsapp"></i>'}
            </a>
          </div>
        </div>
      `;
    }

    /**
     * Injects and initializes the footer into target container
     * @param {string|HTMLElement} [target="#footer-container"]
     */
    static init(target = "#footer-container") {
      const container = typeof target === "string" ? document.querySelector(target) : target;
      if (!container) return;
      container.innerHTML = this.getTemplate();
    }
  }

  // Auto-init when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => FooterComponent.init());
  } else {
    FooterComponent.init();
  }

  exports.FooterComponent = FooterComponent;
})(window.Portfolio.presentation.components);
