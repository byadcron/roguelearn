const volume = document.getElementById("volume");
const sensitivity = document.getElementById("sensitivity");
const speed = document.getElementById("speed");

const volumeValue = document.getElementById("volumeValue");
const sensitivityValue = document.getElementById("sensitivityValue");
const speedValue = document.getElementById("speedValue");

const settings = {
  volume: localStorage.getItem("volume") ?? 70,
  sensitivity: localStorage.getItem("sensitivity") ?? 2,
  speed: localStorage.getItem("speed") ?? 1.8
};

volume.value = settings.volume;
sensitivity.value = settings.sensitivity;
speed.value = settings.speed;

function updateLabels() {
  volumeValue.textContent = settings.volume + "%";
  sensitivityValue.textContent = settings.sensitivity;
  speedValue.textContent = settings.speed;
}

updateLabels();

volume.oninput = () => {
  settings.volume = volume.value;
  localStorage.setItem("volume", volume.value);
  updateLabels();
};

sensitivity.oninput = () => {
  settings.sensitivity = sensitivity.value;
  localStorage.setItem("sensitivity", sensitivity.value);
  updateLabels();
};

speed.oninput = () => {
  settings.speed = speed.value;
  localStorage.setItem("speed", speed.value);
  updateLabels();
};
