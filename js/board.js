import { getModels } from "./state.js";

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

const PX_PER_MM = 1;

// objective sizes
const OBJECTIVE_R = 20;
const CONTROL_R = 76;

// board state
let mission = null;
let terrain = null;

// interaction state
let dragging = false;
let dragStart = null;
let dragOffsets = [];
let selecting = false;
let selectStart = null;

// init from app.js
export function initBoard(m = null, t = null) {
  mission = m;
  terrain = t;
  draw();
}

/**
 * Sidebar drag-in senare.
 * Just nu: spawn ALLA oplacerade för unit (till test / fallback)
 */
export function spawnModel(unit) {
  const unplaced = getModels().filter(
    m => m.name === unit.name && m.x === null
  );
  if (!unplaced.length) return;

  unplaced.forEach((m, i) => {
    m.x = 120 + i * 35;
    m.y = 120;
    m.selected = false;
  });

  draw();
}

/* ================= DRAW ================= */

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (mission) {
    drawZones(mission.zones);
    if (mission.objectives) drawObjectives(mission.objectives);
  }

  if (terrain) drawTerrain(terrain.pieces);

  drawModels();

  if (selecting && selectStart) drawSelectionBox();
}

/* ---------- objectives ---------- */

function drawObjectives(objs) {
  objs.forEach(o => {
    // outer black
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.arc(o.x, o.y, CONTROL_R, 0, Math.PI * 2);
    ctx.stroke();

    // yellow control
    ctx.beginPath();
    ctx.strokeStyle = "gold";
    ctx.lineWidth = 4;
    ctx.arc(o.x, o.y, CONTROL_R - 3, 0, Math.PI * 2);
    ctx.stroke();

    // black ring
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.arc(o.x, o.y, OBJECTIVE_R + 2, 0, Math.PI * 2);
    ctx.stroke();

    // yellow fill
    ctx.beginPath();
    ctx.fillStyle = "gold";
    ctx.arc(o.x, o.y, OBJECTIVE_R, 0, Math.PI * 2);
    ctx.fill();

    // center dot
    ctx.beginPath();
    ctx.fillStyle = "black";
    ctx.arc(o.x, o.y, 2, 0, Math.PI * 2);
    ctx.fill();
  });
}

/* ---------- zones ---------- */

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

/* ---------- terrain ---------- */

function drawTerrain(pieces) {
  ctx.fillStyle = "rgba(90,90,90,0.6)";
  pieces.forEach(p => ctx.fillRect(p.x, p.y, p.w, p.h));
}

/* ---------- models ---------- */

function drawModels() {
  getModels().forEach(m => {
    if (m.x === null) return;

    drawBase(m);

    if (m.selected) {
      ctx.beginPath();
      ctx.strokeStyle = "blue";
      ctx.lineWidth = 2;
      ctx.arc(m.x, m.y, 18, 0, Math.PI * 2);
      ctx.stroke();
    }
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

/* ---------- selection box ---------- */

function drawSelectionBox() {
  const x = Math.min(selectStart.x, selectStart.cx);
  const y = Math.min(selectStart.y, selectStart.cy);
  const w = Math.abs(selectStart.cx - selectStart.x);
  const h = Math.abs(selectStart.cy - selectStart.y);

  ctx.strokeStyle = "blue";
  ctx.setLineDash([5, 5]);
  ctx.strokeRect(x, y, w, h);
  ctx.setLineDash([]);
}

/* ================= INTERACTION ================= */

canvas.onmousedown = e => {
  const mx = e.offsetX;
  const my = e.offsetY;

  const hit = [...getModels()]
    .reverse()
    .find(m => m.x !== null && Math.hypot(mx - m.x, my - m.y) < 20);

  if (hit) {
    // selection
    if (!e.shiftKey) {
      getModels().forEach(m => (m.selected = false));
    }
    hit.selected = true;

    // start drag
    dragging = true;
    dragOffsets = getModels()
      .filter(m => m.selected)
      .map(m => ({ m, dx: mx - m.x, dy: my - m.y }));

  } else {
    // box select
    getModels().forEach(m => (m.selected = false));
    selecting = true;
    selectStart = { x: mx, y: my, cx: mx, cy: my };
  }

  draw();
};

canvas.onmousemove = e => {
  const mx = e.offsetX;
  const my = e.offsetY;

  if (dragging) {
    dragOffsets.forEach(o => {
      o.m.x = mx - o.dx;
      o.m.y = my - o.dy;
    });
    draw();
    return;
  }

  if (selecting && selectStart) {
    selectStart.cx = mx;
    selectStart.cy = my;

    const x1 = Math.min(selectStart.x, selectStart.cx);
    const y1 = Math.min(selectStart.y, selectStart.cy);
    const x2 = Math.max(selectStart.x, selectStart.cx);
    const y2 = Math.max(selectStart.y, selectStart.cy);

    getModels().forEach(m => {
      if (m.x === null) return;
      m.selected =
        m.x >= x1 && m.x <= x2 &&
        m.y >= y1 && m.y <= y2;
    });

    draw();
  }
};

canvas.onmouseup = () => {
  dragging = false;
  selecting = false;
  selectStart = null;
  dragOffsets = [];
};
