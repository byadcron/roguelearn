(() => {
  const cfg = window.APP_CFG?.start || {};
  const video = document.getElementById("startVideo");
  const img = document.getElementById("startImg");
  const text = document.getElementById("startText");
  const screen = document.getElementById("screen");

  if (video && cfg.video) {
    video.querySelector("source").src = cfg.video;
    video.load();
  }
  if (img && cfg.overlayImage) img.src = cfg.overlayImage;

  const t = (cfg.overlayText || "").trim();
  if (text) {
    if (t) { text.textContent = t; text.style.display = "block"; }
    else { text.style.display = "none"; }
  }

  let started = false;
  function goNext(){
    if (started) return;
    started = true;
    window.location.href = cfg.next || "menu.html";
  }

  window.addEventListener("keydown", goNext, { once:true });
  window.addEventListener("pointerdown", goNext, { once:true });
})();
