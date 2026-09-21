/**
 * @file language-switcher.component.js
 * @description Language switcher UI component.
 * Part of Clean Architecture (Presentation Layer Component).
 */

window.Portfolio = window.Portfolio || {};
window.Portfolio.presentation = window.Portfolio.presentation || {};
window.Portfolio.presentation.components = window.Portfolio.presentation.components || {};

(function (exports) {
  "use strict";

  class LanguageSwitcherComponent {
    /**
     * Updates active styling on language buttons
     * @param {string} lang - 'en' or 'ar'
     */
    static setActiveButton(lang) {
      const enBtn = document.getElementById("lang-en-btn");
      const arBtn = document.getElementById("lang-ar-btn");
      if (enBtn) enBtn.classList.toggle("active", lang === "en");
      if (arBtn) arBtn.classList.toggle("active", lang === "ar");
    }

    /**
     * Initializes language switcher buttons and click listeners
     * @param {Object} options
     * @param {string} options.initialLang - Current language
     * @param {Function} options.onLanguageChange - Callback when user clicks a language button
     */
    static init({ initialLang = "en", onLanguageChange } = {}) {
      this.setActiveButton(initialLang);

      const enBtn = document.getElementById("lang-en-btn");
      const arBtn = document.getElementById("lang-ar-btn");

      if (enBtn) {
        enBtn.onclick = (e) => {
          e.preventDefault();
          this.setActiveButton("en");
          if (typeof onLanguageChange === "function") {
            onLanguageChange("en");
          }
        };
      }

      if (arBtn) {
        arBtn.onclick = (e) => {
          e.preventDefault();
          this.setActiveButton("ar");
          if (typeof onLanguageChange === "function") {
            onLanguageChange("ar");
          }
        };
      }
    }
  }

  exports.LanguageSwitcherComponent = LanguageSwitcherComponent;
})(window.Portfolio.presentation.components);
