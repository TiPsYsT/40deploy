import { getModels } from "./state.js";

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

let dragging = null;
const PX_PER_MM = 1;
const OBJECTIVE_R = 20; // 40mm diameter

export function spawnModel(unit) {
  const model = getModels().find(m => m.name === unit.name && m.x === null);
  if (!model) return;

  model.x = 100;
  model.y = 100;
  redrawBoard();
}

export function redrawBoard(mission = null, terrain = null) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (mission) {
    drawZones(mission.zones);
    if (mission.objectives) drawObjectives(mission.objectives);
  }

  if (terrain) drawTerrain(terrain.pieces);

  drawModels();
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

function drawObjectives(objs) {
  ctx.strokeStyle = "black";
  ctx.fillStyle = "rgba(255,255,255,0.9)";

  objs.forEach(o => {
    ctx.beginPath();
    ctx.arc(o.x, o.y, OBJECTIVE_R * PX_PER_MM, 0, Math.PI * 2);
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

function drawModels() {
  getModels().forEach(m => {
    if (m.x === null) return;
    drawBase(m);
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

/* ===== FIXAD DRAG ===== */
canvas.onmousedown = e => {
  const mx = e.offsetX;
  const my = e.offsetY;

  dragging = [...getModels()]
    .reverse() // översta först
    .find(m => {
      if (m.x === null) return false;
      return Math.hypot(mx - m.x, my - m.y) < 30;
    });
};

canvas.onmousemove = e => {
  if (!dragging) return;
  dragging.x = e.offsetX;
  dragging.y = e.offsetY;
  redrawBoard();
};

canvas.onmouseup = () => dragging = null;
