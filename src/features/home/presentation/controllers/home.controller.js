/**
 * @file home.controller.js
 * @description Page Controller for the Home Landing Page (home.html).
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
  let heroMatchMediaInstance = null;

  class HomeController {
    static isAboutActive = false;
    static _aboutObserver = null;
    static _aboutVisibilityHandler = null;

    /**
     * Cleans up any existing Space Hero GSAP Timeline and ScrollTrigger,
     * resetting element transforms to a clean initial state.
     */
    static cleanupSpaceHero() {
      if (heroMatchMediaInstance) {
        heroMatchMediaInstance.revert();
        heroMatchMediaInstance = null;
      }
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
     */
    static handlePageShow() {
      if (typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.refresh();
        requestAnimationFrame(() => {
          ScrollTrigger.refresh();
          ScrollTrigger.update();
        });
      }
    }

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

      if (!isBackForward && !window.location.hash) window.scrollTo(0, 0);

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

      // Early DOM translation pass if dictionary is already synchronously loaded in head (eliminates layout shift)
      if (typeof window.translations !== "undefined" && LocalizationUseCase) {
        LocalizationUseCase.translateDOM(window.translations, "home-page");
      }

      // 8.1 Initialize Cyberpunk Skills Matrix Drawer
      this.setupSkillsDrawer();

      // 9. Load initial language & render Carousel 3D cards (Section 3 - Bottom)
      await this.switchLanguage(activeLang);
      this.prepareNearSection("about-section", () => {
        this.setupCyberAboutSection();
        window.ScrollTrigger?.refresh();
      });
      this.prepareNearSection("projects-carousel-section", () => this.mountProjects());

      // 10. Setup smooth navigation to projects
      this.setupProjectsNavLink();

      // 11. Sort and recalibrate all GSAP ScrollTriggers in DOM order
      if (typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.sort();
        ScrollTrigger.refresh();
      }

      // Handle direct landing with hash (#projects-carousel-section)
      this.handleHashNavigation();

      // Initialize Cyber Start Experience & Audio Warning Overlay
      this.setupStartExperienceOverlay();
    }

    static prepareNearSection(id, prepare) {
      const section = document.getElementById(id);
      if (!section) return;
      if (!window.IntersectionObserver) {
        prepare();
        return;
      }
      const observer = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        prepare();
      }, { rootMargin: "350px 0px" });
      observer.observe(section);
    }

    static mountProjects() {
      if (this.projectsMounted || !this.projectsData) return;
      this.projectsMounted = true;
      CarouselController.init(this.projectsData);
    }

    /**
     * Initializes the full-screen "Start Experience / Initialize Audio" entrance overlay
     */
    static setupStartExperienceOverlay() {
      const overlay = document.getElementById("cyber-start-overlay");
      const startBtn = document.getElementById("btn-start-experience");
      const skipBtn = document.getElementById("btn-skip-audio");

      // If the experience was already started in this session, bypass overlay
        if (sessionStorage.getItem('experience_started') === 'true') {
          const AudioService = window.AudioService;
          // Restore the saved mute preference (don't force unmute)
          const savedMuted = localStorage.getItem('portfolio_audio_muted') === 'true';
          if (AudioService) {
            // Sync Howler mute state with saved preference
            AudioService.setMuted(savedMuted);
            // Resume BGM if user had started unmuted
            if (!savedMuted) {
              AudioService.playBGM();
            }
          }
          if (window.AppbarComponent && typeof window.AppbarComponent.updateAudioButtonUI === 'function') {
            window.AppbarComponent.updateAudioButtonUI(savedMuted);
          }
          if (overlay) overlay.remove();
          return;
        }

        if (!overlay || !startBtn) return;

      const AudioService = window.AudioService;

      // Handle "START EXPERIENCE" click (explicit user activation gesture)
      startBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        // 1. Explicitly resume Howler AudioContext
        if (typeof Howler !== "undefined" && Howler.ctx && Howler.ctx.state === "suspended") {
          Howler.ctx.resume().catch(() => {});
        }

        // 2. Set global mute state to FALSE & unlock audio
        if (AudioService) {
          AudioService.setMuted(false);
          AudioService.play("hologram-on");
          AudioService.playBGM();
        }

        // Mark session as started so overlay won't show again on refresh
        sessionStorage.setItem('experience_started', 'true');

        // 3. Update Appbar icon to 'Volume High' state
        if (AppbarComponent && typeof AppbarComponent.updateAudioButtonUI === "function") {
          AppbarComponent.updateAudioButtonUI(false);
        }

        // 4. Fade out overlay smoothly with GSAP
        if (typeof gsap !== "undefined") {
          gsap.to(overlay, {
            autoAlpha: 0,
            scale: 1.04,
            duration: 0.45,
            ease: "power2.inOut",
            onComplete: () => overlay.remove()
          });
        } else {
          overlay.style.opacity = "0";
          overlay.style.pointerEvents = "none";
          setTimeout(() => overlay.remove(), 450);
        }
      });

      // Handle "PROCEED MUTED" click
      if (skipBtn) {
        skipBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();

          if (AudioService) {
            AudioService.setMuted(true);
          }
          // Mark session as started (muted) so overlay won't show again on refresh
          sessionStorage.setItem('experience_started', 'true');
          if (AppbarComponent && typeof AppbarComponent.updateAudioButtonUI === "function") {
            AppbarComponent.updateAudioButtonUI(true);
          }
          if (typeof gsap !== "undefined") {
            gsap.to(overlay, {
              autoAlpha: 0,
              duration: 0.35,
              ease: "power2.inOut",
              onComplete: () => overlay.remove()
            });
          } else {
            overlay.remove();
          }
        });
      }
    }

    /** Pins the hero while the spaceship flies across the horizon. */
    static setupSpaceHeroScrollSequence() {
      if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

      const heroWrapper = document.getElementById("space-hero-pin-wrapper");
      const spaceship = document.getElementById("space-vessel");
      const name = document.getElementById("text");
      const subtitle = heroWrapper?.querySelector("#subtitle");
      if (!heroWrapper || !spaceship || !name || !subtitle) return;

      const fullName = name.textContent;
      this.cleanupSpaceHero();
      name.textContent = fullName;
      name.closest("h1")?.setAttribute("aria-label", fullName);
      gsap.registerPlugin(ScrollTrigger);

      let visibleCharacters = 0;
      const renderName = (progress, typingEnd, playSound = false) => {
        const fraction = Math.min(1, Math.max(0, (progress - 0.05) / (typingEnd - 0.05)));
        const count = Math.floor(fullName.length * fraction);
        if (playSound && count !== visibleCharacters) {
          window.AudioService?.playThrottled("typing-tick", 60);
        }
        visibleCharacters = count;
        const typed = fullName.slice(0, count);
        if (name.textContent !== typed) name.textContent = typed;
      };

      const animateIntro = (timeline, revealAt) => {
        timeline.fromTo(subtitle, { autoAlpha: 0, y: 12 }, {
          autoAlpha: 1,
          y: 0,
          duration: 0.16,
          ease: "power2.out"
        }, revealAt);
        renderName(timeline.scrollTrigger.progress, revealAt - 0.02);
        return () => { name.textContent = fullName; };
      };

      // Smooth scroll click on cyber scroll indicator (desktop only)
      const scrollIndicator = document.getElementById("cyber-scroll-indicator");
      if (scrollIndicator && !scrollIndicator.dataset.hasClickListener) {
        scrollIndicator.dataset.hasClickListener = "true";
        scrollIndicator.addEventListener("click", () => {
          const aboutSection = document.getElementById("about-section");
          if (aboutSection) {
            aboutSection.scrollIntoView({
              behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
            });
          }
        });
      }

      // Responsive GSAP matchMedia (Rule #2: Graceful Degradation for Mobile)
      const mm = gsap.matchMedia();
      heroMatchMediaInstance = mm;

      // Desktop flyby.
      mm.add("(min-width: 769px) and (prefers-reduced-motion: no-preference)", () => {
        if (spaceship) {
          gsap.set(spaceship, { autoAlpha: 0, x: -450, y: 160, rotation: 16, scale: 0.75 });
        }

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
            onUpdate: ({ progress }) => renderName(progress, 0.48, true),
            onRefresh: ({ progress }) => renderName(progress, 0.48)
          }
        });
        heroTimelineInstance = heroTl;
        const restoreName = animateIntro(heroTl, 0.50);

        if (scrollIndicator) {
          heroTl.to(scrollIndicator, {
            autoAlpha: 0,
            y: 10,
            duration: 0.12,
            ease: "power1.out"
          }, 0.01);
        }

        // Spaceship swoops across horizon
        if (spaceship) {
          heroTl.to(spaceship, {
            autoAlpha: 1,
            duration: 0.08,
            ease: "power1.in",
            onStart: () => {
              if (window.AudioService) window.AudioService.play("spaceship-flyby");
            }
          }, 0.60)
          .to(spaceship, {
            x: () => window.innerWidth + 450,
            y: 20,
            rotation: -6,
            scale: 1.05,
            duration: 0.38,
            ease: "power1.inOut"
          }, 0.60);
        }

        heroTl.to({}, { duration: 0.05 }, 0.98);
        return restoreName;
      });

      // Branch B: Mobile (Compact, lightweight, smaller spaceship, fast natural touch response)
      mm.add("(width < 769px) and (prefers-reduced-motion: no-preference)", () => {
        if (spaceship) {
          gsap.set(spaceship, { autoAlpha: 0, x: -280, y: 70, rotation: 8, scale: 0.75 });
        }

        const heroTl = gsap.timeline({
          scrollTrigger: {
            id: "spaceHeroTrigger",
            trigger: heroWrapper,
            start: "top top",
            end: "+=170%", // Longer travel on mobile so user clearly sees the spaceship fly
            pin: true,
            scrub: 0.8, // Smooth cinematic scrub avoiding jumpy thumb flicks
            refreshPriority: 10,
            invalidateOnRefresh: true,
            onUpdate: ({ progress }) => renderName(progress, 0.42, true),
            onRefresh: ({ progress }) => renderName(progress, 0.42)
          }
        });
        heroTimelineInstance = heroTl;
        const restoreName = animateIntro(heroTl, 0.44);

        if (scrollIndicator) {
          heroTl.to(scrollIndicator, {
            autoAlpha: 0,
            y: 8,
            duration: 0.1,
            ease: "power1.out"
          }, 0.01);
        }

        // Spaceship swoops slowly & gracefully from 0.46 all the way to 0.98
        if (spaceship) {
          heroTl.to(spaceship, {
            autoAlpha: 1,
            duration: 0.10,
            ease: "power1.in",
            onStart: () => {
              if (window.AudioService) window.AudioService.play("spaceship-flyby");
            }
          }, 0.46)
          .to(spaceship, {
            x: () => window.innerWidth + 280,
            y: 25,
            rotation: -4,
            scale: 0.9,
            duration: 0.52,
            ease: "power1.inOut"
          }, 0.46);
        }

        return restoreName;
      });
    }

    /**
     * Intercepts clicks on the Projects nav link while on Home page
     * to smoothly scroll directly to the 3D Carousel start.
     */
    static setupProjectsNavLink() {
      const projectsLinks = document.querySelectorAll('a[href="#projects-carousel-section"]');
      projectsLinks.forEach((projectsLink) => {
        projectsLink.addEventListener("click", (e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
          e.preventDefault();
          this.mountProjects();
          CarouselController.scrollToCarousel(0);
          if (window.location.hash !== "#projects-carousel-section") {
            history.pushState(null, "", "#projects-carousel-section");
          }
        });
      });

      window.addEventListener("hashchange", () => {
        if (window.location.hash === "#projects-carousel-section") {
          this.mountProjects();
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
        this.mountProjects();
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
          onEnter: () => {
            if (!carousel.classList.contains("carousel-static") &&
                !matchMedia("(prefers-reduced-motion: reduce)").matches) {
              appbar.classList.add("appbar-hidden");
            }
          },
          onLeave: () => appbar.classList.remove("appbar-hidden"),
          onEnterBack: () => {
            if (!carousel.classList.contains("carousel-static") &&
                !matchMedia("(prefers-reduced-motion: reduce)").matches) {
              appbar.classList.add("appbar-hidden");
            }
          },
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
          if (window.AudioService) window.AudioService.play("warp-whoosh");

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
            <div class="term-line info-line">${cogIcon} [VM] Initializing Dart 3.x Sound Null Safety &amp; Clean Architecture kernel...</div>
          `;

          // Step 1: Resolving dependencies
          setTimeout(() => {
            const line1 = document.createElement("div");
            line1.className = "term-line info-line";
            line1.innerHTML = `[SYS] Resolving core layers: flutter_bloc, get_it, dartz, supabase_flutter... <span style="color:#00e696;">[OK]</span>`;
            terminalOutput.appendChild(line1);
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
            if (window.AudioService) window.AudioService.play("typing-tick");
          }, 400);

          // Step 2: Security & Cloud
          setTimeout(() => {
            const line2 = document.createElement("div");
            line2.className = "term-line info-line";
            line2.innerHTML = `[SEC] Enforcing PostgreSQL RLS policies &amp; biometric keychain vaults... <span style="color:#00e696;">[SECURE]</span>`;
            terminalOutput.appendChild(line2);
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
            if (window.AudioService) window.AudioService.play("typing-tick");
          }, 800);

          // Step 3: AI Automation pipelines
          setTimeout(() => {
            const line3 = document.createElement("div");
            line3.className = "term-line info-line";
            line3.innerHTML = `[AI] Connecting Python Playwright engine &amp; LLM automation worker... <span style="color:#a855f7;">[ONLINE]</span>`;
            terminalOutput.appendChild(line3);
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
            if (window.AudioService) window.AudioService.play("typing-tick");
          }, 1200);

          // Step 4: Compositor Performance
          setTimeout(() => {
            const line4 = document.createElement("div");
            line4.className = "term-line info-line";
            line4.innerHTML = `[PERF] Compositor frame budget verified: 120 FPS // 0 dropped frames <span style="color:#00e696;">[OPTIMAL]</span>`;
            terminalOutput.appendChild(line4);
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
            if (window.AudioService) window.AudioService.play("typing-tick");
          }, 1600);

          // Step 5: Build Successful Finish
          setTimeout(() => {
            const line5 = document.createElement("div");
            line5.className = "term-line success-line";
            line5.innerHTML = `[BUILD SUCCESSFUL] 🚀 Ahmed Mansour is compiled and ready for deployment!`;
            terminalOutput.appendChild(line5);

            const line6 = document.createElement("div");
            line6.className = "term-line accent-line";
            line6.innerHTML = `&gt; Enterprise Clean Architecture | Ready for Saudi Arabia &amp; GCC tech missions.`;
            terminalOutput.appendChild(line6);

            if (termStatus) {
              termStatus.textContent = "[READY]";
              termStatus.style.color = "#00e696";
            }
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
            if (window.AudioService) window.AudioService.play("success-chime");
            isCompiling = false;
          }, 2000);
        });
      }

      // 4. GSAP ScrollTrigger Entrance Animation
      const motion = matchMedia("(prefers-reduced-motion: reduce)");
      if (!motion.matches && typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
        gsap.registerPlugin(ScrollTrigger);

        if (bioCard && ideContainer) {
          gsap.from([bioCard, ideContainer], {
            scrollTrigger: {
              trigger: aboutSection,
              start: "top 80%",
              toggleActions: "play none none none",
              onEnter: () => {
                if (window.AudioService) window.AudioService.play("laser-scan");
              }
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

      // 5. 3D Mouse & Touch Parallax / Depth Tilt on Biometric Avatar Card
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
          if (motion.matches || document.documentElement.dataset.effectsQuality === "light") {
            layerBg.style.transform = "";
            layerPerson.style.transform = "";
            bioCard.style.transform = "";
            bioCard.style.willChange = "";
            rafId = null;
            return;
          }
          // Continuous physics lerp for all 3 axes
          currentX += (targetX - currentX) * 0.085;
          currentY += (targetY - currentY) * 0.085;
          currentZ += (targetZ - currentZ) * 0.085;

          // 1. Background layer moves opposite to input (depth)
          layerBg.style.transform = `scale(1.14) translate3d(${-currentX * 14}px, ${-currentY * 14}px, 0)`;

          // 2. Person layer moves with input & floats forward in 3D smoothly
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

        // Desktop Mouse Handlers
        bioCard.addEventListener("mouseenter", () => {
          updateCardRect();
          bioCard.style.willChange = "transform";
          targetZ = 20; // Smoothly lift forward in 3D
          if (window.AudioService) {
            window.AudioService.playThrottled("hologram-on", 500);
          }
          if (!rafId) {
            rafId = requestAnimationFrame(updateParallax);
          }
        });

        bioCard.addEventListener("mousemove", (e) => {
          if (!cardRect) updateCardRect();
          targetX = ((e.clientX - cardRect.left) / cardRect.width) * 2 - 1;
          targetY = ((e.clientY - cardRect.top) / cardRect.height) * 2 - 1;
          targetZ = 20;

          if (!rafId) {
            rafId = requestAnimationFrame(updateParallax);
          }
        });

        bioCard.addEventListener("mouseleave", () => {
          cardRect = null;
          targetX = 0;
          targetY = 0;
          targetZ = 0;
          if (!rafId) {
            rafId = requestAnimationFrame(updateParallax);
          }
        });

        // Mobile Touch Handlers (Restores touch interactive movement requested by user)
        bioCard.addEventListener("touchstart", (e) => {
          updateCardRect();
          bioCard.style.willChange = "transform";
          if (window.AudioService) {
            window.AudioService.playThrottled("hologram-on", 500);
          }
          const touch = e.touches[0];
          if (touch && cardRect) {
            targetX = ((touch.clientX - cardRect.left) / cardRect.width) * 2 - 1;
            targetY = ((touch.clientY - cardRect.top) / cardRect.height) * 2 - 1;
            targetZ = 22;
          }
          if (!rafId) {
            rafId = requestAnimationFrame(updateParallax);
          }
        }, { passive: true });

        bioCard.addEventListener("touchmove", (e) => {
          const touch = e.touches[0];
          if (touch && cardRect) {
            targetX = ((touch.clientX - cardRect.left) / cardRect.width) * 2 - 1;
            targetY = ((touch.clientY - cardRect.top) / cardRect.height) * 2 - 1;
            targetZ = 22;
          }
          if (!rafId) {
            rafId = requestAnimationFrame(updateParallax);
          }
        }, { passive: true });

        const resetTouch = () => {
          cardRect = null;
          targetX = 0;
          targetY = 0;
          targetZ = 0;
          if (!rafId) {
            rafId = requestAnimationFrame(updateParallax);
          }
        };

        bioCard.addEventListener("touchend", resetTouch, { passive: true });
        bioCard.addEventListener("touchcancel", resetTouch, { passive: true });
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
     * Initializes the Cyberpunk Skills Matrix & Technical Arsenal Drawer
     * Handles open/close events, keyboard Escape dismiss, backdrop clicks, and audio cues.
     */
    static setupSkillsDrawer() {
      const drawer = document.getElementById("skills-drawer");
      const openBtn = document.getElementById("open-skills-drawer-btn");
      const navSkillsBtn = document.getElementById("nav-skills-btn");
      const closeBtn = document.getElementById("skills-drawer-close-btn");
      const backdrop = drawer ? drawer.querySelector(".skills-drawer-backdrop") : null;

      if (!drawer) return;

      const openDrawer = (e) => {
        if (e) e.preventDefault();
        drawer.classList.add("is-active");
        drawer.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        if (window.AudioService) {
          window.AudioService.play("warp-whoosh");
        }
        if (closeBtn) {
          closeBtn.focus();
        }
      };

      const closeDrawer = (e) => {
        if (e) e.preventDefault();
        drawer.classList.remove("is-active");
        drawer.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
        if (window.AudioService) {
          window.AudioService.play("ui-click");
        }
      };

      if (openBtn) {
        openBtn.addEventListener("click", openDrawer);
      }

      if (navSkillsBtn) {
        navSkillsBtn.addEventListener("click", openDrawer);
      }

      if (closeBtn) {
        closeBtn.addEventListener("click", closeDrawer);
      }

      if (backdrop) {
        backdrop.addEventListener("click", closeDrawer);
      }

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && drawer.classList.contains("is-active")) {
          closeDrawer();
        }
      });
    }

    /**
     * Switches language and re-renders page content & 3D carousel
     * @param {string} lang - 'en' or 'ar'
     */
    static async switchLanguage(lang) {
      try {
        const translations = await LanguageRepository.loadLanguage(lang);
        const { pageTranslations } = LocalizationUseCase.translateDOM(translations, "home-page");

        // Rebuild the sequence with the translated heading.
        this.setupSpaceHeroScrollSequence();

        if (pageTranslations?.projectsData) {
          this.projectsData = pageTranslations.projectsData;
          CarouselController.reserveSpace(this.projectsData.length);
          if (this.projectsMounted) CarouselController.init(this.projectsData);
        }

        if (typeof ScrollTrigger !== "undefined") {
          ScrollTrigger.refresh();
        }
      } catch (err) {
        console.error("Failed to switch language:", err);
      }
    }
  }

  exports.HomeController = HomeController;
})(window.Portfolio.presentation.controllers);
