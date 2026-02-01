// =======================
// 1) ESTADO + DATOS
// =======================
const STORAGE_KEY = "roguelearn_progress";

// Si antes se guardó algo, bórralo siempre al cargar:
localStorage.removeItem(STORAGE_KEY);

let currentLevel = 1;
let lessonShown = false;
let currentQuestion = 0;

// para que el quiz no se repita por nivel (si NO quieres guardar nada, déjalo vacío)
let completedQuizzes = {};


// --- Lecciones ---
const lessons = {
  1: {
    title: "Salón de Cómputo",
    text: "Aquí se usan computadoras para aprender programación y tecnología. ¡Explora el salón para continuar!"
  }
};

// --- Preguntas ---
const quizzes = {
  1: [
    { question: "¿Cuál es el resultado de 12 x 8?", options: ["96","108","86"], answer: 0 },
    { question: "¿Cuál es la capital de Ecuador?", options: ["Quito","Guayaquil","Cuenca"], answer: 0 },
    { question: "¿Cuál es el gas que respiramos principalmente?", options: ["Oxígeno","Carbono","Hidrógeno"], answer: 0 },
    { question: "El verso 'En el silencio sólo se escuchaba un susurro de abejas' es un ejemplo de:", options: ["Metáfora","Símil","Hipérbole"], answer: 0 }
  ]
};

// =======================
// 2) MAPA + PLAYER
// =======================
const TILE = 16;
const FOV = Math.PI / 3;
const RAY_STEP = 1;
const INTERACT_DIST = 40;
const PLAYER_RADIUS = 4;

