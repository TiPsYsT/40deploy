import { getModels } from "./state.js";

window.sidebarDragging = false;

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

const INCH = 25.4;
const OBJECTIVE_R = 20;
const CONTROL_R = 76;

// state
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

  if (t?.terrain?.pieces) {
    terrain = t.terrain;
  } else if (t?.pieces) {
    terrain = t;
  } else {
    terrain = { pieces: [] };
  }

  draw();
}

/* ================= DRAW ================= */

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (mission) {
    if (Array.isArray(mission.deployment)) {
      drawDeploymentLines(mission.deployment);
    }
    drawObjectives(mission.objectives);
  }

  if (terrain) drawTerrain(terrain.pieces);
  drawModels();

  if (selecting && selectStart) drawSelectionBox();
  if (rulerActive && rulerStart && rulerEnd) drawRuler();
}

/* ---------- deployment ---------- */

function drawDeploymentLines(lines = []) {
  lines.forEach(l => {
    ctx.strokeStyle =
      l.type === "player"
        ? "rgba(0,0,255,0.8)"
        : "rgba(255,0,0,0.8)";

    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(l.a[0], l.a[1]);
    ctx.lineTo(l.b[0], l.b[1]);
    ctx.stroke();
  });
}

/* ---------- objectives ---------- */

function drawObjectives(objs = []) {
  if (!Array.isArray(objs)) return;

  objs.forEach(o => {
    const x = o.x > 100 ? o.x : o.x * INCH;
    const y = o.y > 100 ? o.y : o.y * INCH;

    ctx.beginPath();
    ctx.fillStyle = "gold";
    ctx.arc(x, y, OBJECTIVE_R, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.arc(x, y, CONTROL_R, 0, Math.PI * 2);
    ctx.stroke();
  });
}

/* ---------- terrain ---------- */

function drawTerrain(pieces) {
  pieces.forEach(p => {
    const cx = p.x + p.w / 2;
    const cy = p.y + p.h / 2;
    const rot = (p.rotation || 0) * Math.PI / 180;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.translate(-p.w / 2, -p.h / 2);

    ctx.fillStyle =
      p.color === "red"  ? "rgba(220,80,80,0.5)" :
      p.color === "blue" ? "rgba(80,80,220,0.5)" :
      "rgba(160,160,160,0.45)";

    ctx.fillRect(0, 0, p.w, p.h);

    ctx.strokeStyle = p.type === "container" ? "#7a8694" : "black";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, p.w, p.h);

    if (p.walls?.length) {
      ctx.strokeStyle = "#000";
      ctx.lineWidth = INCH;
      ctx.lineCap = "butt";

      p.walls.forEach(w => {
        ctx.beginPath();
        ctx.moveTo(w[0][0], w[0][1]);
        ctx.lineTo(w[1][0], w[1][1]);
        ctx.stroke();
      });
    }

    ctx.restore();
  });
}

/* ---------- models ---------- */

function drawModels() {
  getModels().forEach(m => {
    if (m.x === null || m.base === null) return;
    drawBase(m);
  });
}

function drawBase(m) {
  const base = m.base.toLowerCase();
  ctx.beginPath();

  if (base.includes("x")) {
    const [w, h] = base.split("x").map(Number);
    ctx.ellipse(m.x, m.y, w / 2, h / 2, 0, 0, Math.PI * 2);
  } else {
    ctx.arc(m.x, m.y, parseFloat(base) / 2, 0, Math.PI * 2);
  }

  ctx.fillStyle = m.color;
  ctx.fill();
  ctx.strokeStyle = "black";
  ctx.stroke();
}

/* ---------- selection + ruler (oförändrat) ---------- */
/* ... exakt som du hade ... */

/* ---------- FORCE CANVAS DROP ACCEPT ---------- */

canvas.addEventListener("dragenter", e => {
  if (!window.sidebarDragging) return;
  e.preventDefault();
});

canvas.addEventListener("dragover", e => {
  if (!window.sidebarDragging) return;
  e.preventDefault();
  e.dataTransfer.dropEffect = "copy";
});

canvas.addEventListener("drop", e => {
  if (!window.sidebarDragging) return;
  e.preventDefault();
  window.sidebarDragging = false;

  const name = e.dataTransfer.getData("text/plain");
  if (!name) return;

  const unplaced = getModels().filter(
    m => m.name === name && m.x === null && m.base !== null
  );

  const PER_ROW = 5;
  const SPACING = 35;

  unplaced.forEach((m, i) => {
    m.x = e.offsetX + (i % PER_ROW) * SPACING;
    m.y = e.offsetY + Math.floor(i / PER_ROW) * SPACING;
  });

  draw();
});
