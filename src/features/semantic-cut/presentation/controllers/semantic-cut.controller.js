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

      this.setupScrollReveal();
      this.setupFlowchartLazyMount();
      this.setupVisibilityOptimization();

      await this.switchLanguage(activeLang);
    }

    /**
     * Lazy-Mounts & Viewport-Pauses interactive SVG <object> (Commandments 1, 4 & 5)
     * Keeps initial page load 100% lightweight and pauses SVG animations when off-screen.
     */
    static setupFlowchartLazyMount() {
      const flowchartSection = document.querySelector(".flowchart-section");
      const flowchartObj = document.getElementById("pipeline-flowchart-object");
      if (!flowchartSection || !flowchartObj || !("IntersectionObserver" in window)) return;

      const bindSvgAudio = () => {
        SemanticCutController.setupSvgNodeAudioInteractions(flowchartObj);
      };

      flowchartObj.addEventListener("load", bindSvgAudio);

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              if (!flowchartObj.getAttribute("data") && flowchartObj.dataset.src) {
                flowchartObj.setAttribute("data", flowchartObj.dataset.src);
              }
              SemanticCutController.toggleSvgAnimation(false);
              bindSvgAudio();
            } else {
              SemanticCutController.toggleSvgAnimation(true);
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

        const nodes = doc.querySelectorAll(".pipeline-node, [id^='node-'], g[data-title]");
        if (!nodes.length) return;

        doc._audioListenersAttached = true;

        // Inject subtle hover styles into SVG
        const style = doc.createElementNS("http://www.w3.org/2000/svg", "style");
        style.textContent = `
          .pipeline-node, [id^='node-'] {
            cursor: pointer !important;
            transition: transform 0.2s ease, filter 0.2s ease !important;
          }
          .pipeline-node:hover, [id^='node-']:hover {
            filter: drop-shadow(0 0 12px rgba(0, 240, 255, 0.8)) !important;
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
            SemanticCutController.setupSvgNodeAudioInteractions(flowchartObj);
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
        ".problem-solution-section, .tech-stack-section, .flowchart-card, .demo-video-section, .stage-card"
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
     * Power-Saving Visibility State (Commandment 4: Visibility Change)
     */
    static setupVisibilityOptimization() {
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          document.body.classList.add("page-paused");
          SemanticCutController.toggleSvgAnimation(true);
        } else {
          document.body.classList.remove("page-paused");
          const flowchartSection = document.querySelector(".flowchart-section");
          if (flowchartSection) {
            const rect = flowchartSection.getBoundingClientRect();
            const inView = rect.top < window.innerHeight && rect.bottom > 0;
            if (inView) {
              SemanticCutController.toggleSvgAnimation(false);
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
        LocalizationUseCase.translateDOM(translations, "semanticcut-page");
      } catch (err) {
        console.error("Failed to load SemanticCut page language:", err);
      }
    }
  }

  exports.SemanticCutController = SemanticCutController;
})(window.Portfolio.presentation.controllers);
