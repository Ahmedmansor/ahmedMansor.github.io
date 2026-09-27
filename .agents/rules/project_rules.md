---
trigger: always_on
---

# ==============================================================================
#                     AHMED MANSOUR PORTFOLIO & SHOWCASE
#               MASTER INSTRUCTIONAL PROMPT & CODING GUIDELINES
# ==============================================================================
# When writing, modifying, or refactoring code in this project, you MUST strictly 
# obey every architectural standard, naming convention, performance commandment,
# and GSAP lifecycle rule specified below. Deviations are NOT tolerated.
# ==============================================================================

## 1. ARCHITECTURE & DIRECTORY BLUEPRINT
- **Core Paradigm:** Feature-First Clean Architecture (Domain / Data / Presentation).
- **Execution Strategy:** Pure Vanilla ES6+, HTML5, CSS3. ZERO bundlers or build steps (NO Vite, Webpack, Rollup, Babel, or npm compilation). All scripts execute natively in the browser via script tags.
- **Global Namespace:** All code MUST attach to `window.Portfolio` under its architectural layer:
  - `window.Portfolio.core`
  - `window.Portfolio.data.{datasources, repositories}`
  - `window.Portfolio.domain.{models, usecases}`
  - `window.Portfolio.presentation.{components, controllers}`
- **Directory Layout:**
  - `index.html`, `home.html` (redirect), `linker.html`, `semantic-cut.html`: Root page entry points.PER-PAGE PERFORMA
  - `lang/{en.js, ar.js}`: Global dictionaries assigned to `window.translations`.
  - `assets/`: `fx/` (audio sprite/BGM), `icons/icons.js` (SVG registry), `images/`, `videos/`, `projects/`.
  - `src/core/`: Shared cross-cutting modules (`audio.service.js`, `storage.datasource.js`, `language.datasource.js`, `language.repository.js`, `localization.usecase.js`, `appbar/`, `footer/`, `language-switcher/`, `variables.css`, `base.css`, `rtl.css`).
  - `src/features/<feature>/`: Feature modules (`home/`, `linker/`, `semantic-cut/`) split into `domain/` (`models/`, `usecases/`) and `presentation/` (`components/`, `controllers/`, `styles/`).
- **File Placement Rules:**
  - New pages go to root (`/page.html`). Link stylesheets in `<head>` in order: `variables.css` -> `base.css` -> core components -> feature styles -> `rtl.css` (eliminates `@import` FOUC).
  - Feature code belongs inside `src/features/<feature>/domain/` or `presentation/`.
  - Reusable components go to `src/core/presentation/components/<name>/`.

---

## 2. CODING STANDARDS & DESIGN PATTERNS
- **IIFE Module Encapsulation:** Every `.js` file MUST be wrapped in an IIFE exporting to its namespace:
  ```javascript
  window.Portfolio = window.Portfolio || {};
  window.Portfolio.presentation.controllers = window.Portfolio.presentation.controllers || {};
  (function(exports){ "use strict"; class MyCtrl { static async init() {} } exports.MyCtrl = MyCtrl; })(window.Portfolio.presentation.controllers);
  ```
- **Component Pattern (`*.component.js`):** Static classes exposing `static getTemplate()` (returning semantic HTML) and `static init(target)`.
- **Controller Pattern (`*.controller.js`):** Static classes managing page lifecycle: `static async init()`, `static cleanup()`, `static async switchLanguage(lang)`, and debounced resize handling (>=150ms).
- **Domain Models (`*.model.js`):** Pure entity classes with default values and static factory `static fromList(rawArray)`.
- **Domain Use Cases (`*.usecase.js`):** Pure static math/geometry/business logic. ZERO DOM references (`document`/`window` forbidden).
- **Localization (i18n):**
  - All translatable text nodes MUST have `data-i18n-key="<namespace>.<key>"`.
  - New strings MUST be added to BOTH `lang/en.js` AND `lang/ar.js`.
  - `LocalizationUseCase.translateDOM()` handles DOM updates and sets `html[lang]` and `html[dir="rtl|ltr"]`.
