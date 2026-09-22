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
     * - Pins hero stage for a crisp, cinematic scroll duration (~180vh).
     * - Step 1: Cyber Console box activates with neon glow and blinking underscore cursor.
     * - Step 2: "AHMED MANSOUR" is typed character-by-character synchronized with scroll (scrubbed).
     * - Step 3: Subtitle ("SOFTWARE", "ENGINEER", "[ FLUTTER & AI ]") reveals sequentially.
     * - Step 4: Futuristic spaceship probe swoops across the curved Earth horizon.
     * - Unpins cleanly into the side-by-side About Me / Profile separator.
     */
    static setupSpaceHeroScrollSequence() {
      if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

      const heroWrapper = document.getElementById("space-hero-pin-wrapper");
      const titleWrapper = document.getElementById("title");
      const consoleBox = document.getElementById("console-box");
      const consoleTextEl = document.getElementById("text");
      const subWords = document.querySelectorAll("#subtitle .sub-word, #subtitle .sub-tag");
      const spaceship = document.getElementById("space-vessel");
      const horizon = document.getElementById("horizon");

      if (!heroWrapper || !titleWrapper || !consoleTextEl) return;

      gsap.registerPlugin(ScrollTrigger);

      const fullText = "AHMED MANSOUR";

      // Initial clean state: empty text ready for scroll typing
      consoleTextEl.textContent = "";

      // Ensure title wrapper is visible with clean initial state
      gsap.set(titleWrapper, { autoAlpha: 1 });

      if (subWords.length > 0) {
        gsap.set(subWords, { autoAlpha: 0, y: 22 });
      }
      if (spaceship) {
        gsap.set(spaceship, { autoAlpha: 0, x: -450, y: 160, rotation: 16, scale: 0.75 });
      }

      // Smooth scroll click on cyber scroll indicator
      const scrollIndicator = document.getElementById("cyber-scroll-indicator");
      if (scrollIndicator) {
        scrollIndicator.addEventListener("click", () => {
          const aboutSection = document.getElementById("about-section");
          if (aboutSection) {
            aboutSection.scrollIntoView({ behavior: "smooth" });
          }
        });
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

      // Fade out scroll indicator immediately on initial scroll
      if (scrollIndicator) {
        heroTl.to(scrollIndicator, {
          autoAlpha: 0,
          y: 10,
          duration: 0.12,
          ease: "power1.out"
        }, 0.01);
      }

      // Step 1: Scroll-Driven Character-by-Character Typing (Scrubbed forward & backward)
      const typingTracker = { length: 0 };
      heroTl.to(typingTracker, {
        length: fullText.length,
        duration: 0.44,
        ease: "none",
        onUpdate: () => {
          const currentCount = Math.min(fullText.length, Math.floor(typingTracker.length + 0.1));
          consoleTextEl.textContent = fullText.slice(0, currentCount);
        }
      }, 0.06);

      // Step 3: Subtitle words emerge sequentially ("SOFTWARE", "ENGINEER", "[ FLUTTER & AI ]")
      if (subWords.length > 0) {
        heroTl.to(subWords, {
          autoAlpha: 1,
          y: 0,
          stagger: 0.08,
          duration: 0.22,
          ease: "power2.out"
        }, 0.52);
      }

      // Step 4: Spaceship flies majestically across the curved horizon
      if (spaceship) {
        heroTl.to(spaceship, {
          autoAlpha: 1,
          duration: 0.08,
          ease: "power1.in"
        }, 0.62)
        .to(spaceship, {
          x: window.innerWidth + 450,
          y: 20,
          rotation: -6,
          scale: 1.05,
          duration: 0.38,
          ease: "power1.inOut"
        }, 0.62);
      }

      // Step 5: Atmospheric subtle tilt
      if (horizon) {
        heroTl.to(horizon, {
          y: 16,
          scale: 1.025,
          duration: 0.45,
          ease: "sine.inOut"
        }, 0.60);
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
