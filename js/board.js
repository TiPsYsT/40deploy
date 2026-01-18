import { getModels } from "./state.js";

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

let dragging = null;
let mission = null;
let terrain = null;

const PX_PER_MM = 1;
const OBJECTIVE_R = 20; // 40mm

export function initBoard(m = null, t = null) {
  mission = m;
  terrain = t;
  draw();
}

export function spawnModel(unit) {
  const unplaced = getModels().filter(m => m.name === unit.name && m.x === null);
  if (unplaced.length === 0) return;

  unplaced.forEach((m, i) => {
    m.x = 100 + i * 25;
    m.y = 100;
  });

  draw();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (mission) {
    drawZones(mission.zones);
    if (mission.objectives) drawObjectives(mission.objectives);
  }

  if (terrain) drawTerrain(terrain.pieces);

  drawModels();
}

/* ===== RENDER ===== */

function drawZones(zones) {
  drawPolys(zones.player, "rgba(0,0,255,0.15)");
  drawPolys(zones.enemy, "rgba(255,0,0,0.15)");
}

function drawPolys(polys, color) {
  ctx.fillStyle = color;
  ctx.strokeStyle = color;

  polys.forEach(poly => {
    ctx.beginPath();
    poly.forEach(([x, y], i) =>
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    );
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });
}

function drawObjectives(objs) {
  objs.forEach(o => {
    ctx.beginPath();
    ctx.fillStyle = "rgba(255,215,0,0.9)"; // GULD
    ctx.strokeStyle = "black";
    ctx.arc(o.x, o.y, OBJECTIVE_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath(); // mittpunkt
    ctx.arc(o.x, o.y, 2, 0, Math.PI * 2);
    ctx.fillStyle = "black";
    ctx.fill();
  });
}

function drawTerrain(pieces) {
  ctx.fillStyle = "rgba(90,90,90,0.6)";
  pieces.forEach(p => ctx.fillRect(p.x, p.y, p.w, p.h));
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
    ctx.arc(model.x, model.y, parseFloat(base) / 2, 0, Math.PI * 2);
  }

  ctx.strokeStyle = "black";
  ctx.stroke();
}

/* ===== DRAG ===== */

canvas.onmousedown = e => {
  const mx = e.offsetX;
  const my = e.offsetY;

  dragging = [...getModels()]
    .reverse()
    .find(m => m.x !== null && Math.hypot(mx - m.x, my - m.y) < 30);
};

canvas.onmousemove = e => {
  if (!dragging) return;
  dragging.x = e.offsetX;
  dragging.y = e.offsetY;
  draw();
};

canvas.onmouseup = () => dragging = null;
