/**
 * @file language.repository.js
 * @description Repository coordinating language preferences and translation dictionaries.
 * Part of Clean Architecture (Data Layer Repository).
 */

window.Portfolio = window.Portfolio || {};
window.Portfolio.data = window.Portfolio.data || {};
window.Portfolio.data.repositories = window.Portfolio.data.repositories || {};

(function (exports) {
  "use strict";

  const StorageDataSource = window.Portfolio.data.datasources.StorageDataSource;
  const LanguageDataSource = window.Portfolio.data.datasources.LanguageDataSource;

  class LanguageRepository {
    /**
     * Retrieves currently active language
     * @returns {string}
     */
    static getActiveLanguage() {
      return StorageDataSource.getLanguage();
    }

    /**
     * Loads dictionary for requested language and updates persistent storage
     * @param {string} lang
     * @returns {Promise<Object>}
     */
    static async loadLanguage(lang) {
      StorageDataSource.setLanguage(lang);
      const translations = await LanguageDataSource.loadLanguage(lang);
      return translations;
    }
  }

  exports.LanguageRepository = LanguageRepository;
})(window.Portfolio.data.repositories);
