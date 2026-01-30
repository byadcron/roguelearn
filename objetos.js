const info = document.getElementById("objectInfo");
const cards = document.querySelectorAll(".object-card");

const descriptions = {
  linterna: "Ilumina áreas oscuras del edificio.",
  botiquin: "Permite recuperar salud durante el juego.",
  credencial: "Otorga acceso a zonas restringidas.",
  llave: "Abre puertas cerradas dentro del mapa."
};

// Restaurar selección previa
const selected = localStorage.getItem("selectedObject");
if (selected) {
  const prev = document.querySelector(`.object-card[data-id="${selected}"]`);
  if (prev) selectObject(prev);
}

// Click en objetos
cards.forEach(card => {
  card.addEventListener("click", () => {
    selectObject(card);
  });
});

function selectObject(card) {
  cards.forEach(c => c.classList.remove("selected"));

  const id = card.dataset.id;
  card.classList.add("selected");

  info.textContent = descriptions[id] || "Objeto sin descripción";
  localStorage.setItem("selectedObject", id);
}
