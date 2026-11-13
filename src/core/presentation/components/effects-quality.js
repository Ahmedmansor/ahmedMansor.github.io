(function () {
  "use strict";

  const root = document.documentElement;
  const { deviceMemory, hardwareConcurrency, connection } = navigator;
  const touch = matchMedia("(pointer: coarse)").matches;
  const constrained = connection?.saveData ||
    (deviceMemory > 0 && deviceMemory <= 2) ||
    (hardwareConcurrency > 0 && hardwareConcurrency <= 2);
  const capable = deviceMemory >= 6 && hardwareConcurrency >= 6;
  const levels = ["light", "balanced", "full"];
  let level = constrained ? 0 : touch && !capable ? 1 : 2;

  try {
    const previous = levels.indexOf(sessionStorage.getItem("portfolio-effects-quality"));
    if (previous >= 0) level = Math.min(level, previous);
  } catch {}

  root.dataset.effectsQuality = levels[level];

  window.PortfolioEffects = {
    lowerQuality() {
      if (level === 0) return;
      root.dataset.effectsQuality = levels[--level];
      try {
        sessionStorage.setItem("portfolio-effects-quality", levels[level]);
      } catch {}
      window.dispatchEvent(new Event("portfolio-effects-change"));
    }
  };
})();
