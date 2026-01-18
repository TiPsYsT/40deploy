import { getModels } from "./state.js";

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

let dragging = null;
const PX_PER_MM = 1;

export function spawnModel(unit) {
  const model = getModels().find(m => m.name === unit.name && m.x === null);
  if (!model) return;

  model.x = 40;
  model.y = 40;
  redrawBoard();
}

export function redrawBoard(mission = null, terrain = null) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (mission) drawZones(mission.zones);
  if (terrain) drawTerrain(terrain.pieces);

  drawModels();
}

function drawModels() {
  getModels().forEach(m => {
    if (m.x === null) return;
    drawBase(m);
  });
}

function drawZones(zones) {
  drawPolys(zones.player, "rgba(0,0,255,0.15)");
  drawPolys(zones.enemy, "rgba(255,0,0,0.15)");
}

function drawPolys(polys, color) {
  ctx.fillStyle = color;
  ctx.strokeStyle = color;

  polys.forEach(poly => {
    ctx.beginPath();
    poly.forEach(([x, y], i) => {
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });
}

function drawTerrain(pieces) {
  ctx.fillStyle = "rgba(100,100,100,0.5)";
  pieces.forEach(p => {
    ctx.fillRect(p.x, p.y, p.w, p.h);
  });
}

function drawBase(model) {
  const base = model.base.toLowerCase();
  ctx.beginPath();

  if (base.includes("x")) {
    const [w, h] = base.split("x").map(Number);
    ctx.ellipse(model.x, model.y, w / 2, h / 2, 0, 0, Math.PI * 2);
  } else {
    const r = parseFloat(base) / 2;
    ctx.arc(model.x, model.y, r, 0, Math.PI * 2);
  }

  ctx.stroke();
}

/* drag */
canvas.onmousedown = e => {
  getModels().forEach(m => {
    if (m.x === null) return;
    if (Math.hypot(e.offsetX - m.x, e.offsetY - m.y) < 30) {
      dragging = m;
    }
  });
};

canvas.onmousemove = e => {
  if (!dragging) return;
  dragging.x = e.offsetX;
  dragging.y = e.offsetY;
  redrawBoard();
};

canvas.onmouseup = () => dragging = null;
