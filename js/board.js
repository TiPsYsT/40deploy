import { getModels } from "./state.js";

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

let dragging = null;
let mission = null;
let terrain = null;

const PX_PER_MM = 1;

// Objective sizes
const OBJECTIVE_R = 20;   // 40mm
const CONTROL_R = 76;     // 3"

export function initBoard(m = null, t = null) {
  mission = m;
  terrain = t;
  draw();
}

export function spawnModel(unit) {
  // hitta FÖRSTA oplacerade modellen med samma namn
  const model = getModels().find(
    m => m.name === unit.name && m.x === null
  );
  if (!model) return;

  model.x = 120;
  model.y = 120;

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

/* ===== OBJECTIVES ===== */

function drawObjectives(objs) {
  objs.forEach(o => {

    // yttersta svarta ringen (control)
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.arc(o.x, o.y, CONTROL_R, 0, Math.PI * 2);
    ctx.stroke();

    // gul control-ring
    ctx.beginPath();
    ctx.strokeStyle = "gold";
    ctx.lineWidth = 4;
    ctx.arc(o.x, o.y, CONTROL_R - 3, 0, Math.PI * 2);
    ctx.stroke();

    // svart ring runt objektet
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.arc(o.x, o.y, OBJECTIVE_R + 2, 0, Math.PI * 2);
    ctx.stroke();

    // gul objekt-fyllning
    ctx.beginPath();
    ctx.fillStyle = "gold";
    ctx.arc(o.x, o.y, OBJECTIVE_R, 0, Math.PI * 2);
    ctx.fill();

    // svart mittpunkt
    ctx.beginPath();
    ctx.fillStyle = "black";
    ctx.arc(o.x, o.y, 2, 0, Math.PI * 2);
    ctx.fill();
  });
}

/* ===== ZONES ===== */

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

/* ===== TERRAIN ===== */

function drawTerrain(pieces) {
  ctx.fillStyle = "rgba(90,90,90,0.6)";
  pieces.forEach(p => ctx.fillRect(p.x, p.y, p.w, p.h));
}

/* ===== MODELS ===== */

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
