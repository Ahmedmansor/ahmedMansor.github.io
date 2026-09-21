/**
 * @file storage.datasource.js
 * @description LocalStorage data source for user preferences (selected language).
 * Part of Clean Architecture (Data Layer DataSource).
 */

window.Portfolio = window.Portfolio || {};
window.Portfolio.data = window.Portfolio.data || {};
window.Portfolio.data.datasources = window.Portfolio.data.datasources || {};

(function (exports) {
  "use strict";

  const STORAGE_KEYS = {
    LANGUAGE: "lang"
  };

  class StorageDataSource {
    /**
     * Reads saved language preference from localStorage
     * @param {string} [defaultLang="en"]
     * @returns {string} 'en' or 'ar'
     */
    static getLanguage(defaultLang = "en") {
      try {
        return localStorage.getItem(STORAGE_KEYS.LANGUAGE) || defaultLang;
      } catch (e) {
        console.warn("localStorage access denied:", e);
        return defaultLang;
      }
    }

    /**
     * Persists language preference to localStorage
     * @param {string} lang
     */
    static setLanguage(lang) {
      try {
        localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
      } catch (e) {
        console.warn("localStorage save failed:", e);
      }
    }
  }

  exports.StorageDataSource = StorageDataSource;
})(window.Portfolio.data.datasources);
