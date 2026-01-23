import { getModels } from "./state.js";

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

const INCH = 25.4;
const OBJECTIVE_R = 20;
const CONTROL_R = 76;

// state
let mission = null;
let terrain = { pieces: [] };

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

  if (t?.pieces) {
    terrain = t;
  } else if (t?.terrain?.pieces) {
    terrain = t.terrain;
  } else {
    terrain = { pieces: [] };
  }

  draw();
}

/* ================= DRAW ================= */

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (mission) {
    if (mission.zones) {
      drawZones(mission.zones);
    }

    // ✅ NYTT: deployment-linjer
    if (Array.isArray(mission.deployment)) {
      drawDeploymentLines(mission.deployment);
    }

    drawObjectives(mission.objectives);
  }

  if (terrain?.pieces) drawTerrain(terrain.pieces);

  drawModels();

  if (selecting && selectStart) drawSelectionBox();
  if (rulerActive && rulerStart && rulerEnd) drawRuler();
}

/* ---------- deployment (zones) ---------- */

function drawZones(zones) {
  if (!zones) return;
  drawPolys(zones.player, "rgba(0,0,255,0.15)");
  drawPolys(zones.enemy, "rgba(255,0,0,0.15)");
}

function drawPolys(polys = [], color) {
  ctx.fillStyle = color;
  polys.forEach(poly => {
    ctx.beginPath();
    poly.forEach(([x, y], i) =>
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    );
    ctx.closePath();
    ctx.fill();
  });
}

/* ---------- deployment (LINJER) ---------- */
/* ✅ NYTT – påverkar inget annat */

function drawDeploymentLines(lines = []) {
  lines.forEach(l => {
    ctx.strokeStyle =
      l.type === "player"
        ? "rgba(0,0,255,0.8)"
        : "rgba(255,0,0,0.8)";

    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(l.a[0] * INCH, l.a[1] * INCH);
    ctx.lineTo(l.b[0] * INCH, l.b[1] * INCH);
    ctx.stroke();
  });
}

/* ---------- objectives ---------- */

function drawObjectives(objs = []) {
  objs.forEach(o => {
    // ✅ FIX: mission-objectives är i inch
    const x = o.x * INCH;
    const y = o.y * INCH;

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

function drawTerrain(pieces = []) {
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

/* ---------- RESTEN ÄR OÄNDRAT ---------- */
/* mouse, selection, sidebar drop – exakt som du hade */
