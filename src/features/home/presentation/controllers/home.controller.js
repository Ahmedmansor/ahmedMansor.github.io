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
  const AppbarComponent = window.Portfolio.presentation.components.AppbarComponent;
  const LanguageSwitcherComponent = window.Portfolio.presentation.components.LanguageSwitcherComponent;
  const FooterComponent = window.Portfolio.presentation.components.FooterComponent;
  const CarouselController = window.Portfolio.presentation.controllers.CarouselController;

  class HomeController {
    /**
     * Initializes the Home page
     */
    static async init() {
      const activeLang = LanguageRepository.getActiveLanguage();

      // Initialize universal Floating App Bar
      if (AppbarComponent) {
        AppbarComponent.init("#appbar-container");
      }

      // Initialize switcher UI
      LanguageSwitcherComponent.init({
        initialLang: activeLang,
        onLanguageChange: (lang) => this.switchLanguage(lang)
      });

      // Initialize universal Footer & Social Contact Dock
      if (FooterComponent) {
        FooterComponent.init("#footer-container");
      }

      // Initialize Smart Floating App Bar auto-hide and scroll reveal (Solution 1)
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
     * Implements Solution 1:
     * - Hides the floating capsule App Bar when at the top of the page (in Space Hero) for an unobstructed view.
     * - Smoothly reveals the App Bar when scrolling past the Space Hero (~110px).
     * - Auto-hides when entering the 3D Carousel immersion zone, restoring it when scrolling away.
     */
    static setupSmartAppBar() {
      const appbar = document.querySelector(".appbar");
      const carousel = document.getElementById("projects-carousel-section");
      if (!appbar) return;

      const updateAppBarState = () => {
        const scrollY = window.scrollY || window.pageYOffset;

        // 1. Solution 1: Completely hide at the top in Space Hero
        if (scrollY < 110) {
          appbar.classList.add("appbar-hero-hidden");
          appbar.classList.remove("appbar-hidden");
          return;
        } else {
          appbar.classList.remove("appbar-hero-hidden");
        }

        // 2. Hide when immersed inside the 3D Carousel zone
        if (carousel) {
          const carouselRect = carousel.getBoundingClientRect();
          if (carouselRect.top <= 140 && carouselRect.bottom > 100) {
            appbar.classList.add("appbar-hidden");
          } else {
            appbar.classList.remove("appbar-hidden");
          }
        }
      };

      // Initial check on page load
      updateAppBarState();

      let ticking = false;
      window.addEventListener("scroll", () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            updateAppBarState();
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
