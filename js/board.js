import { getModels } from "./state.js";

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
  terrain = t;
  draw();
}

/* ================= DRAW ================= */

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (mission) {
    // DEPLOYMENT = LINJER (enda sanningen)
    if (Array.isArray(mission.deployment)) {
      drawDeploymentLines(mission.deployment);
    }

    // OBJECTIVES (inch eller mm)
    drawObjectives(mission.objectives);
  }

  if (terrain) drawTerrain(terrain.pieces);

  drawModels();

  if (selecting && selectStart) drawSelectionBox();
  if (rulerActive && rulerStart && rulerEnd) drawRuler();
}

/* ---------- deployment (LINJER) ---------- */

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
    // terrain editor → inch
    // gamla missions → mm
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

    /* ---------- FOOTPRINT ---------- */
    ctx.fillStyle =
      p.color === "red"  ? "rgba(220,80,80,0.5)" :
      p.color === "blue" ? "rgba(80,80,220,0.5)" :
      "rgba(160,160,160,0.45)";

    ctx.fillRect(0, 0, p.w, p.h);

    /* ---------- OUTLINE ---------- */
    ctx.strokeStyle = p.type === "container" ? "#7a8694" : "black";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, p.w, p.h);

    /* ---------- WALLS ---------- */
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

/* ---------- models + bubbles ---------- */

function drawModels() {
  getModels().forEach(m => {
    if (m.x === null || m.base === null) return;

    if (Array.isArray(m.bubbles)) {
      m.bubbles.forEach(r => {
        ctx.beginPath();
        ctx.fillStyle = hexToRgba(m.color, 0.25);
        ctx.arc(m.x, m.y, r * INCH, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.arc(m.x, m.y, r * INCH, 0, Math.PI * 2);
        ctx.stroke();
      });
    }

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

function getHitRadius(m) {
  const base = m.base.toLowerCase();
  if (base.includes("x")) {
    const [w, h] = base.split("x").map(Number);
    return Math.max(w, h) / 2 + 4;
  }
  return parseFloat(base) / 2 + 4;
}

function hexToRgba(hex, a) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

/* ---------- selection ---------- */

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
  const inches =
    Math.hypot(
      rulerEnd.x - rulerStart.x,
      rulerEnd.y - rulerStart.y
    ) / INCH;

  ctx.beginPath();
  ctx.strokeStyle = "black";
  ctx.lineWidth = 3;
  ctx.moveTo(rulerStart.x, rulerStart.y);
  ctx.lineTo(rulerEnd.x, rulerEnd.y);
  ctx.stroke();

  ctx.font = "bold 22px sans-serif";
  ctx.strokeText(`${inches.toFixed(1)}"`, rulerEnd.x + 8, rulerEnd.y - 8);
  ctx.fillText(`${inches.toFixed(1)}"`, rulerEnd.x + 8, rulerEnd.y - 8);
}

/* ---------- input & mouse ---------- */
/* RESTEN AV FILEN ÄR OBEHANDLAD / IDENTISK MED DIN */
