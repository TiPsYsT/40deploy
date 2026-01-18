import { getModels } from "./state.js";

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

const OBJECTIVE_R = 20; // 40mm
const CONTROL_R = 76;  // 3"

// board state
let mission = null;
let terrain = null;

// interaction
let dragging = false;
let dragOffsets = [];
let selecting = false;
let selectStart = null;

// ruler
let rulerActive = false;
let rulerStart = null;
let rulerEnd = null;

/* ================= INIT ================= */

export function initBoard(m = null, t = null) {
  mission = m;
  terrain = t;
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
  if (rulerActive && rulerStart && rulerEnd) drawRuler();
}

/* ---------- objectives ---------- */

function drawObjectives(objs) {
  objs.forEach(o => {
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.arc(o.x, o.y, CONTROL_R, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = "gold";
    ctx.lineWidth = 4;
    ctx.arc(o.x, o.y, CONTROL_R - 3, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.arc(o.x, o.y, OBJECTIVE_R + 2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.fillStyle = "gold";
    ctx.arc(o.x, o.y, OBJECTIVE_R, 0, Math.PI * 2);
    ctx.fill();

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
    if (m.x === null || m.base === null) return;

    drawBase(m);

    if (m.selected) {
      ctx.beginPath();
      ctx.strokeStyle = "blue";
      ctx.lineWidth = 2;
      ctx.arc(m.x, m.y, getHitRadius(m) + 4, 0, Math.PI * 2);
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

function getHitRadius(model) {
  const base = model.base.toLowerCase();
  if (base.includes("x")) {
    const [w, h] = base.split("x").map(Number);
    return Math.max(w, h) / 2 + 4;
  }
  return parseFloat(base) / 2 + 4;
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

/* ---------- ruler ---------- */

function drawRuler() {
  const dx = rulerEnd.x - rulerStart.x;
  const dy = rulerEnd.y - rulerStart.y;
  const distMM = Math.hypot(dx, dy);
  const distIn = distMM / 25.4;

  ctx.beginPath();
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.moveTo(rulerStart.x, rulerStart.y);
  ctx.lineTo(rulerEnd.x, rulerEnd.y);
  ctx.stroke();

  const label = `${distMM.toFixed(1)} mm / ${distIn.toFixed(2)}"`;
  ctx.fillStyle = "white";
  ctx.strokeStyle = "black";
  ctx.lineWidth = 3;

  ctx.font = "14px sans-serif";
  ctx.strokeText(label, rulerEnd.x + 6, rulerEnd.y - 6);
  ctx.fillText(label, rulerEnd.x + 6, rulerEnd.y - 6);
}

/* ================= INTERACTION ================= */

window.addEventListener("keydown", e => {
  if (e.key.toLowerCase() === "r") rulerActive = true;
});

window.addEventListener("keyup", e => {
  if (e.key.toLowerCase() === "r") {
    rulerActive = false;
    rulerStart = null;
    rulerEnd = null;
    draw();
  }
});

canvas.onmousedown = e => {
  const mx = e.offsetX;
  const my = e.offsetY;

  if (rulerActive) {
    rulerStart = { x: mx, y: my };
    rulerEnd = { x: mx, y: my };
    draw();
    return;
  }

  const hit = [...getModels()]
    .reverse()
    .find(
      m =>
        m.x !== null &&
        m.base !== null &&
        Math.hypot(mx - m.x, my - m.y) <= getHitRadius(m)
    );

  if (hit) {
    if (!hit.selected) {
      getModels().forEach(m => (m.selected = false));
      hit.selected = true;
    }

    dragging = true;
    dragOffsets = getModels()
      .filter(m => m.selected)
      .map(m => ({ m, dx: mx - m.x, dy: my - m.y }));
  } else {
    getModels().forEach(m => (m.selected = false));
    selecting = true;
    selectStart = { x: mx, y: my, cx: mx, cy: my };
  }

  draw();
};

canvas.onmousemove = e => {
  const mx = e.offsetX;
  const my = e.offsetY;

  if (rulerActive && rulerStart) {
    rulerEnd = { x: mx, y: my };
    draw();
    return;
  }

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
      if (m.x === null || m.base === null) return;
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

/* ---------- sidebar drag-in ---------- */

canvas.ondragover = e => e.preventDefault();

canvas.ondrop = e => {
  e.preventDefault();
  const name = e.dataTransfer.getData("text/plain");
  if (!name) return;

  const unplaced = getModels().filter(
    m => m.name === name && m.x === null && m.base !== null
  );
  if (!unplaced.length) return;

  const PER_ROW = 5;
  const SPACING = 35;

  unplaced.forEach((m, i) => {
    const col = i % PER_ROW;
    const row = Math.floor(i / PER_ROW);
    m.x = e.offsetX + col * SPACING;
    m.y = e.offsetY + row * SPACING;
    m.selected = false;
  });

  draw();
};
