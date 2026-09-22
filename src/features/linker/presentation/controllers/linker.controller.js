/**
 * @file linker.controller.js
 * @description Page Controller for the Linker EG Project Details Page (linker.html).
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

  const SWIPER_GALLERY_IDS = [
    "login-gallery",
    "registration-gallery",
    "profiles-gallery",
    "search-filter-gallery",
    "become-coach-gallery",
    "session-gallery"
  ];

  const CHARACTER_LIMIT = 110;
  let scrollListenerAttached = false;

  class LinkerController {
    /**
     * Initializes the Linker detail page
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

      this.setupImageLightbox();
      await this.switchLanguage(activeLang);
    }

    /**
     * Switches language and re-renders nav, galleries, and text
     * @param {string} lang
     */
    static async switchLanguage(lang) {
      try {
        const translations = await LanguageRepository.loadLanguage(lang);
        const { pageTranslations, commonTranslations } = LocalizationUseCase.translateDOM(
          translations,
          "project1-page"
        );

        // Rebuild feature navigation with translated titles
        this.buildFeatureNav(pageTranslations);
        this.setupFeatureNavLogic();

        // Render all 6 feature galleries
        this.renderGalleries(pageTranslations, commonTranslations);
        this.applySeeMoreLogic(commonTranslations);

        // Smooth lightweight scroll reveal
        this.setupScrollReveal();

        // Smart Video Lazy Loading & Auto-Play/Pause Observer
        this.setupVideoLazyLoading();
      } catch (err) {
        console.error("Failed to load Linker page language:", err);
      }
    }

    /**
     * Builds sticky feature navigation bar links
     * @param {Object} pageTranslations
     */
    static buildFeatureNav(pageTranslations = {}) {
      const nav = document.getElementById("feature-nav");
      if (!nav) return;
      const ul = nav.querySelector("ul");
      if (!ul) return;

      ul.innerHTML = "";
      const titles = pageTranslations.featureNavTitles || [
        "Secure and Easy Login and Logout System",
        "User Registration with Robust Validation",
        "The Complete User Journey: Guest, Player & Coach Views",
        "Advanced Search & Multi-Factor Filtering",
        "Full-Circle Application: From Player to Coach",
        "Core Interaction: Session Creation & Enrollment"
      ];

      titles.forEach((title, i) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = `#feature${i + 1}`;
        a.setAttribute("data-feature", i + 1);
        a.textContent = `${i + 1}. ${title}`;
        li.appendChild(a);
        ul.appendChild(li);
      });
    }

    /**
     * Attaches smooth scroll and active state highlighting on scroll to feature nav
     */
    static setupFeatureNavLogic() {
      const nav = document.getElementById("feature-nav");
      if (!nav) return;
      const navLinks = nav.querySelectorAll("a");
      const featureSections = Array.from({ length: 6 }, (_, i) =>
        document.getElementById(`feature${i + 1}`)
      );

      // Smooth scroll click handler
      navLinks.forEach((link) => {
        link.onclick = (e) => {
          e.preventDefault();
          const targetId = link.getAttribute("href").replace("#", "");
          const target = document.getElementById(targetId);
          if (target) {
            const navHeight = nav.offsetHeight;
            const rect = target.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const top = rect.top + scrollTop - navHeight - 10;
            window.scrollTo({ top, behavior: "smooth" });
          }
        };
      });

      // Highlight active nav item on scroll
      function onScroll() {
        const navHeight = nav.offsetHeight;
        let current = 0;
        featureSections.forEach((section, idx) => {
          if (section) {
            const sectionTop = section.getBoundingClientRect().top - navHeight - 20;
            if (sectionTop <= 0) current = idx;
          }
        });
        navLinks.forEach((link, idx) => {
          if (idx === current) {
            link.classList.add("active");
          } else {
            link.classList.remove("active");
          }
        });
      }

      if (!scrollListenerAttached) {
        window.addEventListener("scroll", onScroll);
        scrollListenerAttached = true;
      }
      onScroll();
    }

    /**
     * Populates all feature galleries from translation data
     * @param {Object} pageTranslations
     * @param {Object} commonTranslations
     */
    static renderGalleries(pageTranslations, commonTranslations) {
      if (!pageTranslations) return;

      const galleryMappings = [
        { id: "login-gallery", data: pageTranslations.loginGalleryData },
        { id: "registration-gallery", data: pageTranslations.registrationGalleryData },
        { id: "profiles-gallery", data: pageTranslations.profilesGalleryData },
        { id: "search-filter-gallery", data: pageTranslations.searchFilterGalleryData },
        { id: "become-coach-gallery", data: pageTranslations.becomeCoachGalleryData },
        { id: "session-gallery", data: pageTranslations.sessionGalleryData }
      ];

      galleryMappings.forEach(({ id, data }) => {
        this.createGallery(id, data || [], commonTranslations);
      });
    }

    /**
     * Builds DOM nodes for a single gallery container
     * @param {string} containerId
     * @param {Array<Object>} data
     * @param {Object} commonTranslations
     */
    static createGallery(containerId, data, commonTranslations = {}) {
      const galleryContainer = document.getElementById(containerId);
      if (!galleryContainer || !data) return;

      const isSwiper = galleryContainer.classList.contains("swiper-container");
      const wrapper = isSwiper
        ? galleryContainer.querySelector(".swiper-wrapper")
        : galleryContainer;

      if (isSwiper && wrapper) wrapper.innerHTML = "";
      if (!wrapper) return;

      data.forEach((itemData) => {
        const itemDiv = document.createElement("div");
        itemDiv.className = isSwiper ? "gallery-item swiper-slide" : "gallery-item";

        // Caption
        const captionP = document.createElement("p");
        captionP.className = "media-caption";
        captionP.innerHTML = itemData.caption;
        itemDiv.appendChild(captionP);

        // See More button if long text
        if (captionP.textContent.length > CHARACTER_LIMIT) {
          const seeMoreBtn = document.createElement("button");
          seeMoreBtn.className = "see-more-btn";
          seeMoreBtn.setAttribute("data-i18n-key", "common.seeMore");
          seeMoreBtn.textContent = commonTranslations.seeMore || "See More";
          itemDiv.appendChild(seeMoreBtn);
        }

        // Video with Smart Lazy Loading
        if (itemData.videoSrc) {
          const video = document.createElement("video");
          video.loop = true;
          video.muted = true;
          video.playsInline = true;
          video.preload = "none";
          video.className = "lazy-video";
          video.setAttribute("data-src", itemData.videoSrc);

          video.innerHTML = "Your browser does not support the video tag.";
          itemDiv.appendChild(video);
        }

        wrapper.appendChild(itemDiv);
      });
    }

    /**
     * Applies expansion / collapse truncation toggle to gallery item captions
     * @param {Object} commonTranslations
     */
    static applySeeMoreLogic(commonTranslations = {}) {
      const galleryItems = document.querySelectorAll(".gallery-item");
      galleryItems.forEach((item) => {
        const caption = item.querySelector(".media-caption");
        const button = item.querySelector(".see-more-btn");
        if (!button) return;

        if (button.hasAttribute("data-listener-added")) return;

        button.style.visibility =
          caption.textContent.length > CHARACTER_LIMIT ? "visible" : "hidden";
        caption.classList.remove("truncated");

        if (caption.textContent.length > CHARACTER_LIMIT) {
          caption.classList.add("truncated");
        }

        button.addEventListener("click", () => {
          caption.classList.toggle("truncated");
          button.textContent = caption.classList.contains("truncated")
            ? commonTranslations.seeMore || "See More"
            : commonTranslations.seeLess || "See Less";
        });

        button.setAttribute("data-listener-added", "true");
      });
    }

    /**
     * Sets up smooth, lightweight scroll reveal animation for gallery items
     */
    static setupScrollReveal() {
      const items = document.querySelectorAll(".gallery-item");
      if (!items.length) return;

      if (!("IntersectionObserver" in window)) {
        items.forEach((item) => item.classList.add("is-revealed"));
        return;
      }

      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-revealed");
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
      );

      items.forEach((item) => {
        const rect = item.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          item.classList.add("is-revealed");
        } else {
          observer.observe(item);
        }
      });
    }

    /**
     * Initializes image lightbox zoom interaction for comparison graphic
     */
    static setupImageLightbox() {
      const trigger = document.getElementById("comparison-zoom-wrapper");
      const modal = document.getElementById("image-lightbox-modal");
      const closeBtn = document.getElementById("lightbox-close-btn");
      const overlay = document.getElementById("lightbox-overlay");

      if (!trigger || !modal) return;

      const openModal = () => {
        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
      };

      const closeModal = () => {
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
      };

      trigger.onclick = openModal;
      trigger.onkeydown = (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openModal();
        }
      };

      if (closeBtn) closeBtn.onclick = closeModal;
      if (overlay) overlay.onclick = closeModal;

      window.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.classList.contains("is-open")) {
          closeModal();
        }
      });
    }

    /**
     * Smart Video Lazy Loading & Hardware Decoder Optimization:
     * - Only loads video stream (src) when within 250px of the viewport
     * - Automatically pauses videos when off-screen to free hardware decoder slots and conserve RAM/battery
     * - Automatically resumes playing when back in view
     */
    static setupVideoLazyLoading() {
      const lazyVideos = document.querySelectorAll("video.lazy-video");
      if (!lazyVideos.length) return;

      if (!("IntersectionObserver" in window)) {
        lazyVideos.forEach((video) => {
          if (video.dataset.src && !video.getAttribute("src")) {
            video.src = video.dataset.src;
            video.load();
            video.play().catch(() => {});
          }
        });
        return;
      }

      if (this._videoObserver) {
        this._videoObserver.disconnect();
      }

      this._videoObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const video = entry.target;
            if (entry.isIntersecting) {
              if (video.dataset.src && !video.getAttribute("src")) {
                video.src = video.dataset.src;
                video.load();
              }
              const playPromise = video.play();
              if (playPromise !== undefined) {
                playPromise.catch(() => {
                  video.muted = true;
                });
              }
            } else {
              if (!video.paused && video.getAttribute("src")) {
                video.pause();
              }
            }
          });
        },
        {
          rootMargin: "250px 0px 250px 0px",
          threshold: 0.05
        }
      );

      lazyVideos.forEach((video) => {
        this._videoObserver.observe(video);
      });
    }

    /**
     * Destroys all mobile Swiper instances if any
     */
    static destroyAllSwipers() {
      if (window.swipers) {
        Object.keys(window.swipers).forEach((id) => {
          if (window.swipers[id]) {
            window.swipers[id].destroy(true, true);
            window.swipers[id] = null;
          }
        });
      }
    }
  }

  exports.LinkerController = LinkerController;
})(window.Portfolio.presentation.controllers);