// 1=Pared, 0=Piso, 2=Puerta, 4=Lección, 5=Profesor
// ✅ Puse un "4" para que sí puedas probar la lección.
const MAP = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,1,0,0,0,1,0,0,5,2,0,1],
  [1,0,4,0,1,0,0,0,1,0,0,0,0,0,1], // <-- Lección aquí (tile 4)
  [1,0,0,0,1,0,0,0,1,0,0,0,0,0,1],
  [1,0,0,0,2,0,0,0,2,0,0,0,0,0,1],
  [1,0,0,0,1,0,0,0,1,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

const player = { x: TILE*7, y: TILE*4, a: 0, speed: 1.8 };

// =======================
// 3) DOM
// =======================
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function resizeGameCanvas(){
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // dibujas en "px normales"
}

window.addEventListener("resize", resizeGameCanvas);
resizeGameCanvas();


const mini = document.getElementById("minimap");
const mctx = mini.getContext("2d");

const levelInfo = document.getElementById("levelInfo");
const msg = document.getElementById("msg");

const dialog = document.getElementById("dialog");
const dialogTitle = document.getElementById("dialogTitle");
const dialogText = document.getElementById("dialogText");
const dialogBtn = document.getElementById("dialogBtn");

// HUD
levelInfo.textContent = "Nivel " + currentLevel;

// =======================
// 4) RESIZE + INPUT
// =======================
function resize(){
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
addEventListener("resize", resize);
resize();

const keys = {};
addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// pointer lock
canvas.addEventListener("click", () => {
  if(!lessonShown) canvas.requestPointerLock();
});

document.addEventListener("mousemove", e => {
  if(document.pointerLockElement === canvas && !lessonShown){
    player.a += e.movementX * 0.002;
  }
});

// ESC para cerrar diálogo si está abierto
addEventListener("keydown", (e) => {
  if(e.key === "Escape" && !dialog.classList.contains("hidden")){
    closeDialog();
  }
  // opcional: Enter activa el botón "Continuar" si existe
  if((e.key === "Enter") && !dialog.classList.contains("hidden") && !dialogBtn.classList.contains("hidden")){
    dialogBtn.click();
  }
});

// =======================
// 5) HELPERS MAPA
// =======================
function tileAt(x,y){
  const mx = Math.floor(x / TILE);
  const my = Math.floor(y / TILE);
  return MAP[my]?.[mx] ?? 1; // fuera del mapa = pared
}

function isSolid(t){
  // puerta cerrada también bloquea
  return t === 1 || t === 2;
}

function canMoveTo(nx, ny){
  const pts = [
    [nx-PLAYER_RADIUS, ny-PLAYER_RADIUS],
    [nx+PLAYER_RADIUS, ny-PLAYER_RADIUS],
    [nx-PLAYER_RADIUS, ny+PLAYER_RADIUS],
    [nx+PLAYER_RADIUS, ny+PLAYER_RADIUS],
  ];
  return pts.every(([x,y]) => !isSolid(tileAt(x,y)));
}

function frontTile(){
  const fx = player.x + Math.cos(player.a)*INTERACT_DIST;
  const fy = player.y + Math.sin(player.a)*INTERACT_DIST;
  const mx = Math.floor(fx / TILE);
  const my = Math.floor(fy / TILE);
  const t = MAP[my]?.[mx] ?? 1;
  return { mx, my, t };
}

// =======================
// 6) DIÁLOGO (usa tu #dialogBtn)
// =======================
let dialogBtnHandler = null;

function setDialogButton(text, handler){
  dialogBtn.textContent = text;
  dialogBtn.classList.remove("hidden");
  dialogBtnHandler = handler;
}

dialogBtn.addEventListener("click", () => {
  if(typeof dialogBtnHandler === "function") dialogBtnHandler();
});

function openDialog(title){
  dialogTitle.textContent = title;
  dialog.classList.remove("hidden");
  lessonShown = true;

  // salir de pointerlock para clicar
  if(document.pointerLockElement === canvas) document.exitPointerLock();
}

function closeDialog(){
  dialog.classList.add("hidden");
  dialogText.innerHTML = "";
  dialogBtnHandler = null;
  lessonShown = false;
}

// Botón helper para quiz
function makeOptionButton(label, onClick){
  const b = document.createElement("button");
  b.className = "dlg-btn";
  b.textContent = label;
  b.addEventListener("click", onClick);
  return b;
}

// =======================
// 7) INTERACCIÓN (E)
// =======================
addEventListener("keydown", (e) => {
  if(e.key.toLowerCase() !== "e") return;

  // si hay diálogo abierto, no interactúes con el mundo
  if(lessonShown) return;

  const { mx, my, t } = frontTile();

  // Puerta
  if(t === 2){
    MAP[my][mx] = 0;
    return;
  }

  // Lección
  if(t === 4){
    const lesson = lessons[currentLevel];
    openDialog(lesson?.title || "Lección");
    dialogText.innerHTML = `<p>${lesson?.text || "No hay lección definida para este nivel."}</p>`;
    dialogBtn.classList.remove("hidden");
    setDialogButton("Continuar", closeDialog);
    return;
  }

  // Profesor / Quiz
  if(t === 5){
    if(completedQuizzes[String(currentLevel)]){
      openDialog("Profesor");
      dialogText.innerHTML = `<p>✅ Ya completaste el quiz de este nivel.</p>`;
      setDialogButton("Cerrar", closeDialog);
      return;
    }
    startQuiz(currentLevel);
  }
});

function updateHint(){
  if(!msg) return;
  if(lessonShown) { msg.textContent = ""; return; }

  const { t } = frontTile();
  if(t === 2) msg.textContent = "Presiona E para abrir la puerta";
  else if(t === 4) msg.textContent = "Presiona E para leer la lección";
  else if(t === 5) msg.textContent = "Presiona E para hablar con el profesor";
  else msg.textContent = "Click para jugar · W A S D + Mouse · E = Interactuar";
}

// =======================
// 8) MOVIMIENTO
// =======================
function update(){
  if(lessonShown) return;

  let nx = player.x, ny = player.y;

  const forward = keys["w"] || keys["arrowup"];
  const back    = keys["s"] || keys["arrowdown"];
  const left    = keys["a"] || keys["arrowleft"];
  const right   = keys["d"] || keys["arrowright"];

  if(forward){ nx += Math.cos(player.a)*player.speed; ny += Math.sin(player.a)*player.speed; }
  if(back){    nx -= Math.cos(player.a)*player.speed; ny -= Math.sin(player.a)*player.speed; }
  if(left){    nx += Math.cos(player.a - Math.PI/2)*player.speed; ny += Math.sin(player.a - Math.PI/2)*player.speed; }
  if(right){   nx += Math.cos(player.a + Math.PI/2)*player.speed; ny += Math.sin(player.a + Math.PI/2)*player.speed; }

  if(canMoveTo(nx, ny)){
    player.x = nx;
    player.y = ny;
  }
}

// =======================
// 9) QUIZ (botones dentro de dialogText)
// =======================
function startQuiz(level){
  currentQuestion = 0;
  showQuestion(level);
}

function showQuestion(level){
  const q = quizzes[level]?.[currentQuestion];
  if(!q){ finishQuiz(); return; }

  openDialog("Profesor pregunta");

  // ocultar botón fijo para que no estorbe
  dialogBtn.classList.add("hidden");
  dialogBtnHandler = null;

  dialogText.innerHTML = "";
  quizLocked = false;

  const p = document.createElement("p");
  p.textContent = q.question;
  dialogText.appendChild(p);

  const feedback = document.createElement("div");
  feedback.id = "quizFeedback";
  feedback.style.marginTop = "10px";
  feedback.style.fontWeight = "800";
  dialogText.appendChild(feedback);

  q.options.forEach((opt, i) => {
    dialogText.appendChild(makeOptionButton(opt, () => answerQuestion(i, level)));
  });
}


function answerQuestion(choice, level){
  if(quizLocked) return;

  const q = quizzes[level][currentQuestion];
  const fb = document.getElementById("quizFeedback");
  const btns = Array.from(dialogText.querySelectorAll(".dlg-btn"));

  if(choice === q.answer){
    quizLocked = true;

    if(fb){
      fb.textContent = "✅ Correcto";
      fb.style.color = "#7CFF7C";
    }

    // desactiva botones para evitar spam
    btns.forEach(b => b.disabled = true);

    // espera un momento para que se vea el mensaje y pasa a la siguiente
    setTimeout(() => {
      currentQuestion++;
      showQuestion(level);
    }, 650);

  } else {
    if(fb){
      fb.textContent = "❌ Incorrecto, intenta otra vez";
      fb.style.color = "#FF7C7C";
    }
  }
}

function finishQuiz(){
  completedQuizzes[String(currentLevel)] = true;
  saveProgress();

  openDialog("Excelente");
  dialogText.innerHTML = `<p>✅ ¡Quiz completado!</p>`;

  // mostrar botón fijo para continuar
  setDialogButton("Continuar", () => {
    closeDialog();
    currentLevel++;
    levelInfo.textContent = "Nivel " + currentLevel;
    saveProgress();
  });
}

// =======================
// 10) GUARDADO
// =======================
function saveProgress(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    level: currentLevel,
    completedQuizzes
  }));
}

