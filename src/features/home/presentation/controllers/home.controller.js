/**
 * @file home.controller.js
 * @description Page Controller for the Home Landing Page (index.html).
 * Part of Clean Architecture (Presentation Layer Controller).
 */

window.Portfolio = window.Portfolio || {};
window.Portfolio.presentation = window.Portfolio.presentation || {};
window.Portfolio.presentation.controllers = window.Portfolio.presentation.controllers || {};

(function (exports) {
  "use strict";

  const LanguageRepository = window.Portfolio.data.repositories.LanguageRepository;
  const LocalizationUseCase = window.Portfolio.domain.usecases.LocalizationUseCase;
  const LanguageSwitcherComponent = window.Portfolio.presentation.components.LanguageSwitcherComponent;
  const CarouselController = window.Portfolio.presentation.controllers.CarouselController;

  class HomeController {
    /**
     * Initializes the Home page
     */
    static async init() {
      const activeLang = LanguageRepository.getActiveLanguage();

      // Initialize switcher UI
      LanguageSwitcherComponent.init({
        initialLang: activeLang,
        onLanguageChange: (lang) => this.switchLanguage(lang)
      });

      // Initialize Smart Floating App Bar auto-hide on carousel immersion
      this.setupSmartAppBar();

      // Setup smooth navigation to projects
      this.setupProjectsNavLink();

      // Load initial language
      await this.switchLanguage(activeLang);

      // Handle direct landing with hash (#projects-carousel-section)
      this.handleHashNavigation();
    }

    /**
     * Intercepts clicks on the Projects nav link while on Home page
     * to smoothly scroll directly to the 3D Carousel start.
     */
    static setupProjectsNavLink() {
      const projectsLink = document.querySelector('.appbar-link[href*="projects-carousel-section"]');
      if (projectsLink) {
        projectsLink.addEventListener("click", (e) => {
          e.preventDefault();
          CarouselController.scrollToCarousel(0);
          if (window.location.hash !== "#projects-carousel-section") {
            history.pushState(null, "", "#projects-carousel-section");
          }
        });
      }

      window.addEventListener("hashchange", () => {
        if (window.location.hash === "#projects-carousel-section") {
          CarouselController.scrollToCarousel(0);
        }
      });
    }

    /**
     * Checks if arriving with #projects-carousel-section hash
     * and scrolls to the carousel once layout and ScrollTrigger are ready.
     */
    static handleHashNavigation() {
      if (window.location.hash === "#projects-carousel-section") {
        setTimeout(() => {
          CarouselController.scrollToCarousel(0);
        }, 200);
      }
    }

    /**
     * Smoothly auto-hides the floating capsule App Bar when scrolling near the 3D Carousel,
     * restoring full screen immersion without title collisions, and restores it when scrolling up.
     */
    static setupSmartAppBar() {
      const appbar = document.querySelector(".appbar");
      const carousel = document.getElementById("projects-carousel-section");
      if (!appbar || !carousel) return;

      let ticking = false;
      window.addEventListener("scroll", () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            const carouselRect = carousel.getBoundingClientRect();
            if (carouselRect.top <= 140 && carouselRect.bottom > 100) {
              appbar.classList.add("appbar-hidden");
            } else {
              appbar.classList.remove("appbar-hidden");
            }
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });
    }

    /**
     * Switches language and re-renders page content & 3D carousel
     * @param {string} lang - 'en' or 'ar'
     */
    static async switchLanguage(lang) {
      try {
        const translations = await LanguageRepository.loadLanguage(lang);
        const { pageTranslations } = LocalizationUseCase.translateDOM(translations, "home-page");

        if (pageTranslations && pageTranslations.projectsData) {
          CarouselController.init(pageTranslations.projectsData);
        }
      } catch (err) {
        console.error("Failed to switch language:", err);
      }
    }
  }

  exports.HomeController = HomeController;
})(window.Portfolio.presentation.controllers);
