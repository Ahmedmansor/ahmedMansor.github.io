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

      // Initialize Pinned Scroll-Driven Space Hero Sequence
      this.setupSpaceHeroScrollSequence();

      // Setup smooth navigation to projects
      this.setupProjectsNavLink();

      // Load initial language
      await this.switchLanguage(activeLang);

      // Handle direct landing with hash (#projects-carousel-section)
      this.handleHashNavigation();
    }

    /**
     * Initializes the Pinned GSAP ScrollTrigger Sequence for Space Hero:
     * - Pins hero stage for a crisp, cinematic scroll duration (~120vh).
     * - Step 1: "AHMED" enters with letter-spacing tracking.
     * - Step 2: "MANSOUR" enters alongside it.
     * - Step 3: Subtitle ("SOFTWARE", "ENGINEER", "[ FLUTTER & AI ]") reveals.
     * - Step 4: Futuristic spaceship probe swoops across the curved Earth horizon.
     * - Unpins cleanly into the side-by-side About Me / Profile separator.
     */
    static setupSpaceHeroScrollSequence() {
      if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

      const heroWrapper = document.getElementById("space-hero-pin-wrapper");
      const titleFirst = document.querySelector(".title-first");
      const titleLast = document.querySelector(".title-last");
      const subWords = document.querySelectorAll("#subtitle .sub-word, #subtitle .sub-tag");
      const spaceship = document.getElementById("space-vessel");
      const horizon = document.getElementById("horizon");

      if (!heroWrapper || !titleFirst || !titleLast) return;

      gsap.registerPlugin(ScrollTrigger);

      // Force initial hidden states strictly with autoAlpha to ensure clean startup
      gsap.set(titleFirst, { autoAlpha: 0, y: -40, letterSpacing: "clamp(6px, 1.2vw, 14px)" });
      gsap.set(titleLast, { autoAlpha: 0, y: -40, letterSpacing: "clamp(6px, 1.2vw, 14px)" });
      if (subWords.length > 0) {
        gsap.set(subWords, { autoAlpha: 0, y: 22 });
      }
      if (spaceship) {
        gsap.set(spaceship, { autoAlpha: 0, x: -450, y: 160, rotation: 16, scale: 0.75 });
      }

      // Create Pinned Scrub Timeline with generous scroll travel (+180vh)
      const heroTl = gsap.timeline({
        scrollTrigger: {
          trigger: heroWrapper,
          start: "top top",
          end: "+=180%",
          pin: true,
          scrub: 0.8,
          anticipatePin: 1
        }
      });

      // Step 1: AHMED reveals smoothly as user scrolls
      heroTl.to(titleFirst, {
        autoAlpha: 1,
        y: 0,
        letterSpacing: "clamp(12px, 2vw, 24px)",
        duration: 0.24,
        ease: "power2.out"
      }, 0.06);

      // Step 2: MANSOUR reveals right after it
      heroTl.to(titleLast, {
        autoAlpha: 1,
        y: 0,
        letterSpacing: "clamp(12px, 2vw, 24px)",
        duration: 0.24,
        ease: "power2.out"
      }, 0.26);

      // Step 3: Subtitle words emerge sequentially ("SOFTWARE", "ENGINEER", "[ FLUTTER & AI ]")
      if (subWords.length > 0) {
        heroTl.to(subWords, {
          autoAlpha: 1,
          y: 0,
          stagger: 0.08,
          duration: 0.22,
          ease: "power2.out"
        }, 0.46);
      }

      // Step 4: Spaceship flies majestically across the curved horizon
      if (spaceship) {
        heroTl.to(spaceship, {
          autoAlpha: 1,
          duration: 0.08,
          ease: "power1.in"
        }, 0.58)
        .to(spaceship, {
          x: window.innerWidth + 450,
          y: 20,
          rotation: -6,
          scale: 1.05,
          duration: 0.42,
          ease: "power1.inOut"
        }, 0.58);
      }

      // Step 5: Atmospheric subtle tilt
      if (horizon) {
        heroTl.to(horizon, {
          y: 16,
          scale: 1.025,
          duration: 0.45,
          ease: "sine.inOut"
        }, 0.55);
      }
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
     * - Hides the floating capsule App Bar throughout the Space Hero pinned sequence.
     * - Smoothly reveals the App Bar only when scrolling past the Space Hero into About Me (#about-section).
     * - Auto-hides when entering the 3D Carousel immersion zone, restoring it when scrolling away.
     */
    static setupSmartAppBar() {
      const appbar = document.querySelector(".appbar");
      const aboutSection = document.getElementById("about-section");
      const carousel = document.getElementById("projects-carousel-section");
      if (!appbar) return;

      const updateAppBarState = () => {
        // 1. Solution 1: Keep App Bar completely hidden throughout the Space Hero sequence
        // Reveal only when reaching or passing the About Me section (#about-section)
        if (aboutSection) {
          const aboutRect = aboutSection.getBoundingClientRect();
          if (aboutRect.top > 90) {
            appbar.classList.add("appbar-hero-hidden");
            appbar.classList.remove("appbar-hidden");
            return;
          } else {
            appbar.classList.remove("appbar-hero-hidden");
          }
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
