/**
 * @file audio.service.js
 * @description Centralized Audio Sprite Management Service powered by Howler.js.
 * Part of Clean Architecture (Data Layer DataSource/Service).
 */

window.Portfolio = window.Portfolio || {};
window.Portfolio.data = window.Portfolio.data || {};
window.Portfolio.data.datasources = window.Portfolio.data.datasources || {};

(function (exports) {
  "use strict";

  const STORAGE_KEY_MUTED    = "portfolio_audio_muted";
  const STORAGE_KEY_BGM      = "portfolio_bgm_playing";
  const STORAGE_KEY_BGM_SEEK = "portfolio_bgm_seek";

  const DEFAULT_BGM_VOLUME   = 1.0;
  const DEFAULT_SFX_VOLUME   = 1.0;

  /**
   * Relative volume scaling per cue (1.0 = normal SFX volume, 0.5 = 50% volume)
   */
  const CUE_VOLUME_MAP = {
    "hologram-on": 0.4
  };

  /**
   * Default audio sprite map matching assets/fx/portfolio-sprite.json.
   * Defined synchronously to eliminate async race conditions, with dynamic override support.
   */
  const DEFAULT_SPRITE_MAP = {
    "hologram-on": [0, 500],
    "laser-scan": [1500, 700],
    "notification-ping": [3200, 300],
    "ratchet-step": [4500, 200],
    "spaceship-flyby": [5700, 1200],
    "success-chime": [7900, 600],
    "typing-tick": [9500, 93],
    "ui-click": [10593, 200],
    "ui-hover": [11793, 150],
    "warning-beep": [12943, 229],
    "warp-whoosh": [14172, 530]
  };

  /**
   * Semantic aliases mapping logical UX sound types to physical sprite cues.
   */
  const ALIAS_MAP = {
    "ui-hover-soft": "ui-hover",
    "ui-hover-micro": "ui-hover",
    "ui-hover-sonar": "ui-hover",
    "ui-hover-btn": "ui-hover",
    "ui-click-cyber": "ui-click",
    "ui-click-nav": "ui-click",
    "lang-switch-toggle": "ui-click",
    "tab-switch": "ui-click",
    "compiler-start": "warp-whoosh",
    "compiler-tick": "typing-tick",
    "compiler-success": "success-chime",
    "carousel-step-click": "ratchet-step",
    "cylinder-ratchet-step": "ratchet-step",
    "radar-ping": "notification-ping",
    "open-project-warp": "warp-whoosh",
    "action-descend": "warp-whoosh",
    "immersion-lock-whoosh": "warp-whoosh",
    "external-link-launch": "ui-click",
    "mail-send-blip": "notification-ping",
    "chat-ping": "notification-ping",
    "boot-telemetry-tick": "typing-tick",
    "system-online-whoosh": "success-chime",
    "cyber-type-scrub": "typing-tick",
    "hud-elements-deploy": "notification-ping",
    "ion-thruster-pass": "spaceship-flyby",
    "deep-whoosh": "spaceship-flyby",
    "hologram-activate": "hologram-on",
    "hologram-pulse": "hologram-on"
  };

  class AudioService {
    static _instance = null;
    static _howl = null;
    static _bgmHowl = null;         // Dedicated BGM instance (separate from sprite)
    static _bgmPlaying = false;     // Tracks whether BGM was intentionally started
    static _isMuted = false;
    static _spriteMap = { ...DEFAULT_SPRITE_MAP };
    static _listeners = [];
    static _throttleTimers = {};
    static _isInitialized = false;
    static _isUnlocked = false;
    static _bgmSeekInterval = null; // Interval to persist BGM seek position

    /**
     * Initializes the Singleton AudioService instance
     * @param {Object} [options={}]
     * @param {string} [options.basePath="assets/fx/"]
     * @returns {AudioService}
     */
    static init(options = {}) {
      if (this._isInitialized) {
        return this;
      }

      const basePath = options.basePath || "assets/fx/";

      // 1. Read persistent mute state from localStorage (defaults to false / unmuted)
      try {
        const stored = localStorage.getItem(STORAGE_KEY_MUTED);
        this._isMuted = stored === "true";
        // Restore BGM playing flag
        this._bgmPlaying = localStorage.getItem(STORAGE_KEY_BGM) === "true";
      } catch (e) {
        this._isMuted = false;
        this._bgmPlaying = false;
      }

      // 2. Instantiate Howler sound sprite
      if (typeof Howl !== "undefined") {
        this._initHowl(basePath);
      } else {
        // Defer until Howler script finishes loading
        window.addEventListener("DOMContentLoaded", () => {
          if (typeof Howl !== "undefined") {
            this._initHowl(basePath);
          }
        });
      }

      // 3. Attempt to fetch latest portfolio-sprite.json asynchronously
      this._loadSpriteJson(basePath);

      // 4. Setup one-time Web Audio unlock listener on first user interaction
      this._setupAutoUnlock();

      // 5. Setup declarative event delegation ([data-sound-click], [data-sound-hover])
      this._bindGlobalDelegation();

      // 6. Initialize BGM Howl (lazy — won't play until playBGM() is called)
      if (typeof Howl !== "undefined") {
        this._initBgm(basePath);
      } else {
        window.addEventListener("DOMContentLoaded", () => {
          if (typeof Howl !== "undefined") this._initBgm(basePath);
        });
      }

      // 7. Persist BGM seek position on page unload / navigation
      this._setupSeekPersistence();

      this._isInitialized = true;
      return this;
    }

    /**
     * Internal Howl instantiation for UI sound sprite
     * @private
     */
    static _initHowl(basePath) {
      if (this._howl) return;

      try {
        this._howl = new Howl({
          src: [
            `${basePath}portfolio-sprite.webm`,
            `${basePath}portfolio-sprite.mp3`
          ],
          sprite: this._spriteMap,
          volume: DEFAULT_SFX_VOLUME,
          mute: this._isMuted,
          preload: true,
          html5: false,
          onloaderror: (id, err) => {
            console.warn("AudioService: Failed to load audio sprite:", err);
          }
        });
      } catch (e) {
        console.warn("AudioService: Howler initialization error:", e);
      }
    }

    /**
     * Internal BGM Howl instantiation — looping background music track
     * @private
     */
    static _initBgm(basePath) {
      if (this._bgmHowl) return;
      if (typeof Howl === "undefined") return;

      // Restore saved seek position (from previous page / refresh)
      let savedSeek = 0;
      try {
        const raw = localStorage.getItem(STORAGE_KEY_BGM_SEEK);
        if (raw !== null) {
          const parsed = parseFloat(raw);
          if (!isNaN(parsed) && parsed > 0) savedSeek = parsed;
        }
      } catch (e) {}

      try {
        this._bgmHowl = new Howl({
          src: [
            `${basePath}portfolio-bgm.webm`,
            `${basePath}portfolio-bgm.mp3`
          ],
          loop: true,
          volume: this._isMuted ? 0 : DEFAULT_BGM_VOLUME,
          preload: true,
          html5: true,       // Use HTML5 Audio for long-playing BGM (better memory)
          onload: () => {
            // Seek to saved position once loaded (cross-page/refresh resume)
            if (savedSeek > 0 && this._bgmHowl) {
              this._bgmHowl.seek(savedSeek);
            }
            // Auto-resume BGM if it was playing and audio context is already unlocked
            // (handles navigation from index -> sub-page where user already interacted)
            if (this._bgmPlaying && !this._isMuted && this._isUnlocked && this._bgmHowl && !this._bgmHowl.playing()) {
              this._bgmHowl.play();
            }
          },
          onloaderror: (id, err) => {
            console.warn("AudioService: Failed to load BGM:", err);
          }
        });
      } catch (e) {
        console.warn("AudioService: BGM initialization error:", e);
      }
    }

    /**
     * Sets up persistence of the BGM seek position across page navigations and refreshes.
     * Saves position every second while playing, and immediately on pagehide/beforeunload.
     * @private
     */
    static _setupSeekPersistence() {
      const saveSeek = () => {
        if (this._bgmHowl && this._bgmHowl.playing()) {
          try {
            const pos = this._bgmHowl.seek();
            if (typeof pos === "number" && pos >= 0) {
              localStorage.setItem(STORAGE_KEY_BGM_SEEK, String(pos));
            }
          } catch (e) {}
        }
      };

      // Save position every second while BGM plays
      this._bgmSeekInterval = setInterval(saveSeek, 1000);

      // Save immediately when the user navigates away or closes the tab
      window.addEventListener("pagehide", saveSeek, { passive: true });
      window.addEventListener("beforeunload", saveSeek, { passive: true });
    }

    /**
     * Fetches portfolio-sprite.json asynchronously to ensure sprite map sync
     * @private
     */
    static async _loadSpriteJson(basePath) {
      if (typeof window === "undefined" || !window.fetch) return;
      try {
        const response = await fetch(`${basePath}portfolio-sprite.json`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.sprite) {
            this._spriteMap = { ...DEFAULT_SPRITE_MAP, ...data.sprite };
            // If Howl was already created, update sprite definitions
            if (this._howl && this._howl._sprite) {
              this._howl._sprite = this._spriteMap;
            }
          }
        }
      } catch (e) {
        // Fallback to DEFAULT_SPRITE_MAP silently
      }
    }

    /**
     * Global one-time listener to unlock Web Audio context on first user interaction.
     * Also auto-resumes BGM if it was playing before (cross-page/refresh).
     * @private
     */
    static _setupAutoUnlock() {
      const unlock = () => {
        this.unlock();
        // Auto-resume BGM on first interaction if it was playing before navigation/refresh
        if (this._bgmPlaying && !this._isMuted) {
          // Small delay to let AudioContext fully resume
          setTimeout(() => this.playBGM(), 200);
        }
        window.removeEventListener("pointerdown", unlock, true);
        window.removeEventListener("touchstart", unlock, true);
        window.removeEventListener("keydown", unlock, true);
        window.removeEventListener("click", unlock, true);
      };

      window.addEventListener("pointerdown", unlock, { once: true, capture: true, passive: true });
      window.addEventListener("touchstart", unlock, { once: true, capture: true, passive: true });
      window.addEventListener("keydown", unlock, { once: true, capture: true, passive: true });
      window.addEventListener("click", unlock, { once: true, capture: true, passive: true });
    }

    /**
     * Explicitly resumes the Web Audio context if suspended
     */
    static unlock() {
      if (this._isUnlocked) return;

      const resumeBGM = () => {
        if (this._bgmPlaying && !this._isMuted && this._bgmHowl && !this._bgmHowl.playing()) {
          this._bgmHowl.play();
        }
      };

      if (typeof Howler !== "undefined" && Howler.ctx) {
        if (Howler.ctx.state === "suspended") {
          Howler.ctx.resume().then(() => {
            this._isUnlocked = true;
            resumeBGM();
          }).catch(() => {});
        } else {
          this._isUnlocked = true;
          resumeBGM();
        }
      }
    }

    /**
     * Resolves a cue ID or alias to a valid sprite key
     * @param {string} cueId
     * @returns {string}
     */
    static resolveCue(cueId) {
      if (!cueId) return "";
      if (this._spriteMap[cueId]) return cueId;
      if (ALIAS_MAP[cueId] && this._spriteMap[ALIAS_MAP[cueId]]) {
        return ALIAS_MAP[cueId];
      }
      return cueId;
    }

    /**
     * Plays a sound effect from the audio sprite
     * @param {string} cueId - Sound identifier or semantic alias
     * @param {Object} [options={}]
     * @param {number} [options.volume] - Optional volume override (0.0 to 1.0)
     * @param {number} [options.rate] - Optional playback rate override (e.g. 1.0)
     * @returns {number|null} Howler sound ID or null if muted/unavailable
     */
    static play(cueId, options = {}) {
      if (this._isMuted || !cueId) return null;

      if (!this._howl) {
        // Attempt lazy init if Howler became ready
        if (typeof Howl !== "undefined") {
          this._initHowl("assets/fx/");
        }
        if (!this._howl) return null;
      }

      this.unlock();

      const resolved = this.resolveCue(cueId);
      if (!this._spriteMap[resolved]) {
        return null;
      }

      try {
        const soundId = this._howl.play(resolved);
        if (soundId !== null && typeof soundId !== "undefined") {
          const cueMultiplier = CUE_VOLUME_MAP[resolved] ?? 1.0;
          const targetVolume = typeof options.volume === "number"
            ? options.volume
            : DEFAULT_SFX_VOLUME * cueMultiplier;
          this._howl.volume(targetVolume, soundId);
          if (typeof options.rate === "number") {
            this._howl.rate(options.rate, soundId);
          }
        }
        return soundId;
      } catch (e) {
        return null;
      }
    }

    /**
     * Plays a sound with a throttle delay (ideal for scrubbed GSAP animations or fast mouse movement)
     * @param {string} cueId
     * @param {number} [delayMs=75]
     * @param {Object} [options={}]
     */
    static playThrottled(cueId, delayMs = 75, options = {}) {
      if (this._isMuted) return null;
      const now = performance.now();
      const lastTime = this._throttleTimers[cueId] || 0;

      if (now - lastTime >= delayMs) {
        this._throttleTimers[cueId] = now;
        return this.play(cueId, options);
      }
      return null;
    }

    /**
     * Returns whether the audio is currently muted
     * @returns {boolean}
     */
    static isMuted() {
      return this._isMuted;
    }

    /**
     * Sets the global audio mute state.
     * Syncs both UI sprite Howl and BGM Howl.
     * @param {boolean} muted
     */
    static setMuted(muted) {
      this._isMuted = Boolean(muted);

      try {
        localStorage.setItem(STORAGE_KEY_MUTED, this._isMuted ? "true" : "false");
      } catch (e) {
        console.warn("AudioService: Failed to save mute state to localStorage:", e);
      }

      // Sync UI sprite
      if (this._howl) {
        this._howl.mute(this._isMuted);
      }

      // Sync BGM: pause when muting, resume when unmuting
      if (this._bgmHowl) {
        if (this._isMuted) {
          this._bgmHowl.volume(0);
          if (this._bgmHowl.playing()) this._bgmHowl.pause();
        } else if (this._bgmPlaying) {
          this._bgmHowl.volume(DEFAULT_BGM_VOLUME);
          if (!this._bgmHowl.playing()) this._bgmHowl.play();
        }
      }

      this._notifyListeners(this._isMuted);
    }

    /**
     * Toggles global mute state
     * @returns {boolean} New mute state
     */
    static toggleMute() {
      const newState = !this.isMuted();
      this.setMuted(newState);
      // Play brief feedback click when unmuting
      if (!newState) {
        this.play("ui-click");
      }
      return newState;
    }

    /**
     * Starts the BGM looping track.
     * Call this once from the "Start Experience" overlay confirmation.
     */
    static playBGM() {
      if (this._isMuted) return;
      if (!this._bgmHowl) {
        this._initBgm("assets/fx/");
      }
      if (this._bgmHowl && !this._bgmHowl.playing()) {
        this._bgmHowl.volume(DEFAULT_BGM_VOLUME);
        this._bgmHowl.play();
      }
      this._bgmPlaying = true;
      try {
        localStorage.setItem(STORAGE_KEY_BGM, 'true');
        // Clear stale seek on explicit new play (first-time start)
        // Don't clear here — we want to preserve seek for cross-page resume
      } catch(e) {}
    }

    /**
     * Pauses the BGM track (does not reset _bgmPlaying flag).
     */
    static pauseBGM() {
      if (this._bgmHowl && this._bgmHowl.playing()) {
        this._bgmHowl.pause();
      }
    }

    /**
     * Stops and resets the BGM track.
     */
    static stopBGM() {
      if (this._bgmHowl) {
        this._bgmHowl.stop();
      }
      this._bgmPlaying = false;
      try {
        localStorage.setItem(STORAGE_KEY_BGM, 'false');
        localStorage.removeItem(STORAGE_KEY_BGM_SEEK); // Reset seek so next play starts fresh
      } catch(e) {}
    }

    /**
     * Returns whether BGM is currently playing
     * @returns {boolean}
     */
    static isBGMPlaying() {
      return !!(this._bgmHowl && this._bgmHowl.playing());
    }

    /**
     * Adds a listener for mute state changes
     * @param {Function} callback - Receives (isMuted: boolean)
     */
    static addMuteListener(callback) {
      if (typeof callback === "function" && !this._listeners.includes(callback)) {
        this._listeners.push(callback);
      }
    }

    /**
     * Removes a mute listener
     * @param {Function} callback
     */
    static removeMuteListener(callback) {
      this._listeners = this._listeners.filter((cb) => cb !== callback);
    }

    /**
     * Notifies all registered listeners
     * @private
     */
    static _notifyListeners(isMuted) {
      this._listeners.forEach((cb) => {
        try {
          cb(isMuted);
        } catch (err) {
          console.error("AudioService: Error in mute listener callback:", err);
        }
      });
    }

    /**
     * Sets up declarative HTML sound triggers via data attributes:
     * - [data-sound-click="ui-click"]
     * - [data-sound-hover="ui-hover"] (Desktop hover only)
     * @private
     */
    static _bindGlobalDelegation() {
      if (typeof document === "undefined") return;

      // 1. Delegated click sounds
      document.addEventListener(
        "click",
        (event) => {
          const target = event.target && event.target.closest ? event.target.closest("[data-sound-click]") : null;
          if (target) {
            const cue = target.getAttribute("data-sound-click");
            if (cue) {
              this.play(cue);
            }
          }
        },
        { passive: true }
      );

      // 2. Delegated hover sounds (Filtered: Pointer must support real fine hover)
      const canHover =
        typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(hover: hover) and (pointer: fine)").matches;

      if (canHover) {
        document.addEventListener(
          "mouseover",
          (event) => {
            const target = event.target && event.target.closest ? event.target.closest("[data-sound-hover]") : null;
            if (target) {
              const fromEl = event.relatedTarget;
              if (fromEl && target.contains(fromEl)) {
                return; // Cursor is moving between descendants of the same hovered element
              }
              const cue = target.getAttribute("data-sound-hover");
              if (cue) {
                this.playThrottled(cue, 50);
              }
            }
          },
          { passive: true }
        );
      }
    }
  }

  // Auto-initialize AudioService
  AudioService.init();

  exports.AudioService = AudioService;
  window.AudioService = AudioService;
})(window.Portfolio.data.datasources);
