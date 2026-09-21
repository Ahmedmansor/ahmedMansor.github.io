/**
 * @file project.model.js
 * @description Project Domain Model Entity definition.
 * Part of Clean Architecture (Domain Layer).
 */

window.Portfolio = window.Portfolio || {};
window.Portfolio.domain = window.Portfolio.domain || {};
window.Portfolio.domain.models = window.Portfolio.domain.models || {};

(function (exports) {
  "use strict";

  class Project {
    /**
     * @param {Object} data
     * @param {string} data.id
     * @param {string} data.title
     * @param {string} [data.bigTitle]
     * @param {string} [data.category]
     * @param {string} [data.typeBadge]
     * @param {string} [data.typeBadgeIcon]
     * @param {string} [data.badgeClass]
     * @param {string} data.description
     * @param {string} data.thumbnail
     * @param {string} data.link
     * @param {string[]} [data.tags]
     * @param {string} [data.viewProject]
     */
    constructor(data = {}) {
      this.id = data.id || "";
      this.title = data.title || "";
      this.bigTitle = data.bigTitle || this.title;
      this.category = data.category || "";
      this.typeBadge = data.typeBadge || "";
      this.typeBadgeIcon = data.typeBadgeIcon || "";
      this.badgeClass = data.badgeClass || "";
      this.description = data.description || "";
      this.thumbnail = data.thumbnail || "";
      this.link = data.link || "#";
      this.tags = Array.isArray(data.tags) ? data.tags : [];
      this.viewProject = data.viewProject || "View Project Details";
    }

    /**
     * Factory method to create Project instances from dictionary lists
     * @param {Array<Object>} rawList
     * @returns {Project[]}
     */
    static fromList(rawList) {
      if (!Array.isArray(rawList)) return [];
      return rawList.map((item) => new Project(item));
    }
  }

  exports.Project = Project;
})(window.Portfolio.domain.models);
