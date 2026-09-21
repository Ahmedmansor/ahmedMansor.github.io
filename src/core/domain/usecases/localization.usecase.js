/**
 * @file localization.usecase.js
 * @description Core localization logic, DOM translation, direction updates, and key resolution.
 * Part of Clean Architecture (Domain Layer Use Case).
 */

window.Portfolio = window.Portfolio || {};
window.Portfolio.domain = window.Portfolio.domain || {};
window.Portfolio.domain.usecases = window.Portfolio.domain.usecases || {};

(function (exports) {
  "use strict";

  class LocalizationUseCase {
    /**
     * Resolves the translation sub-tree corresponding to the active page
     * @param {string} pageId - document.body.id
     * @param {Object} translations - Entire translation dictionary
     * @returns {Object} Page-specific dictionary
     */
    static getPageTranslations(pageId, translations) {
      if (!translations) return {};

      if (pageId === "home-page" || pageId === "index-page") {
        return translations.homePage || translations.indexPage || {};
      }
      if (pageId === "project1-page") {
        return translations.project1Page || {};
      }
      if (pageId === "semanticcut-page") {
        return translations.semanticCutPage || {};
      }
      return translations[pageId] || {};
    }

    /**
     * Updates document language and text direction attributes
     * @param {string} lang - 'en' or 'ar'
     */
    static updateDocumentDirection(lang) {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    }

    /**
     * Translates all DOM nodes containing [data-i18n-key]
     * @param {Object} translations - Active translation dictionary
     * @param {string} [pageId] - Optional pageId override
     * @returns {Object} { pageTranslations, commonTranslations }
     */
    static translateDOM(translations, pageId = document.body.id) {
      if (!translations || Object.keys(translations).length === 0) {
        return { pageTranslations: {}, commonTranslations: {} };
      }

      const currentLang = localStorage.getItem("lang") || "en";
      this.updateDocumentDirection(currentLang);

      const pageTranslations = this.getPageTranslations(pageId, translations);
      const common = translations.common || {};

      document.querySelectorAll("[data-i18n-key]").forEach((element) => {
        const rawKey = element.getAttribute("data-i18n-key");
        if (!rawKey) return;

        let value;
        if (rawKey.startsWith("common.")) {
          const key = rawKey.replace("common.", "");
          value = common[key];
        } else {
          const cleanKey = rawKey
            .replace("homePage.", "")
            .replace("indexPage.", "")
            .replace("project1Page.", "")
            .replace("semanticCutPage.", "");

          value = cleanKey
            .split(".")
            .reduce(
              (obj, k) => (obj && obj[k] !== undefined ? obj[k] : undefined),
              pageTranslations
            );

          if (value === undefined && common[cleanKey] !== undefined) {
            value = common[cleanKey];
          }
        }

        if (value !== undefined) {
          element.innerHTML = value;
        }
      });

      return { pageTranslations, commonTranslations: common };
    }
  }

  exports.LocalizationUseCase = LocalizationUseCase;
})(window.Portfolio.domain.usecases);