- **Strict Arabic RTL Rules (`rtl.css`):**
  - **Code IDE LTR-Lock:** Code editors, gutters, terminal drawers, Dart/JSON code snippets, and telemetry consoles MUST REMAIN STRICTLY LOCKED TO LTR (`direction: ltr !important; text-align: left !important;`). Never mirror in Arabic.
  - Telemetry HUD brackets mirrored via `transform: scaleX(-1);`.
  - Fonts: English uses `--font-primary: 'Montserrat', sans-serif;`. Arabic MUST use `--font-arabic: 'Cairo', 'Alexandria', 'Tajawal', sans-serif;`.
- **Design Tokens (`variables.css`):**
  - Palettes: Woodsmoke (`--woodsmoke-950: #07070a` body), Vulcan (`--vulcan-950: #12131c` cards), Cyan (`--color-primary: #00f0ff`), Amethyst (`--color-secondary: #a855f7`).
  - Spacing tokens: `--space-3xs` to `--space-3xl` (Flutter `EdgeInsets` equivalent).
  - Body/HTML layout: Always use `overflow-x: clip;` (never `hidden`) to prevent breaking sticky positioning and GSAP pins.
- **Audio Architecture (`AudioService`):**
  - Declarative HTML triggers: `data-sound-click="ui-click|warp-whoosh|ratchet-step"` and `data-sound-hover="ui-hover"`.
  - Hover sounds filtered to desktop pointer: `(hover: hover) and (pointer: fine)`.
  - High-frequency triggers MUST use `AudioService.playThrottled(cueId, delayMs)`.
  - BGM & mute states persisted in `localStorage` (`portfolio_audio_muted`, `portfolio_bgm_seek`).
- **Icons (`window.Icons`):** Standalone SVG registry in `assets/icons/icons.js`. External icon font CDNs are banned.

---

## 3. GSAP & SCROLLTRIGGER RULES
- **Plugin Registration:** Always guard and register:
  ```javascript
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true }); // MANDATORY: Eliminates mobile address bar jump
  }
  ```
- **Anti-Jitter Scroll Guard:** Enforce `document.documentElement.style.scrollBehavior = "auto"` during controller initialization. Never allow CSS smooth scroll to distort ScrollTrigger calculations.
- **Zero DOM Querying in Scroll Loops:** Pre-cache all animated DOM elements into a flat array (`cardNodes`) during `init()`. NEVER call `querySelector` or traverse the DOM inside `onUpdate` or scroll handlers.
- **Change Detection Before Style Mutation:** Apply transforms directly via `translate3d`, `rotateY`, `scale`. Only mutate classes or `zIndex` when state actually flips (e.g., `if (item.isActive !== isNearCenter)`).
- **Responsive Timelines (`gsap.matchMedia()`):**
  - Desktop `(min-width: 769px)`: Expansive distances, smooth inertia scrub (`scrub: 0.6` - `0.8`).
  - Mobile `(max-width: 768px)`: Compact distances, lightweight touch responsiveness.
- **Memory Leak Teardown (`cleanup()`):** Every animated controller MUST kill timelines (`tl.kill()`), kill triggers (`tl.scrollTrigger.kill(true)` or `ScrollTrigger.getById(id)?.kill(true)`), and revert `matchMediaInstance.revert()`.
- **BFCache Restoration:** Register `window.addEventListener("pageshow", ...)` to call `ScrollTrigger.refresh()` and remove lingering preloaders if `event.persisted`.
- **Refresh Order:** Call `ScrollTrigger.sort()` and `ScrollTrigger.refresh()` after all dynamic content and translations render.

---

