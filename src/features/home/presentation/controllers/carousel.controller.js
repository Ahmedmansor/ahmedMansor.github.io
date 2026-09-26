/**
 * @file carousel.controller.js
 * @description Controller managing 3D Cylinder GSAP Carousel, animations, title sync & interactions.
 * Pure Vanilla JS implementation (zero jQuery dependency).
 * Part of Clean Architecture (Presentation Layer Controller).
 */

window.Portfolio = window.Portfolio || {};
window.Portfolio.presentation = window.Portfolio.presentation || {};
window.Portfolio.presentation.controllers = window.Portfolio.presentation.controllers || {};

(function (exports) {
  "use strict";

  const CarouselGeometryUseCase = window.Portfolio.domain.usecases.CarouselGeometryUseCase;

  let currentCarouselTimeline = null;
  let activeScrollTriggerInstance = null;
  let resizeTimeout = null;

  class CarouselController {
    static isCarouselActive = false;
    static _observer = null;
    static _visibilityHandler = null;

    /**
     * Initializes and builds the 3D Cylinder Carousel
     * @param {Array<Object>} projects - Project list from localized dictionary
     */
    static init(projects) {
      if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
        gsap.registerPlugin(ScrollTrigger);
        ScrollTrigger.config({ ignoreMobileResize: true });
      }

      // 1. Clean up existing timeline and triggers
      this.cleanup();

      const componentEl = document.getElementById("projects-carousel-section");
      const titleTrack = document.getElementById("carousel-title-track");
      const cylinder = document.getElementById("carousel-cylinder");

      if (!componentEl || !titleTrack || !cylinder) return;

      titleTrack.innerHTML = "";
      cylinder.innerHTML = "";

      // Setup Viewport-Aware IntersectionObserver & Visibility handling
      this.setupIntersectionObserver(componentEl);

      if (!projects || projects.length === 0) return;

      // Exactly 4 items alternating between the featured projects
      const p1 = projects[0];
      const p2 = projects[1] || projects[0];
      const fourProjects = [p1, p2, p1, p2];

      // 2. Render Title Track & 3D Cards
      let titlesHTML = "";
      let cardsHTML = "";

      fourProjects.forEach((project, index) => {
        const isLinker = project.id === "linker" || index % 2 === 0;
        const displayTitle = project.bigTitle || project.title;
        const displayCategory = project.category || "";
        const viewText = project.viewProject || "View Project Details";
        const titleBtnClass = isLinker ? "title-btn-linker" : "title-btn-automation";

        // Title Zone Item
        titlesHTML += `
          <div class="carousel-title-item" data-index="${index}">
            <span class="carousel-title-category">${displayCategory}</span>
            <a href="${project.link}" class="carousel-title-link" aria-label="${viewText} - ${displayTitle}" title="${viewText}" data-sound-hover="ui-hover" data-sound-click="warp-whoosh">
              <h2 class="carousel-title-heading">${displayTitle}</h2>
              <span class="carousel-title-nav-btn ${titleBtnClass}" data-sound-hover="ui-hover">
                ${window.Icons ? window.Icons.arrowUpRightFromSquare() : '<i class="fas fa-arrow-up-right-from-square"></i>'}
              </span>
            </a>
          </div>
        `;

        // 3D Card Item
        const cardClass = isLinker ? "project-card linker-card" : "project-card semanticcut-card";
        const thumbClass = isLinker ? "linker-thumb" : "automation-thumb";
        const typeBadgeText = project.typeBadge || (isLinker ? "Mobile App • iOS & Android" : "AI Automation Pipeline");
        const typeIcon = project.typeBadgeIcon || (isLinker ? "fas fa-mobile-screen-button" : "fas fa-robot");
        const badgeIconHTML = window.Icons ? window.Icons.get(typeIcon) : `<i class="${typeIcon}"></i>`;
        const badgeClass = project.badgeClass || (isLinker ? "mobile-badge" : "automation-badge");

        const tagsHTML = project.tags
          ? project.tags.map((tag) => `<span>${tag}</span>`).join("")
          : "";

        cardsHTML += `
          <div class="carousel-item" carousel="item" data-index="${index}">
            <a href="${project.link}" class="${cardClass}" data-sound-hover="ui-hover" data-sound-click="warp-whoosh">
              <div class="project-thumbnail-wrapper ${thumbClass}">
                <img src="${project.thumbnail}" alt="${project.title}" width="600" height="340" loading="lazy" decoding="async">
              </div>
              <div class="project-info">
                <div class="project-header-row">
                  <span class="project-badge ${badgeClass}">
                    <span class="pulse-dot ${isLinker ? "linker-dot" : ""}"></span>
                    ${badgeIconHTML}
                    <span>${typeBadgeText}</span>
                  </span>
                  ${displayCategory ? `<span class="project-sub-category">${displayCategory}</span>` : ""}
                </div>
                <h4>${project.title}</h4>
                <p>${project.description}</p>
                <div class="tech-tags">${tagsHTML}</div>
                <span class="view-project-btn" data-sound-hover="ui-hover" data-sound-click="warp-whoosh">
                  ${viewText} ${window.Icons ? window.Icons.arrowRight() : '<i class="fas fa-arrow-right"></i>'}
                </span>
              </div>
            </a>
          </div>
        `;
      });

      titleTrack.innerHTML = titlesHTML;
      cylinder.innerHTML = cardsHTML;

      // 3. Setup 3D Geometry and GSAP ScrollTrigger
      this.setupAnimation(componentEl);
    }

    /**
     * Sets up GSAP ScrollTrigger timeline and controls
     * @param {HTMLElement} componentEl
     */
    static setupAnimation(componentEl) {
      const itemEls = componentEl.querySelectorAll("[carousel='item']");
      const titleTrackEl = componentEl.querySelector("#carousel-title-track");
      const nextBtn = document.getElementById("carousel-next");
      const prevBtn = document.getElementById("carousel-prev");

      const itemCount = 4;
      let activeIndex = 0;
      const pinDistance = 2400;

      // Cache card nodes and child references to eliminate DOM traversing during scroll
      const cardNodes = Array.from(itemEls).map((el, i) => ({
        wrapper: el,
        card: el.querySelector(".project-card"),
        index: i,
        isActive: false,
        lastZIndex: -1
      }));

      function updateControls(index) {
        activeIndex = index;
        if (prevBtn) prevBtn.classList.toggle("is-disabled", index === 0);
        if (nextBtn) nextBtn.classList.toggle("is-disabled", index === itemCount - 1);
      }

      function updateStage(progress) {
        const winWidth = window.innerWidth;
        const isMobile = winWidth <= 768;

        for (let i = 0; i < cardNodes.length; i++) {
          const item = cardNodes[i];
          const cardProps = CarouselGeometryUseCase.calculateCardTransform({
            index: item.index,
            progress,
            winWidth,
            isMobile
          });

          // Ultra-fast direct style assignments (GPU Compositor accelerated)
          item.wrapper.style.transform = cardProps.transform;
          item.wrapper.style.opacity = cardProps.opacity;

          if (item.lastZIndex !== cardProps.zIndex) {
            item.wrapper.style.zIndex = cardProps.zIndex;
            item.lastZIndex = cardProps.zIndex;
          }

          // Change-detection: only mutate classList when state actually flips
          if (item.card && item.isActive !== cardProps.isNearCenter) {
            item.isActive = cardProps.isNearCenter;
            item.card.classList.toggle("is-active", cardProps.isNearCenter);
          }
        }

        // Exact title track offset
        const titleItemHeight = CarouselGeometryUseCase.getTitleItemHeight(winWidth);
        const titleY = CarouselGeometryUseCase.calculateTitleOffset(progress, titleItemHeight);
        if (titleTrackEl) {
          titleTrackEl.style.transform = `translate3d(0px, ${titleY}px, 0px)`;
        }
      }

      // Initial stage placement
      updateStage(0);
      updateControls(0);

      const isMobile = window.innerWidth <= 768;

      // GSAP ScrollTrigger Timeline with smoothly scrubbed state (Eliminates wheel notches & jitter)
      const animState = { progress: 0 };
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: componentEl,
          start: "top top",
          end: "bottom bottom",
          scrub: isMobile ? true : 0.6,
          invalidateOnRefresh: true,
          onEnter: () => {
            const appbar = document.querySelector(".appbar");
            if (appbar) appbar.classList.add("appbar-hidden");
          },
          onLeave: () => {
            const appbar = document.querySelector(".appbar");
            if (appbar) appbar.classList.remove("appbar-hidden");
          },
          onEnterBack: () => {
            const appbar = document.querySelector(".appbar");
            if (appbar) appbar.classList.add("appbar-hidden");
          },
          onLeaveBack: () => {
            const appbar = document.querySelector(".appbar");
            if (appbar) appbar.classList.remove("appbar-hidden");
          }
        }
      });

      tl.to(animState, {
        progress: 1,
        ease: "none",
        duration: 1,
        onUpdate: () => {
          updateStage(animState.progress);
          const idx = Math.min(Math.round(animState.progress * 3), 3);
          if (idx !== activeIndex) {
            updateControls(idx);
            if (window.AudioService) window.AudioService.play("ratchet-step");
          }
        }
      });

      currentCarouselTimeline = tl;

      function scrollToStep(targetIndex) {
        if (!tl.scrollTrigger) return;
        const startY = tl.scrollTrigger.start;
        const endY = tl.scrollTrigger.end;
        const targetY = startY + (targetIndex / 3) * (endY - startY);
        window.scrollTo({ top: targetY, behavior: "smooth" });
      }

      // Arrow navigation (Vanilla JS)
      if (nextBtn) {
        nextBtn.onclick = () => {
          if (activeIndex < 3) {
            scrollToStep(activeIndex + 1);
            if (window.AudioService) window.AudioService.play("ratchet-step");
          }
        };
      }

      if (prevBtn) {
        prevBtn.onclick = () => {
          if (activeIndex > 0) {
            scrollToStep(activeIndex - 1);
            if (window.AudioService) window.AudioService.play("ratchet-step");
          }
        };
      }

      // Card clicks (Vanilla JS)
      itemEls.forEach((itemEl) => {
        itemEl.onclick = (e) => {
          const clickedIndex = parseInt(itemEl.dataset.index, 10);
          const cardEl = itemEl.querySelector("a.project-card");
          const targetUrl = cardEl ? cardEl.getAttribute("href") : null;
          const isDirectAction = e.target.closest(".view-project-btn") !== null;
          const isCardActive =
            clickedIndex === activeIndex ||
            (cardEl && cardEl.classList.contains("is-active"));

          if (isDirectAction) {
            e.preventDefault();
            e.stopPropagation();
            if (window.AudioService) window.AudioService.play("warp-whoosh");
            if (targetUrl) window.location.href = targetUrl;
            return;
          }

          if (isCardActive) {
            e.preventDefault();
            if (window.AudioService) window.AudioService.play("warp-whoosh");
            if (targetUrl) window.location.href = targetUrl;
          } else {
            e.preventDefault();
            if (window.AudioService) window.AudioService.play("ratchet-step");
            scrollToStep(clickedIndex);
          }
        };
      });

      // Title track link clicks (Vanilla JS)
      if (titleTrackEl) {
        const titleLinks = titleTrackEl.querySelectorAll(".carousel-title-link");
        titleLinks.forEach((link) => {
          link.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (window.AudioService) window.AudioService.play("warp-whoosh");
            const targetUrl = link.getAttribute("href");
            if (targetUrl) window.location.href = targetUrl;
          };
        });
      }

      ScrollTrigger.refresh();

      // Window resize debouncing
      window.removeEventListener("resize", CarouselController.handleResize);
      window.addEventListener("resize", CarouselController.handleResize);
    }

    /**
     * Programmatically scrolls user to the Carousel at a specific card index
     * @param {number} [targetIndex=0] - Card index to scroll to
     * @param {boolean} [smooth=true] - Whether to use smooth scrolling
     */
    static scrollToCarousel(targetIndex = 0, smooth = true) {
      const appbar = document.querySelector(".appbar");
      if (appbar) appbar.classList.add("appbar-hidden");

      if (currentCarouselTimeline && currentCarouselTimeline.scrollTrigger) {
        const startY = currentCarouselTimeline.scrollTrigger.start;
        const endY = currentCarouselTimeline.scrollTrigger.end;
        const targetY = startY + (targetIndex / 3) * (endY - startY);
        window.scrollTo({ top: targetY, behavior: smooth ? "smooth" : "auto" });
      } else {
        const section = document.getElementById("projects-carousel-section");
        if (section) section.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
      }
    }

    static handleResize() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (typeof ScrollTrigger !== "undefined") {
          ScrollTrigger.refresh();
        }
      }, 200);
    }

    /**
     * Cleans up timelines and scroll triggers
     */
    static cleanup() {
      if (currentCarouselTimeline) {
        if (currentCarouselTimeline.scrollTrigger) {
          currentCarouselTimeline.scrollTrigger.kill();
        }
        currentCarouselTimeline.kill();
        currentCarouselTimeline = null;
      }
      if (activeScrollTriggerInstance) {
        activeScrollTriggerInstance.kill();
        activeScrollTriggerInstance = null;
      }
      if (this._observer) {
        this._observer.disconnect();
        this._observer = null;
      }
      if (this._visibilityHandler) {
        document.removeEventListener("visibilitychange", this._visibilityHandler);
        this._visibilityHandler = null;
      }
    }

    /**
     * Initializes Viewport-Aware IntersectionObserver for the Carousel section
     * @param {HTMLElement} componentEl 
     */
    static setupIntersectionObserver(componentEl) {
      if (!window.IntersectionObserver || !componentEl) return;

      if (this._observer) {
        this._observer.disconnect();
        this._observer = null;
      }
      if (this._visibilityHandler) {
        document.removeEventListener("visibilitychange", this._visibilityHandler);
        this._visibilityHandler = null;
      }

      this._observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const isVisible = entry.isIntersecting && !document.hidden;
            CarouselController.isCarouselActive = isVisible;
            if (isVisible) {
              componentEl.classList.add("carousel-in-view");
              componentEl.classList.remove("carousel-paused");
            } else {
              componentEl.classList.remove("carousel-in-view");
              componentEl.classList.add("carousel-paused");
            }
          });
        },
        { rootMargin: "100px 0px 100px 0px", threshold: 0 }
      );

      this._observer.observe(componentEl);

      this._visibilityHandler = () => {
        if (document.hidden) {
          CarouselController.isCarouselActive = false;
          componentEl.classList.remove("carousel-in-view");
          componentEl.classList.add("carousel-paused");
        } else {
          const rect = componentEl.getBoundingClientRect();
          const inView = rect.top < (window.innerHeight + 100) && rect.bottom > -100;
          CarouselController.isCarouselActive = inView;
          if (inView) {
            componentEl.classList.add("carousel-in-view");
            componentEl.classList.remove("carousel-paused");
          }
        }
      };
      document.addEventListener("visibilitychange", this._visibilityHandler);
    }
  }

  exports.CarouselController = CarouselController;
})(window.Portfolio.presentation.controllers);
