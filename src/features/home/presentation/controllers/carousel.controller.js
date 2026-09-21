/**
 * @file carousel.controller.js
 * @description Controller managing 3D Cylinder GSAP Carousel, animations, title sync & interactions.
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

      const componentEl = $("#projects-carousel-section");
      const titleTrack = $("#carousel-title-track");
      const cylinder = $("#carousel-cylinder");

      titleTrack.empty();
      cylinder.empty();

      if (!projects || projects.length === 0) return;

      // Exactly 4 items alternating between the featured projects
      const p1 = projects[0];
      const p2 = projects[1] || projects[0];
      const fourProjects = [p1, p2, p1, p2];

      // 2. Render Title Track & 3D Cards
      fourProjects.forEach((project, index) => {
        const isLinker = project.id === "linker" || index % 2 === 0;
        const displayTitle = project.bigTitle || project.title;
        const displayCategory = project.category || "";
        const viewText = project.viewProject || "View Project Details";
        const titleBtnClass = isLinker ? "title-btn-linker" : "title-btn-automation";

        // Title Zone Item
        const titleHTML = `
          <div class="carousel-title-item" data-index="${index}">
            <span class="carousel-title-category">${displayCategory}</span>
            <a href="${project.link}" class="carousel-title-link" aria-label="${viewText} - ${displayTitle}" title="${viewText}">
              <h2 class="carousel-title-heading">${displayTitle}</h2>
              <span class="carousel-title-nav-btn ${titleBtnClass}">
                <i class="fas fa-arrow-up-right-from-square"></i>
              </span>
            </a>
          </div>
        `;
        titleTrack.append(titleHTML);

        // 3D Card Item
        const cardClass = isLinker ? "project-card linker-card" : "project-card semanticcut-card";
        const thumbClass = isLinker ? "linker-thumb" : "automation-thumb";
        const typeBadgeText = project.typeBadge || (isLinker ? "Mobile App • iOS & Android" : "AI Automation Pipeline");
        const typeIcon = project.typeBadgeIcon || (isLinker ? "fas fa-mobile-screen-button" : "fas fa-robot");
        const badgeClass = project.badgeClass || (isLinker ? "mobile-badge" : "automation-badge");

        const tagsHTML = project.tags
          ? project.tags.map((tag) => `<span>${tag}</span>`).join("")
          : "";

        const cardHTML = `
          <div class="carousel-item" carousel="item" data-index="${index}">
            <a href="${project.link}" class="${cardClass}">
              <div class="project-thumbnail-wrapper ${thumbClass}">
                <img src="${project.thumbnail}" alt="${project.title}">
              </div>
              <div class="project-info">
                <div class="project-header-row">
                  <span class="project-badge ${badgeClass}">
                    <span class="pulse-dot ${isLinker ? "linker-dot" : ""}"></span>
                    <i class="${typeIcon}"></i>
                    <span>${typeBadgeText}</span>
                  </span>
                  ${displayCategory ? `<span class="project-sub-category">${displayCategory}</span>` : ""}
                </div>
                <h4>${project.title}</h4>
                <p>${project.description}</p>
                <div class="tech-tags">${tagsHTML}</div>
                <span class="view-project-btn">
                  ${viewText} <i class="fas fa-arrow-right"></i>
                </span>
              </div>
            </a>
          </div>
        `;
        cylinder.append(cardHTML);
      });

      // 3. Setup 3D Geometry and GSAP ScrollTrigger
      this.setupAnimation(componentEl);
    }

    /**
     * Sets up GSAP ScrollTrigger timeline and controls
     * @param {jQuery} componentEl
     */
    static setupAnimation(componentEl) {
      const itemEl = componentEl.find("[carousel='item']");
      const titleTrack = componentEl.find("#carousel-title-track");
      const nextBtn = $("#carousel-next");
      const prevBtn = $("#carousel-prev");

      const itemCount = 4;
      let activeIndex = 0;
      const pinDistance = 2400;

      // Cache card nodes and child references to eliminate DOM traversing during scroll
      const cardNodes = itemEl.toArray().map((el, i) => ({
        wrapper: el,
        card: el.querySelector(".project-card"),
        index: i,
        isActive: false,
        lastZIndex: -1
      }));

      function updateControls(index) {
        activeIndex = index;
        prevBtn.toggleClass("is-disabled", index === 0);
        nextBtn.toggleClass("is-disabled", index === itemCount - 1);
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

          if (isMobile) {
            // Drop filter on mobile to eliminate rasterization and compositor bottlenecks
            if (item.wrapper.style.filter) {
              item.wrapper.style.filter = "";
            }
          } else {
            item.wrapper.style.filter = cardProps.filter;
          }

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
        if (titleTrack[0]) {
          titleTrack[0].style.transform = `translate3d(0px, ${titleY}px, 0px)`;
        }
      }

      // Initial stage placement
      updateStage(0);
      updateControls(0);

      const isMobile = window.innerWidth <= 768;

      // GSAP ScrollTrigger Timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: componentEl[0],
          start: "top top",
          end: `+=${pinDistance}`,
          pin: true,
          scrub: isMobile ? true : 0.6,
          anticipatePin: isMobile ? 0 : 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            updateStage(self.progress);
            const idx = Math.min(Math.round(self.progress * 3), 3);
            if (idx !== activeIndex) {
              updateControls(idx);
            }
          }
        }
      });

      tl.to({}, { duration: 30, ease: "none" });
      currentCarouselTimeline = tl;

      function scrollToStep(targetIndex) {
        if (!tl.scrollTrigger) return;
        const startY = tl.scrollTrigger.start;
        const targetY = startY + (targetIndex / 3) * pinDistance;
        $("html, body").stop().animate({ scrollTop: targetY }, 400);
      }

      // Arrow navigation
      nextBtn.off("click").on("click", function () {
        if (activeIndex < 3) {
          scrollToStep(activeIndex + 1);
        }
      });

      prevBtn.off("click").on("click", function () {
        if (activeIndex > 0) {
          scrollToStep(activeIndex - 1);
        }
      });

      // Card clicks
      itemEl.off("click").on("click", function (e) {
        const clickedIndex = $(this).data("index");
        const targetUrl = $(this).find("a.project-card").attr("href");
        const isDirectAction = $(e.target).closest(".view-project-btn").length > 0;
        const isCardActive =
          clickedIndex === activeIndex ||
          $(this).find(".project-card").hasClass("is-active");

        if (isDirectAction) {
          e.preventDefault();
          e.stopPropagation();
          if (targetUrl) window.location.href = targetUrl;
          return;
        }

        if (isCardActive) {
          e.preventDefault();
          if (targetUrl) window.location.href = targetUrl;
        } else {
          e.preventDefault();
          scrollToStep(clickedIndex);
        }
      });

      // Title track link clicks
      titleTrack.find(".carousel-title-link").off("click").on("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        const targetUrl = $(this).attr("href");
        if (targetUrl) window.location.href = targetUrl;
      });

      ScrollTrigger.refresh();

      // Window resize debouncing
      window.removeEventListener("resize", CarouselController.handleResize);
      window.addEventListener("resize", CarouselController.handleResize);
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
    }
  }

  exports.CarouselController = CarouselController;
})(window.Portfolio.presentation.controllers);
