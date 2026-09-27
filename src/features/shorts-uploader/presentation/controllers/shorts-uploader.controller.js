/**
 * @file shorts-uploader.controller.js
 * @description Page Controller for the YouTube Shorts Auto-Uploader Project Details Page (shorts-uploader.html).
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

  class ShortsUploaderController {
    /**
     * Initializes the Shorts Uploader detail page
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
        ShortsUploaderController.setupSvgNodeAudioInteractions(flowchartObj);
      };

      flowchartObj.addEventListener("load", bindSvgAudio);

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              if (!flowchartObj.getAttribute("data") && flowchartObj.dataset.src) {
                flowchartObj.setAttribute("data", flowchartObj.dataset.src);
              }
              ShortsUploaderController.toggleSvgAnimation(false);
              bindSvgAudio();
            } else {
              ShortsUploaderController.toggleSvgAnimation(true);
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

        const nodes = doc.querySelectorAll(".pipeline-node, [id^='node-'], g[data-title], .pipeline-stage");
        if (!nodes.length) return;

        doc._audioListenersAttached = true;

        // Inject subtle hover styles into SVG
        const style = doc.createElementNS("http://www.w3.org/2000/svg", "style");
        style.textContent = `
          .pipeline-node, [id^='node-'], .pipeline-stage {
            cursor: pointer !important;
            transition: transform 0.2s ease, filter 0.2s ease !important;
          }
          .pipeline-node:hover, [id^='node-']:hover {
            filter: drop-shadow(0 0 12px rgba(244, 63, 94, 0.85)) !important;
          }
        `;
        const svg = doc.querySelector("svg");
        if (svg) svg.appendChild(style);

        nodes.forEach((node) => {
          node.addEventListener("mouseenter", () => {
            if (window.AudioService) {
              window.AudioService.playThrottled("ui-hover", 50);
            }
          });

          node.addEventListener("click", () => {
            if (window.AudioService) {
              window.AudioService.play("laser-scan");
            }
          });
        });
      } catch (_) {
        // Safe cross-boundary ignore
      }
    }

    /**
     * Controls SVG animation playback state across frames (Commandment 1 & 4)
     * @param {boolean} isPaused
     */
    static toggleSvgAnimation(isPaused) {
      const flowchartObj = document.getElementById("pipeline-flowchart-object");
      if (!flowchartObj) return;
      try {
        const doc = flowchartObj.contentDocument;
        if (doc) {
          const svg = doc.querySelector("svg");
          if (svg) {
            if (isPaused) {
              svg.classList.add("is-paused");
            } else {
              svg.classList.remove("is-paused");
            }
          }
          if (!doc._audioListenersAttached) {
            ShortsUploaderController.setupSvgNodeAudioInteractions(flowchartObj);
          }
        }
      } catch (_) {
        // Safe cross-boundary ignore
      }
    }

    /**
     * Viewport-Aware Scroll Reveal (Commandment 1: Intersection Observer)
     */
    static setupScrollReveal() {
      const targets = document.querySelectorAll(
        ".problem-solution-section, .tech-stack-section, .flowchart-card, .demo-video-section, .stage-card, .review-card"
      );
      if (!targets.length || !("IntersectionObserver" in window)) return;

      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-revealed");
              obs.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -50px 0px", threshold: 0.05 }
      );

      targets.forEach((el) => observer.observe(el));
    }

    /**
     * Interactive sound triggers for video placeholder
     */
    static setupVideoPlaceholderInteractions() {
      const playBtn = document.querySelector(".video-play-pulse-btn");
      if (playBtn) {
        playBtn.addEventListener("click", () => {
          if (window.AudioService) {
            window.AudioService.play("hologram-on");
          }
        });
      }
    }

    /**
     * Power-Saving Visibility State (Commandment 4: Visibility Change)
     */
    static setupVisibilityOptimization() {
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          document.body.classList.add("page-paused");
          ShortsUploaderController.toggleSvgAnimation(true);
        } else {
          document.body.classList.remove("page-paused");
          const flowchartSection = document.querySelector(".flowchart-section");
          if (flowchartSection) {
            const rect = flowchartSection.getBoundingClientRect();
            const inView = rect.top < window.innerHeight && rect.bottom > 0;
            if (inView) {
              ShortsUploaderController.toggleSvgAnimation(false);
            }
          }
        }
      });
    }

    /**
     * Switches language and re-renders text
     * @param {string} lang
     */
    static async switchLanguage(lang) {
      try {
        const translations = await LanguageRepository.loadLanguage(lang);
        LocalizationUseCase.translateDOM(translations, "shortsuploader-page");
      } catch (err) {
        console.error("Failed to load Shorts Uploader page language:", err);
      }
    }

    /**
     * Cleanup resources upon teardown
     */
    static cleanup() {
      // Revert observer instances if needed
    }
  }

  exports.ShortsUploaderController = ShortsUploaderController;
})(window.Portfolio.presentation.controllers);
