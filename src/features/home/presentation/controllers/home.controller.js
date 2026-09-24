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
  const SpaceHeroComponent = window.Portfolio.presentation.components.SpaceHeroComponent;

  let heroTimelineInstance = null;

  class HomeController {
    static isAboutActive = false;
    static _aboutObserver = null;
    static _aboutVisibilityHandler = null;

    /**
     * Cleans up any existing Space Hero GSAP Timeline and ScrollTrigger,
     * resetting element transforms to a clean initial state.
     */
    static cleanupSpaceHero() {
      if (typeof ScrollTrigger !== "undefined") {
        const existingTrigger = ScrollTrigger.getById("spaceHeroTrigger");
        if (existingTrigger) {
          existingTrigger.kill(true);
        }
      }
      if (heroTimelineInstance) {
        if (heroTimelineInstance.scrollTrigger) {
          heroTimelineInstance.scrollTrigger.kill(true);
        }
        heroTimelineInstance.kill();
        heroTimelineInstance = null;
      }
      const heroWrapper = document.getElementById("space-hero-pin-wrapper");
      if (heroWrapper && typeof gsap !== "undefined") {
        gsap.set(heroWrapper, { clearProps: "all" });
      }
    }

    /**
     * Handles pageshow event to recalibrate ScrollTrigger on BFCache restore or back-forward navigation
     * @param {PageTransitionEvent} event
     */
    static handlePageShow(event) {
      if (typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.refresh();
        requestAnimationFrame(() => {
          ScrollTrigger.refresh();
          ScrollTrigger.update();
        });
      }
      if (event && event.persisted) {
        const preloader = document.getElementById("cyber-preloader");
        if (preloader) preloader.remove();
      }
    }

    /**
     * Drives the Cyberpunk System Boot Preloader animation:
     * - Animates progress bar from 0% to 100% in ~750ms
     * - Sequentially updates system telemetry logs
     * - Fades out seamlessly with GSAP once all components & ScrollTriggers are ready
     */
    static runCyberBootSequence() {
      return new Promise((resolve) => {
        const preloader = document.getElementById("cyber-preloader");
        const progressBar = document.getElementById("preloader-progress-bar");
        const counterEl = document.getElementById("preloader-counter");
        const logEl = document.getElementById("preloader-log");
        const statusEl = document.getElementById("preloader-status");

        if (!preloader || !progressBar || !counterEl) {
          resolve();
          return;
        }

        const logs = [
          { at: 15, text: "CALIBRATING QUANTUM SENSORS..." },
          { at: 40, text: "MOUNTING FLUTTER & AI ENGINE..." },
          { at: 70, text: "LINKING BIOMETRIC TELEMETRY..." },
          { at: 90, text: "SYNCHRONIZING ORBITAL STAGE..." },
          { at: 100, text: "[STATUS: ALL SYSTEMS NOMINAL // READY]" }
        ];

        const duration = 750; // Crisp 750ms duration
        const startTime = performance.now();

        const updatePreloader = (now) => {
          const elapsed = now - startTime;
          const progress = Math.min(100, Math.floor((elapsed / duration) * 100));

          progressBar.style.width = `${progress}%`;
          counterEl.textContent = `${String(progress).padStart(3, "0")}%`;

          for (let i = logs.length - 1; i >= 0; i--) {
            if (progress >= logs[i].at) {
              if (logEl && logEl.textContent !== logs[i].text) {
                logEl.textContent = logs[i].text;
              }
              break;
            }
          }

          if (progress >= 100) {
            if (statusEl) {
              statusEl.textContent = "ONLINE";
              statusEl.style.color = "#00e696";
            }
            if (logEl) {
              logEl.style.color = "#00f0ff";
            }

            // Smooth holographic GSAP fade-out
            setTimeout(() => {
              if (typeof gsap !== "undefined") {
                gsap.to(preloader, {
                  autoAlpha: 0,
                  duration: 0.45,
                  ease: "power2.inOut",
                  onComplete: () => {
                    preloader.remove();
                    resolve();
                  }
                });
              } else {
                preloader.style.opacity = "0";
                preloader.style.pointerEvents = "none";
                setTimeout(() => {
                  preloader.remove();
                  resolve();
                }, 450);
              }
            }, 120);
          } else {
            requestAnimationFrame(updatePreloader);
          }
        };

        requestAnimationFrame(updatePreloader);
      });
    }

    /**
     * Initializes the Home page
     */
    static async init() {
      // Force auto scroll-behavior so ScrollTrigger calculations are never distorted by smooth transitions
      document.documentElement.style.scrollBehavior = "auto";
      if (document.body) {
        document.body.style.scrollBehavior = "auto";
      }

      if (typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.clearScrollMemory();
      }

      // 1. Enable standard browser scroll restoration so back-navigation restores smoothly
      if ("scrollRestoration" in history) {
        history.scrollRestoration = "auto";
      }

      // Check if arriving via Back/Forward navigation
      const navEntries = performance.getEntriesByType("navigation");
      const isBackForward = navEntries.length > 0 && navEntries[0].type === "back_forward";

      const preloader = document.getElementById("cyber-preloader");

      // 2. Start or bypass Cyberpunk Boot Sequence:
      // On Back/Forward navigation, instantly dismiss the preloader so the user returns right to their spot
      let bootPromise;
      if (isBackForward) {
        if (preloader) preloader.remove();
        bootPromise = Promise.resolve();
      } else {
        if (!window.location.hash) {
          window.scrollTo(0, 0);
        }
        bootPromise = this.runCyberBootSequence();
      }

      const activeLang = LanguageRepository.getActiveLanguage();

      // 3. Initialize universal Floating App Bar (starts with appbar-hero-hidden in HTML)
      if (AppbarComponent) {
        AppbarComponent.init("#appbar-container");
      }

      // 4. Initialize switcher UI
      LanguageSwitcherComponent.init({
        initialLang: activeLang,
        onLanguageChange: (lang) => this.switchLanguage(lang)
      });

      // 5. Initialize universal Footer & Social Contact Dock
      if (FooterComponent) {
        FooterComponent.init("#footer-container");
      }

      // 6. Initialize Smart Floating App Bar auto-hide and scroll reveal
      this.setupSmartAppBar();

      // 7. Initialize Space Hero Canvas component
      if (SpaceHeroComponent) {
        this.spaceHero = new SpaceHeroComponent();
        this.spaceHero.init();
      }

      // 8. Initialize Pinned Scroll-Driven Space Hero Sequence (Section 1 - Top)
      this.setupSpaceHeroScrollSequence();

      // 8. Initialize Cyberpunk Code IDE & Biometric Hologram section (Section 2 - Middle)
      this.setupCyberAboutSection();

      // 9. Load initial language & render Carousel 3D cards (Section 3 - Bottom)
      await this.switchLanguage(activeLang);

      // 10. Setup smooth navigation to projects
      this.setupProjectsNavLink();

      // 11. Sort and recalibrate all GSAP ScrollTriggers in DOM order
      if (typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.sort();
        ScrollTrigger.refresh();
      }

      // 12. Await boot animation completion before resolving
      await bootPromise;

      if (typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.refresh();
      }

      // 13. Handle direct landing with hash (#projects-carousel-section)
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

      // Clean up previous instance if re-initializing
      this.cleanupSpaceHero();

      gsap.registerPlugin(ScrollTrigger);

      const fullText = "AHMED MANSOUR";

      // Ensure title wrapper is visible with clean initial state
      gsap.set(titleWrapper, { autoAlpha: 1 });

      if (subWords.length > 0) {
        gsap.set(subWords, { autoAlpha: 0, y: 22 });
      }
      if (spaceship) {
        gsap.set(spaceship, { autoAlpha: 0, x: -450, y: 160, rotation: 16, scale: 0.75 });
      }
      if (horizon) {
        gsap.set(horizon, { y: 0, scale: 1 });
      }

      // Helper to compute typed text character-by-character continuously forward and backward
      const updateTypingText = (progress) => {
        if (progress < 0.06) {
          consoleTextEl.textContent = "";
        } else if (progress >= 0.50) {
          consoleTextEl.textContent = fullText;
        } else {
          const ratio = (progress - 0.06) / (0.50 - 0.06);
          const currentCount = Math.min(fullText.length, Math.floor(ratio * fullText.length + 0.1));
          consoleTextEl.textContent = fullText.slice(0, currentCount);
        }
      };

      // Smooth scroll click on cyber scroll indicator
      const scrollIndicator = document.getElementById("cyber-scroll-indicator");
      if (scrollIndicator && !scrollIndicator.dataset.hasClickListener) {
        scrollIndicator.dataset.hasClickListener = "true";
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
          id: "spaceHeroTrigger",
          trigger: heroWrapper,
          start: "top top",
          end: "+=180%",
          pin: true,
          scrub: 0.8,
          refreshPriority: 10,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            updateTypingText(self.progress);
          }
        }
      });
      heroTimelineInstance = heroTl;

      // Sync text immediately with current trigger progress (so name is visible if starting below hero)
      if (heroTl.scrollTrigger) {
        updateTypingText(heroTl.scrollTrigger.progress);
      }

      // Fade out scroll indicator immediately on initial scroll
      if (scrollIndicator) {
        heroTl.to(scrollIndicator, {
          autoAlpha: 0,
          y: 10,
          duration: 0.12,
          ease: "power1.out"
        }, 0.01);
      }

      // Step 1: Scroll-Driven Character-by-Character Typing block (0.06 to 0.50)
      heroTl.to({}, { duration: 0.44 }, 0.06);

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
          x: () => window.innerWidth + 450,
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

      // Clear lingering hash when scrolling back up into the hero via ScrollTrigger
      if (typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.create({
          start: 0,
          end: 400,
          onEnterBack: () => {
            if (window.location.hash === "#projects-carousel-section") {
              history.replaceState(null, "", window.location.pathname);
            }
          }
        });
      }
    }

    /**
     * Checks if arriving with #projects-carousel-section hash
     * and scrolls to the carousel once layout and ScrollTrigger are ready.
     */
    static handleHashNavigation() {
      if (window.location.hash === "#projects-carousel-section") {
        CarouselController.scrollToCarousel(0, false);
      }
    }

    /**
     * Implements Smart App Bar visibility:
     * - Hides the floating capsule App Bar throughout the Space Hero pinned sequence.
     * - Smoothly reveals the App Bar only when scrolling past the Space Hero into About Me (#about-section).
     * - Auto-hides when entering the 3D Carousel immersion zone, and stays hidden throughout the ENTIRE 2400px pin duration.
     * - Restores the App Bar when scrolling past the Carousel into the footer or back into About Me.
     */
    static setupSmartAppBar() {
      const appbar = document.querySelector(".appbar");
      const aboutSection = document.getElementById("about-section");
      const carousel = document.getElementById("projects-carousel-section");
      if (!appbar || typeof ScrollTrigger === "undefined") return;

      // 1. Solution 1: Keep App Bar hidden throughout the Space Hero sequence,
      // and smoothly reveal it only upon reaching #about-section
      if (aboutSection) {
        ScrollTrigger.create({
          trigger: aboutSection,
          start: "top 90px",
          onEnter: () => appbar.classList.remove("appbar-hero-hidden"),
          onLeaveBack: () => {
            appbar.classList.add("appbar-hero-hidden");
            appbar.classList.remove("appbar-hidden");
          }
        });
      }

      // 2. Hide when approaching the 3D Carousel zone and KEEP hidden throughout the entire carousel section
      if (carousel) {
        ScrollTrigger.create({
          trigger: carousel,
          start: "top 120px",
          end: "bottom 100px",
          onEnter: () => appbar.classList.add("appbar-hidden"),
          onLeave: () => appbar.classList.remove("appbar-hidden"),
          onEnterBack: () => appbar.classList.add("appbar-hidden"),
          onLeaveBack: () => appbar.classList.remove("appbar-hidden")
        });
      }
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
      const statusLang = document.getElementById("ide-status-lang");

      if (!aboutSection) return;

      // 1. Sync line numbers helper dynamically based on code element
      const updateLineNumbersForElement = (codeEl) => {
        if (!ideGutter || !codeEl) return;
        const text = codeEl.textContent || "";
        const lines = text.split("\n");
        // Trim trailing empty line if pre ends with newline
        if (lines.length > 0 && lines[lines.length - 1].trim() === "") {
          lines.pop();
        }
        const lineCount = Math.max(lines.length, 1);
        let spans = "";
        for (let i = 1; i <= lineCount; i++) {
          spans += `<span>${i}</span>`;
        }
        ideGutter.innerHTML = spans;
      };

      // Set initial line numbers dynamically for Dart code
      updateLineNumbersForElement(codeDart);

      // 2. Tab switching logic
      if (tabDart && tabJson && codeDart && codeJson) {
        tabDart.addEventListener("click", () => {
          tabDart.classList.add("active");
          tabJson.classList.remove("active");
          codeDart.classList.add("active");
          codeJson.classList.remove("active");
          updateLineNumbersForElement(codeDart);
          if (statusLang) statusLang.innerHTML = "Dart 3.x &bull; UTF-8";
        });

        tabJson.addEventListener("click", () => {
          tabJson.classList.add("active");
          tabDart.classList.remove("active");
          codeJson.classList.add("active");
          codeDart.classList.remove("active");
          updateLineNumbersForElement(codeJson);
          if (statusLang) statusLang.innerHTML = "JSON &bull; UTF-8";
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
          const cogIcon = window.Icons ? window.Icons.cog("icon-spin") : '<i class="fas fa-cog fa-spin"></i>';
          terminalOutput.innerHTML = `
            <div class="term-line prompt-line">$ flutter run -d production --profile</div>
            <div class="term-line info-line">${cogIcon} Initializing Dart VM & Clean Architecture kernel...</div>
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
              toggleActions: "play none none none",
            },
            y: 35,
            autoAlpha: 0,
            duration: 0.85,
            stagger: 0.16,
            ease: "power2.out",
            clearProps: "transform",
          });
        }
      }

      // 5. 3D Mouse Parallax & Depth Tilt on Biometric Avatar Card
      const layerBg = document.getElementById("bio-layer-bg");
      const layerPerson = document.getElementById("bio-layer-person");

      if (bioCard && layerBg && layerPerson) {
        let rafId = null;
        let targetX = 0;
        let targetY = 0;
        let targetZ = 0; // Smooth 3D depth pop
        let currentX = 0;
        let currentY = 0;
        let currentZ = 0;

        const updateParallax = () => {
          // Continuous physics lerp for all 3 axes
          currentX += (targetX - currentX) * 0.085;
          currentY += (targetY - currentY) * 0.085;
          currentZ += (targetZ - currentZ) * 0.085;

          // 1. Background layer moves opposite to mouse (depth)
          layerBg.style.transform = `scale(1.14) translate3d(${-currentX * 14}px, ${-currentY * 14}px, 0)`;

          // 2. Person layer moves with mouse & floats forward in 3D smoothly
          layerPerson.style.transform = `translate3d(${currentX * 16}px, ${currentY * 16}px, ${currentZ}px)`;

          // 3. Card 3D tilt
          bioCard.style.transform = `perspective(900px) rotateY(${currentX * 5.5}deg) rotateX(${-currentY * 5.5}deg)`;

          const isMoving =
            Math.abs(targetX - currentX) > 0.0005 ||
            Math.abs(targetY - currentY) > 0.0005 ||
            Math.abs(targetZ - currentZ) > 0.01;

          if (isMoving) {
            rafId = requestAnimationFrame(updateParallax);
          } else {
            // Settle smoothly to exact rest state with zero abrupt jump
            currentX = targetX;
            currentY = targetY;
            currentZ = targetZ;
            layerBg.style.transform = `scale(1.14) translate3d(${-currentX * 14}px, ${-currentY * 14}px, 0)`;
            layerPerson.style.transform = `translate3d(${currentX * 16}px, ${currentY * 16}px, ${currentZ}px)`;
            bioCard.style.transform = `perspective(900px) rotateY(${currentX * 5.5}deg) rotateX(${-currentY * 5.5}deg)`;
            bioCard.style.willChange = "auto";
            rafId = null;
          }
        };

        let cardRect = null;
        const updateCardRect = () => {
          cardRect = bioCard.getBoundingClientRect();
        };

        bioCard.addEventListener("mouseenter", () => {
          updateCardRect();
          bioCard.style.willChange = "transform";
          targetZ = 20; // Smoothly lift forward in 3D
          if (!rafId) {
            rafId = requestAnimationFrame(updateParallax);
          }
        });

        bioCard.addEventListener("mousemove", (e) => {
          if (!cardRect) updateCardRect();
          // Normalize coordinates: -1 to +1 using cached cardRect
          targetX = ((e.clientX - cardRect.left) / cardRect.width) * 2 - 1;
          targetY = ((e.clientY - cardRect.top) / cardRect.height) * 2 - 1;
          targetZ = 20;

          if (!rafId) {
            rafId = requestAnimationFrame(updateParallax);
          }
        });

        bioCard.addEventListener("mouseleave", () => {
          cardRect = null;
          // Smoothly glide everything back to resting position (0, 0, 0)
          targetX = 0;
          targetY = 0;
          targetZ = 0;
          if (!rafId) {
            rafId = requestAnimationFrame(updateParallax);
          }
        });
      }

      // 6. Viewport-Aware On-Demand State (IntersectionObserver & Visibility)
      HomeController.isAboutActive = false;
      this.cleanupAboutSection();

      if (window.IntersectionObserver) {
        this._aboutObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              const isVisible = entry.isIntersecting && !document.hidden;
              HomeController.isAboutActive = isVisible;
              if (isVisible) {
                aboutSection.classList.add("about-in-view");
                aboutSection.classList.remove("about-paused");
              } else {
                aboutSection.classList.remove("about-in-view");
                aboutSection.classList.add("about-paused");
              }
            });
          },
          { rootMargin: "80px 0px 80px 0px", threshold: 0 }
        );
        this._aboutObserver.observe(aboutSection);

        this._aboutVisibilityHandler = () => {
          if (document.hidden) {
            HomeController.isAboutActive = false;
            aboutSection.classList.remove("about-in-view");
            aboutSection.classList.add("about-paused");
          } else {
            const rect = aboutSection.getBoundingClientRect();
            const inView = rect.top < (window.innerHeight + 80) && rect.bottom > -80;
            HomeController.isAboutActive = inView;
            if (inView) {
              aboutSection.classList.add("about-in-view");
              aboutSection.classList.remove("about-paused");
            }
          }
        };
        document.addEventListener("visibilitychange", this._aboutVisibilityHandler);
      }
    }

    /**
     * Cleans up About section observer and visibility handlers preventing memory leaks
     */
    static cleanupAboutSection() {
      if (this._aboutObserver) {
        this._aboutObserver.disconnect();
        this._aboutObserver = null;
      }
      if (this._aboutVisibilityHandler) {
        document.removeEventListener("visibilitychange", this._aboutVisibilityHandler);
        this._aboutVisibilityHandler = null;
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
