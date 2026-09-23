/**
 * @file carousel-geometry.usecase.js
 * @description Pure 3D cylinder coordinate math & depth calculations for project cards & titles.
 * Part of Clean Architecture (Domain Layer Use Case).
 */

window.Portfolio = window.Portfolio || {};
window.Portfolio.domain = window.Portfolio.domain || {};
window.Portfolio.domain.usecases = window.Portfolio.domain.usecases || {};

(function (exports) {
  "use strict";

  class CarouselGeometryUseCase {
    /**
     * Calculates the height of a single title item based on viewport width
     * @param {number} winWidth
     * @returns {number}
     */
    static getTitleItemHeight(winWidth = window.innerWidth) {
      return winWidth <= 480 ? 75 : (winWidth <= 768 ? 80 : 120);
    }

    /**
     * Calculates pure 3D cylinder spatial coordinates and visual attributes for a card
     * @param {Object} params
     * @param {number} params.index - 0-indexed item number
     * @param {number} params.progress - Scroll progress from 0.0 to 1.0
     * @param {number} [params.winWidth] - Current window viewport width
     * @param {boolean} [params.isMobile] - Whether viewport is mobile device
     * @returns {Object} Spatial CSS properties and active state
     */
    static calculateCardTransform({ index, progress, winWidth = window.innerWidth, isMobile = false }) {
      const angle = progress * 3 * 90; // 0 to 270 degrees
      const rx = Math.round(Math.min(winWidth * 0.42, 590));
      const rz = 290;

      let theta = (index * 90 - angle) % 360;
      while (theta > 180) theta -= 360;
      while (theta < -180) theta += 360;

      const rad = (theta * Math.PI) / 180;
      const cosT = Math.cos(rad);
      const sinT = Math.sin(rad);

      const x = rx * sinT;
      const z = rz * (cosT - 1);
      const y = (-48 * (1 - cosT)) / 2;
      const rotY = -theta * 0.28;
      const scale = 1.0 - (0.28 * (1 - cosT)) / 2;

      const depthFactor = (cosT + 1) / 2;
      const opacity = 0.38 + 0.62 * depthFactor;
      const zIndex = Math.round(depthFactor * 30) + 1;
      const isNearCenter = Math.abs(theta) < 45;

      return {
        transform: `translate3d(${x}px, ${y}px, ${z}px) rotateY(${rotY}deg) scale(${scale})`,
        opacity,
        zIndex,
        isNearCenter
      };
    }

    /**
     * Calculates the vertical translation offset for the title track
     * @param {number} progress - Scroll progress (0 to 1)
     * @param {number} itemHeight - Height of a single title item in px
     * @returns {number} Y translation in px
     */
    static calculateTitleOffset(progress, itemHeight) {
      return -progress * 3 * itemHeight;
    }
  }

  exports.CarouselGeometryUseCase = CarouselGeometryUseCase;
})(window.Portfolio.domain.usecases);
