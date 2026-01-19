import { getModels } from "./state.js";

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

const INCH = 25.4;

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

// färger (roterar automatiskt)
const COLORS = [
  "#e6194b", "#3cb44b", "#ffe119", "#4363d8",
  "#f58231", "#911eb4", "#46f0f0", "#f032e6",
  "#bcf60c", "#fabebe", "#008080", "#e6beff"
];
let colorIndex = 0;

export function initBoard(m = null, t = null) {
  mission = m;
  terrain = t;
  draw();
}

function getUnitColor(name) {
  const existing = getModels().find(m => m.name === name && m.color);
  if (existing) return existing.color;

  const color = COLORS[colorIndex++ % COLORS.length];
  getModels().forEach(m => {
    if (m.name === name) m.color = color;
  });
  return color;
}

/* ================= DRAW ================= */

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (terrain) drawTerrain(terrain.pieces);
  drawModels();

  if (selecting && selectStart) drawSelectionBox();
  if (rulerActive && rulerStart && rulerEnd) drawRuler();
}

function drawModels() {
  getModels().forEach(m => {
    if (m.x === null || m.base === null) return;

    // bubbles
    if (Array.isArray(m.bubbles)) {
      m.bubbles.forEach(r => {
        ctx.beginPath();
        ctx.fillStyle = m.color + "33";
        ctx.arc(m.x, m.y, r * INCH, 0, Math.PI * 2);
        ctx.fill();
      });
    }

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

  ctx.strokeStyle = "black";
  ctx.stroke();
}

/* ================= RULER ================= */

function drawRuler() {
  const inches = Math.hypot(
    rulerEnd.x - rulerStart.x,
    rulerEnd.y - rulerStart.y
  ) / INCH;

  ctx.beginPath();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "black";
  ctx.moveTo(rulerStart.x, rulerStart.y);
  ctx.lineTo(rulerEnd.x, rulerEnd.y);
  ctx.stroke();

  ctx.font = "bold 22px sans-serif";
  ctx.strokeText(`${inches.toFixed(1)}"`, rulerEnd.x + 8, rulerEnd.y - 8);
  ctx.fillText(`${inches.toFixed(1)}"`, rulerEnd.x + 8, rulerEnd.y - 8);
}

/* ================= INPUT ================= */

window.addEventListener("keydown", e => {
  if (e.key.toLowerCase() === "r") rulerActive = true;

  const map = { "1":1, "2":2, "3":3, "6":6, "9":9, "0":12 };
  if (map[e.key]) {
    getModels().forEach(m => {
      if (m.selected) {
        if (!m.bubbles) m.bubbles = [];
        if (!m.bubbles.includes(map[e.key])) {
          m.bubbles.push(map[e.key]);
        }
      }
    });
    draw();
  }

  if (e.key.toLowerCase() === "c") {
    getModels().forEach(m => (m.bubbles = []));
    draw();
  }
});

window.addEventListener("keyup", e => {
  if (e.key.toLowerCase() === "r") {
    rulerActive = false;
    rulerStart = rulerEnd = null;
    draw();
  }
});

canvas.onmousedown = e => {
  if (rulerActive) {
    rulerStart = rulerEnd = { x: e.offsetX, y: e.offsetY };
    return;
  }

  selecting = true;
  selectStart = { x: e.offsetX, y: e.offsetY, cx: e.offsetX, cy: e.offsetY };
};

canvas.onmousemove = e => {
  if (rulerActive && rulerStart) {
    rulerEnd = { x: e.offsetX, y: e.offsetY };
    draw();
  }

  if (selecting) {
    selectStart.cx = e.offsetX;
    selectStart.cy = e.offsetY;
    draw();
  }
};

canvas.onmouseup = () => {
  selecting = false;
  selectStart = null;
};

/* ================= SIDEBAR DROP ================= */

canvas.ondragover = e => e.preventDefault();

canvas.ondrop = e => {
  e.preventDefault();
  const name = e.dataTransfer.getData("text/plain");
  if (!name) return;

  const color = getUnitColor(name);

  const unplaced = getModels().filter(
    m => m.name === name && m.x === null && m.base !== null
  );

  const PER_ROW = 5;
  const SPACING = 35;

  unplaced.forEach((m, i) => {
    m.x = e.offsetX + (i % PER_ROW) * SPACING;
    m.y = e.offsetY + Math.floor(i / PER_ROW) * SPACING;
    m.color = color;
  });

  draw();
};
