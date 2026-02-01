// ./js/opciones.js
(() => {
  const STORAGE_KEY = "roguelearn_settings_v1";

  const elVolume = document.getElementById("optVolume");
  const elMouse  = document.getElementById("optMouse");
  const elSpeed  = document.getElementById("optSpeed");

  const valVolume = document.getElementById("valVolume");
  const valMouse  = document.getElementById("valMouse");
  const valSpeed  = document.getElementById("valSpeed");

  const btnReset = document.getElementById("btnReset");
  const optBlocks = Array.from(document.querySelectorAll(".opt"));

  const defaults = { volume: 70, mouse: 10, speed: 8 };
  let activeIndex = 0;

  function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }

  function readSettings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...defaults };
      const s = JSON.parse(raw);
      return {
        volume: Number.isFinite(+s.volume) ? +s.volume : defaults.volume,
        mouse:  Number.isFinite(+s.mouse)  ? +s.mouse  : defaults.mouse,
        speed:  Number.isFinite(+s.speed)  ? +s.speed  : defaults.speed,
      };
    } catch {
      return { ...defaults };
    }
  }

  function saveSettings(settings){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }

  function applySettings(s){
    elVolume.value = String(clamp(s.volume, 0, 100));
    elMouse.value  = String(clamp(s.mouse,  1, 20));
    elSpeed.value  = String(clamp(s.speed,  1, 20));
    refreshLabels();
  }

  function refreshLabels(){
    valVolume.textContent = `${elVolume.value}%`;
    valMouse.textContent  = `${elMouse.value}`;
    valSpeed.textContent  = `${elSpeed.value}`;

    saveSettings({
      volume: +elVolume.value,
      mouse:  +elMouse.value,
      speed:  +elSpeed.value
    });
  }

  function setActive(i){
    activeIndex = clamp(i, 0, optBlocks.length - 1);
    optBlocks.forEach((b, idx) => b.classList.toggle("is-active", idx === activeIndex));
    // enfoca el input del bloque activo (para accesibilidad)
    const input = optBlocks[activeIndex].querySelector("input");
    input?.focus({ preventScroll: true });
  }

  // Cambiar valor del slider activo con teclado
  function nudgeActive(delta){
    const input = optBlocks[activeIndex].querySelector("input");
    if (!input) return;
    const step = Number(input.step || 1);
    const min = Number(input.min || 0);
    const max = Number(input.max || 100);
    const next = clamp(Number(input.value) + delta * step, min, max);
    input.value = String(next);
    refreshLabels();
  }

  // Eventos
  [elVolume, elMouse, elSpeed].forEach(el => el.addEventListener("input", refreshLabels));

  // Click en un bloque => lo hace activo
  optBlocks.forEach((block, idx) => {
    block.addEventListener("pointerdown", () => setActive(idx));
  });

  btnReset?.addEventListener("click", () => {
    applySettings(defaults);
    saveSettings(defaults);
  });

  // Teclado
  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp")   { e.preventDefault(); setActive(activeIndex - 1); }
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(activeIndex + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); nudgeActive(-1); }
    if (e.key === "ArrowRight"){ e.preventDefault(); nudgeActive(+1); }
    if (e.key === "Escape")    { window.location.href = "menu.html"; }
  });

  // Init
  applySettings(readSettings());
  setActive(0);
})();
