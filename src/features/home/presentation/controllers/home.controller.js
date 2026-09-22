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

      // Initialize Cyberpunk Code IDE & Biometric Hologram section
      this.setupCyberAboutSection();

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
     * Initializes the Cyberpunk Code IDE & Biometric Hologram section:
     * - ScrollTrigger reveal of Biometric Card & IDE Window with subtle cyber entrance
     * - Tab switching between Dart and JSON files with synced line numbers
     * - Interactive "▶ RUN CODE" compiler simulation with terminal output drawer
     */
    static setupCyberAboutSection() {
      const aboutSection = document.getElementById("about-section");
      const bioCard = document.querySelector(".biometric-card");
      const ideContainer = document.querySelector(".cyber-ide-container");
      const runBtn = document.getElementById("ide-run-btn");
      const terminalDrawer = document.getElementById("ide-terminal-drawer");
      const terminalOutput = document.getElementById("terminal-output");
      const termStatus = document.getElementById("term-status");
      const tabDart = document.getElementById("tab-dart");
      const tabJson = document.getElementById("tab-json");
      const codeDart = document.getElementById("code-dart");
      const codeJson = document.getElementById("code-json");
      const ideGutter = document.getElementById("ide-gutter");

      if (!aboutSection) return;

      // 1. Sync line numbers helper
      const updateLineNumbers = (lineCount) => {
        if (!ideGutter) return;
        let spans = "";
        for (let i = 1; i <= lineCount; i++) {
          spans += `<span>${i}</span>`;
        }
        ideGutter.innerHTML = spans;
      };

      // Set initial line numbers (15 lines for Dart code)
      updateLineNumbers(15);

      // 2. Tab switching logic
      if (tabDart && tabJson && codeDart && codeJson) {
        tabDart.addEventListener("click", () => {
          tabDart.classList.add("active");
          tabJson.classList.remove("active");
          codeDart.classList.add("active");
          codeJson.classList.remove("active");
          updateLineNumbers(15);
        });

        tabJson.addEventListener("click", () => {
          tabJson.classList.add("active");
          tabDart.classList.remove("active");
          codeJson.classList.add("active");
          codeDart.classList.remove("active");
          updateLineNumbers(11);
        });
      }

      // 3. Interactive "RUN CODE" Button logic
      let isCompiling = false;
      if (runBtn && terminalDrawer && terminalOutput) {
        runBtn.addEventListener("click", () => {
          // Open terminal drawer if closed
          terminalDrawer.classList.add("open");

          if (isCompiling) return;
          isCompiling = true;

          if (termStatus) {
            termStatus.textContent = "[COMPILING...]";
            termStatus.style.color = "#ffd166";
          }

          // Initial compile log state
          terminalOutput.innerHTML = `
            <div class="term-line prompt-line">$ flutter run -d production --profile</div>
            <div class="term-line info-line"><i class="fas fa-cog fa-spin"></i> Initializing Dart VM & Clean Architecture kernel...</div>
          `;

          // Step 1: Resolving dependencies
          setTimeout(() => {
            const line1 = document.createElement("div");
            line1.className = "term-line info-line";
            line1.innerHTML = `[SYS] Resolving dependencies: flutter_bloc, supabase_flutter, get_it... <span style="color:#00e696;">[OK]</span>`;
            terminalOutput.appendChild(line1);
          }, 500);

          // Step 2: AI Pipelines & State Management
          setTimeout(() => {
            const line2 = document.createElement("div");
            line2.className = "term-line info-line";
            line2.innerHTML = `[SYS] Compiling Reactive BLoCs & AI Automation Pipelines... <span style="color:#00e696;">[OK]</span>`;
            terminalOutput.appendChild(line2);
          }, 1000);

          // Step 3: Build Successful Finish
          setTimeout(() => {
            const line3 = document.createElement("div");
            line3.className = "term-line success-line";
            line3.innerHTML = `[BUILD SUCCESSFUL] 🚀 Ahmed Mansour is compiled and ready for deployment!`;
            terminalOutput.appendChild(line3);

            const line4 = document.createElement("div");
            line4.className = "term-line accent-line";
            line4.innerHTML = `&gt; High-performance mobile applications initialized (0.42s).`;
            terminalOutput.appendChild(line4);

            if (termStatus) {
              termStatus.textContent = "[READY]";
              termStatus.style.color = "#00e696";
            }
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
            isCompiling = false;
          }, 1500);
        });
      }

      // 4. GSAP ScrollTrigger Entrance Animation
      if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
        gsap.registerPlugin(ScrollTrigger);

        if (bioCard && ideContainer) {
          gsap.from([bioCard, ideContainer], {
            scrollTrigger: {
              trigger: aboutSection,
              start: "top 80%",
              toggleActions: "play none none none"
            },
            y: 35,
            autoAlpha: 0,
            duration: 0.85,
            stagger: 0.16,
            ease: "power2.out"
          });
        }
      }
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