// =======================
// 11) RENDER 3D
// =======================
function draw3D(){
  ctx.fillStyle="#87CEEB";
  ctx.fillRect(0,0,canvas.width,canvas.height/2);

  ctx.fillStyle="#d2c29d";
  ctx.fillRect(0,canvas.height/2,canvas.width,canvas.height/2);

  for(let x=0; x<canvas.width; x++){
    const ra = player.a - FOV/2 + (x/canvas.width)*FOV;

    let dist = 0;
    let t = 0;

    while(dist < 800){
      dist += RAY_STEP;
      const rx = player.x + Math.cos(ra)*dist;
      const ry = player.y + Math.sin(ra)*dist;
      t = tileAt(rx, ry);
      if(t && t !== 0) break;
    }

    const cd = dist * Math.cos(ra - player.a);
    const h = (TILE * canvas.height) / (cd || 1);
    const y = canvas.height/2 - h/2;

    ctx.fillStyle =
      t===1 ? "#e0e0e0" :
      t===2 ? "#8b5a2b" :
      t===4 ? "#9fd3ff" :
      t===5 ? "#ffd700" : "#ccc";

    ctx.fillRect(x, y, 1, h);
  }
}

// =======================
// 12) MINIMAPA
// =======================
function drawMiniMap(){
  mctx.clearRect(0,0,mini.width,mini.height);

  const s = mini.width / (MAP[0].length * TILE);

  for(let y=0; y<MAP.length; y++){
    for(let x=0; x<MAP[y].length; x++){
      mctx.fillStyle =
        MAP[y][x]===1 ? "#333" :
        MAP[y][x]===2 ? "#8b5a2b" :
        MAP[y][x]===4 ? "#9fd3ff" :
        MAP[y][x]===5 ? "#ffd700" : "#ddd";

      mctx.fillRect(x*TILE*s, y*TILE*s, TILE*s, TILE*s);
    }
  }

  // player
  mctx.fillStyle="red";
  mctx.beginPath();
  mctx.arc(player.x*s, player.y*s, 3, 0, Math.PI*2);
  mctx.fill();

  // dirección
  mctx.strokeStyle="red";
  mctx.beginPath();
  mctx.moveTo(player.x*s, player.y*s);
  mctx.lineTo((player.x + Math.cos(player.a)*20)*s, (player.y + Math.sin(player.a)*20)*s);
  mctx.stroke();
}

// =======================
// 13) LOOP
// =======================
function loop(){
  update();
  updateHint();
  draw3D();
  drawMiniMap();
  requestAnimationFrame(loop);
}
loop();
