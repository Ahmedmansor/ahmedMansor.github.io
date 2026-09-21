/**
 * @file language.datasource.js
 * @description Dynamic script loader for localization dictionary files (lang/en.js, lang/ar.js).
 * Part of Clean Architecture (Data Layer DataSource).
 */

window.Portfolio = window.Portfolio || {};
window.Portfolio.data = window.Portfolio.data || {};
window.Portfolio.data.datasources = window.Portfolio.data.datasources || {};

(function (exports) {
  "use strict";

  class LanguageDataSource {
    /**
     * Dynamically loads language file via script tag and resolves with global translations object
     * @param {string} lang - 'en' or 'ar'
     * @returns {Promise<Object>}
     */
    static loadLanguage(lang) {
      return new Promise((resolve, reject) => {
        const oldScript = document.getElementById("lang-script");
        if (oldScript) {
          oldScript.remove();
        }

        const script = document.createElement("script");
        script.id = "lang-script";
        script.src = `lang/${lang}.js`;

        script.onload = () => {
          if (typeof window.translations !== "undefined") {
            resolve(window.translations);
          } else {
            resolve({});
          }
        };

        script.onerror = (err) => {
          console.error(`Failed to load language file: ${script.src}`, err);
          reject(err);
        };

        document.head.appendChild(script);
      });
    }
  }

  exports.LanguageDataSource = LanguageDataSource;
})(window.Portfolio.data.datasources);
