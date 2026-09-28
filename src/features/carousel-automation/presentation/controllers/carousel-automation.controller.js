/**
 * @file carousel-automation.controller.js
 * @description Page Controller for the AI Social Media Carousel Automation Details Page (carousel-automation.html).
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

  class CarouselAutomationController {
    /**
     * Initializes the AI Social Media Carousel Automation detail page
     */
    static async init() {
      const activeLang = LanguageRepository.getActiveLanguage();

      // Initialize universal Floating App Bar
      if (AppbarComponent) {
        AppbarComponent.init("#appbar-container");
      }

      // Initialize Language Switcher Component
      if (LanguageSwitcherComponent) {
        LanguageSwitcherComponent.init({
          initialLang: activeLang,
          onLanguageChange: (lang) => this.switchLanguage(lang)
        });
      }

      // Initialize universal Footer & Social Contact Dock
      if (FooterComponent) {
        FooterComponent.init("#footer-container");
      }

      this.setupScrollReveal();
      this.setupFlowchartLazyMount();
      this.setupVisibilityOptimization();
      this.setupVideoPlaceholderInteractions();

      await this.switchLanguage(activeLang);
    }

    /**
     * Lazy-Mounts & Viewport-Pauses interactive SVG <object> (Commandments 1, 4 & 5)
     */
    static setupFlowchartLazyMount() {
      const flowchartSection = document.querySelector(".flowchart-section");
      const flowchartObj = document.getElementById("pipeline-flowchart-object");
      if (!flowchartSection || !flowchartObj || !("IntersectionObserver" in window)) return;

      const bindSvgAudio = () => {
        CarouselAutomationController.setupSvgNodeAudioInteractions(flowchartObj);
      };

      flowchartObj.addEventListener("load", bindSvgAudio);

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              if (!flowchartObj.getAttribute("data") && flowchartObj.dataset.src) {
                flowchartObj.setAttribute("data", flowchartObj.dataset.src);
              }
              CarouselAutomationController.toggleSvgAnimation(false);
              bindSvgAudio();
            } else {
              CarouselAutomationController.toggleSvgAnimation(true);
            }
          });
        },
        { rootMargin: "100px 0px 100px 0px", threshold: 0.05 }
      );

      observer.observe(flowchartSection);
    }

    /**
     * Binds interactive audio effects and hover glow to SVG flowchart nodes
     * @param {HTMLObjectElement} flowchartObj
     */
    static setupSvgNodeAudioInteractions(flowchartObj) {
      if (!flowchartObj) return;
      try {
        const doc = flowchartObj.contentDocument;
        if (!doc || doc._audioListenersAttached) return;

        const nodes = doc.querySelectorAll(".pipeline-node, [id^='node-'], g[data-title], .pipeline-stage, rect, path");
        if (!nodes.length) return;

        doc._audioListenersAttached = true;

        nodes.forEach((node) => {
          node.addEventListener("mouseenter", () => {
            if (window.AudioService) {
              window.AudioService.playThrottled("ui-hover", 80);
            }
          });
          node.addEventListener("click", () => {
            if (window.AudioService) {
              window.AudioService.play("ui-click");
            }
          });
        });
      } catch (e) {
        // Cross-origin fallback guard
      }
    }

    /**
     * Pauses/Resumes SVG keyframe animations when offscreen
     * @param {boolean} pause
     */
    static toggleSvgAnimation(pause) {
      const flowchartObj = document.getElementById("pipeline-flowchart-object");
      if (!flowchartObj) return;
      try {
        const doc = flowchartObj.contentDocument;
        if (doc && doc.documentElement) {
          if (pause) {
            doc.documentElement.classList.add("is-paused");
          } else {
            doc.documentElement.classList.remove("is-paused");
          }
        }
      } catch (e) {}
    }

    /**
     * Telemetry & click sound on Vimeo video placeholder
     */
    static setupVideoPlaceholderInteractions() {
      const playBtn = document.querySelector(".video-play-pulse-btn");
      if (!playBtn) return;

      playBtn.addEventListener("click", () => {
        if (window.AudioService) {
          window.AudioService.play("hologram-on");
        }
      });
    }

    /**
     * Viewport-aware Scroll Reveal using IntersectionObserver
     */
    static setupScrollReveal() {
      if (!("IntersectionObserver" in window)) return;

      const animatedElements = document.querySelectorAll(
        ".ps-card, .stage-card, .actor-card, .flowchart-card, .video-responsive-wrapper"
      );

      const revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("revealed");
              observer.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -50px 0px", threshold: 0.1 }
      );

      animatedElements.forEach((el) => revealObserver.observe(el));
    }

    /**
     * Page Visibility & BFCache Optimization (Commandments 2 & 8)
     */
    static setupVisibilityOptimization() {
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          document.body.classList.add("page-paused");
          CarouselAutomationController.toggleSvgAnimation(true);
        } else {
          document.body.classList.remove("page-paused");
          CarouselAutomationController.toggleSvgAnimation(false);
        }
      });
    }

    /**
     * Switches the page language and re-translates all data-i18n-key nodes
     * @param {string} lang
     */
    static async switchLanguage(lang) {
      try {
        const translations = await LanguageRepository.loadLanguage(lang);
        LocalizationUseCase.translateDOM(translations, "carouselautomation-page");
      } catch (err) {
        console.error("Failed to load Carousel Automation page language:", err);
      }
    }
  }

  exports.CarouselAutomationController = CarouselAutomationController;
})(window.Portfolio.presentation.controllers);
