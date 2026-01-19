const TILE = 16;
const FOV = Math.PI / 3;
const RAY_STEP = 1;

/*
 1 = pared
 0 = piso
 2 = puerta
 4 = ventana con letrero
*/
const MAP = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,1,0,0,0,1,0,0,4,2,0,1],
  [1,0,0,0,1,0,0,0,1,0,0,0,0,0,1],
  [1,0,0,0,1,0,0,0,1,0,0,0,0,0,1],
  [1,0,0,0,2,0,0,0,2,0,0,0,0,0,1],
  [1,0,0,0,1,0,0,0,1,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

const player = {
  x: TILE * 7,
  y: TILE * 4,
  a: 0,
  speed: 1.8
};

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const mini = document.getElementById("minimap");
const mctx = mini.getContext("2d");

function resize(){
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
addEventListener("resize", resize);
resize();

const keys = {};
addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

canvas.addEventListener("click", () => canvas.requestPointerLock());
document.addEventListener("mousemove", e => {
  if (document.pointerLockElement === canvas) {
    player.a += e.movementX * 0.002;
  }
});

function tileAt(x,y){
  return MAP[Math.floor(y/TILE)]?.[Math.floor(x/TILE)];
}
function isSolid(t){
  return t === 1;
}

addEventListener("keydown", e => {
  if (e.key === "e") {
    const fx = player.x + Math.cos(player.a)*30;
    const fy = player.y + Math.sin(player.a)*30;
    const mx = Math.floor(fx/TILE);
    const my = Math.floor(fy/TILE);
    if (MAP[my]?.[mx] === 2) MAP[my][mx] = 0;
  }
});

function update(){
  let nx = player.x;
  let ny = player.y;

  if (keys.w) { nx+=Math.cos(player.a)*player.speed; ny+=Math.sin(player.a)*player.speed; }
  if (keys.s) { nx-=Math.cos(player.a)*player.speed; ny-=Math.sin(player.a)*player.speed; }
  if (keys.a) { nx+=Math.cos(player.a-Math.PI/2)*player.speed; ny+=Math.sin(player.a-Math.PI/2)*player.speed; }
  if (keys.d) { nx+=Math.cos(player.a+Math.PI/2)*player.speed; ny+=Math.sin(player.a+Math.PI/2)*player.speed; }

  if (!isSolid(tileAt(nx,ny))) {
    player.x = nx;
    player.y = ny;
  }
}

function draw3D(){
  ctx.fillStyle="#87CEEB";
  ctx.fillRect(0,0,canvas.width,canvas.height/2);
  ctx.fillStyle="#d2c29d";
  ctx.fillRect(0,canvas.height/2,canvas.width,canvas.height/2);

  for(let x=0;x<canvas.width;x++){
    const ra = player.a - FOV/2 + (x/canvas.width)*FOV;
    let dist=0, t=0;

    while(dist<800){
      dist+=RAY_STEP;
      const rx = player.x + Math.cos(ra)*dist;
      const ry = player.y + Math.sin(ra)*dist;
      t = tileAt(rx,ry);
      if(t && t!==0) break;
    }

    const cd = dist*Math.cos(ra-player.a);
    const h = (TILE*canvas.height)/(cd||1);
    const y = canvas.height/2-h/2;

    ctx.fillStyle =
      t===1 ? "#e0e0e0" :
      t===2 ? "#8b5a2b" :
      t===4 ? "#9fd3ff" : "#ccc";

    ctx.fillRect(x,y,1,h);

    if (t===4 && cd < 160) {
      ctx.fillStyle="rgba(0,0,0,.6)";
      ctx.fillRect(x,y+h*0.4,1,h*0.2);
    }
  }

  const fx = player.x + Math.cos(player.a)*40;
  const fy = player.y + Math.sin(player.a)*40;
  if(tileAt(fx,fy)===4){
    ctx.fillStyle="rgba(0,0,0,.7)";
    ctx.fillRect(canvas.width/2-120,canvas.height-70,240,32);
    ctx.fillStyle="white";
    ctx.textAlign="center";
    ctx.font="18px Arial";
    ctx.fillText("SALÓN DE CÓMPUTO",canvas.width/2,canvas.height-48);
  }
}

function drawMiniMap(){
  mctx.clearRect(0,0,mini.width,mini.height);
  const s = mini.width/(MAP[0].length*TILE);

  for(let y=0;y<MAP.length;y++){
    for(let x=0;x<MAP[y].length;x++){
      mctx.fillStyle =
        MAP[y][x]===1?"#333":
        MAP[y][x]===2?"#8b5a2b":
        MAP[y][x]===4?"#9fd3ff":"#ddd";
      mctx.fillRect(x*TILE*s,y*TILE*s,TILE*s,TILE*s);
    }
  }

  mctx.fillStyle="red";
  mctx.beginPath();
  mctx.arc(player.x*s,player.y*s,3,0,Math.PI*2);
  mctx.fill();
}

function loop(){
  update();
  draw3D();
  drawMiniMap();
  requestAnimationFrame(loop);
}
loop();