## 4. PER-PAGE PERFORMANCE (THE 8 COMMANDMENTS)
1. **Viewport-Aware State (IntersectionObserver):** Do NOT run continuous animations or transforms when offscreen. Use IO with `rootMargin: "80px - 100px"`. Toggle `<section>.in-view` / `<section>-paused`. Target in CSS with `animation-play-state: paused !important;`.
2. **Page Visibility Pause (`visibilitychange`):** When `document.hidden` (tab switched/minimized), set `document.body.classList.add("page-paused")`. Enforce global CSS: `body.page-paused * { animation-play-state: paused !important; }`. Pause all videos, canvas loops, and SVG animations.
3. **Smart Video Lazy Loading & Hardware Decoder Release:** All `<video>` tags MUST use `preload="none"`, `class="lazy-video"`, and `data-src`. Load video source via IO when approaching (250px margin). Call `video.pause()` IMMEDIATELY when scrolled out of view to free GPU hardware decoder slots!
4. **Heavy SVG Lazy Mounting & Pausing:** Interactive SVG diagrams (`<object>`) use `data-src` and mount only upon viewport intersection. When offscreen, inject `.is-paused` to freeze internal SVG keyframe animations.
5. **Compositor-Only Layout Performance:** Animate ONLY `transform` and `opacity`. NEVER animate `top`, `left`, `width`, `height`, `margin`, or `padding`. Use `will-change: transform` dynamically on enter/touch and reset to `auto` at rest.
6. **RAF Throttling & Physics Lerp:** High-frequency mouse/touch/parallax events MUST store normalized targets and update inside a `requestAnimationFrame` loop using lerp (`current += (target - current) * 0.085`). Cancel RAF loop below resting threshold.
7. **Canvas 60 FPS Cap & Degradation:** Full-screen canvas components (starfields/particles) MUST cap `devicePixelRatio` at `Math.min(window.devicePixelRatio || 1, 2)`, allocate fewer particles on mobile (e.g., 70 vs 220), and throttle frame updates (`if (now - lastFrameTime < 16) return;`) to protect 120Hz+ displays from battery drain.
8. **Reduced Motion Accessibility:** Respect OS toggles: `@media (prefers-reduced-motion: reduce)` in CSS (`animation-duration: 0.01ms !important;`). In JS canvas loops, check `matchMedia` and render a single static frame instead of looping.
9. **DOM Pruning & Dynamic Mounting:** Never render massive hidden lists (e.g., 100+ items in a carousel) directly in HTML. Keep data in JS memory and dynamically inject/remove DOM nodes as they enter/leave the viewport. Use native ES `import()` to lazy-load heavy modules only when needed.
10. **CSS Content Visibility:** Always apply `content-visibility: auto` to heavy, offscreen sections to force the browser to skip layout, paint, and render calculations until they are near the viewport.
11. **Box-Shadow Compositor Hack:** NEVER animate `box-shadow` directly on an element. To animate shadows, create a hidden `::after` pseudo-element with the final shadow pre-baked, and animate only its `opacity` between 0 and 1.
---

## 5. NEW CODE GENERATION CHECKLIST
- [ ] Pure Vanilla ES6+ inside an IIFE registered on `window.Portfolio.<layer>.<sublayer>.<Class>`.
- [ ] Zero npm/bundler imports (`import`/`export` forbidden).
- [ ] Translatable strings added to BOTH `lang/en.js` AND `lang/ar.js` with `data-i18n-key`.
- [ ] Code IDE/gutters/terminals locked to `direction: ltr !important;` in `rtl.css`.
- [ ] GSAP ScrollTriggers use `ignoreMobileResize: true`, pre-cached DOM nodes, and full `cleanup()`.
- [ ] Animated sections support `.in-view` and respond to `body.page-paused`.
- [ ] Videos set to `preload="none"` with IO play/pause decoder release.
- [ ] High-frequency input uses RAF lerp; canvas throttled to 60fps.
- [ ] All colors and spacing strictly utilize tokens from `variables.css`.
