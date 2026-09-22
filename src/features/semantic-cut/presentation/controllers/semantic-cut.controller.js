/**
 * @file semantic-cut.controller.js
 * @description Page Controller for the SemanticCut AI Project Details Page (semantic-cut.html).
 * Part of Clean Architecture (Presentation Layer Controller).
 */

window.Portfolio = window.Portfolio || {};
window.Portfolio.presentation = window.Portfolio.presentation || {};
window.Portfolio.presentation.controllers = window.Portfolio.presentation.controllers || {};

(function (exports) {
  "use strict";

  const LanguageRepository = window.Portfolio.data.repositories.LanguageRepository;
  const LocalizationUseCase = window.Portfolio.domain.usecases.LocalizationUseCase;
  const AppbarComponent = window.Portfolio.presentation.components.AppbarComponent;
  const LanguageSwitcherComponent = window.Portfolio.presentation.components.LanguageSwitcherComponent;
  const FooterComponent = window.Portfolio.presentation.components.FooterComponent;

  class SemanticCutController {
    /**
     * Initializes the SemanticCut detail page
     */
    static async init() {
      const activeLang = LanguageRepository.getActiveLanguage();

      // Initialize universal Floating App Bar
      if (AppbarComponent) {
        AppbarComponent.init("#appbar-container");
      }

      LanguageSwitcherComponent.init({
        initialLang: activeLang,
        onLanguageChange: (lang) => this.switchLanguage(lang)
      });

      // Initialize universal Footer & Social Contact Dock
      if (FooterComponent) {
        FooterComponent.init("#footer-container");
      }

      await this.switchLanguage(activeLang);
    }

    /**
     * Switches language and re-renders text
     * @param {string} lang
     */
    static async switchLanguage(lang) {
      try {
        const translations = await LanguageRepository.loadLanguage(lang);
        LocalizationUseCase.translateDOM(translations, "semanticcut-page");
      } catch (err) {
        console.error("Failed to load SemanticCut page language:", err);
      }
    }
  }

  exports.SemanticCutController = SemanticCutController;
})(window.Portfolio.presentation.controllers);
