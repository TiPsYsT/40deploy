import { getModels } from "./state.js";

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

const INCH = 25.4;

// interaction
let dragging = false;
let dragOffsets = [];
let selecting = false;
let selectStart = null;

// ruler
let rulerActive = false;
let rulerStart = null;
let rulerEnd = null;

// mission / terrain
let mission = null;
let terrain = null;

// colors per unit
const COLORS = [
  "#e6194b", "#3cb44b", "#ffe119", "#4363d8",
  "#f58231", "#911eb4", "#46f0f0", "#f032e6",
  "#bcf60c", "#fabebe", "#008080", "#e6beff"
];
let colorIndex = 0;

/* ================= INIT ================= */

export function initBoard(m = null, t = null) {
  mission = m;
  terrain = t;
  draw();
}

/* ================= DRAW ================= */

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (terrain) drawTerrain(terrain.pieces);
  drawModels();

  if (selecting && selectStart) drawSelectionBox();
  if (rulerActive && rulerStart && rulerEnd) drawRuler();
}

/* ---------- terrain ---------- */

function drawTerrain(pieces) {
  ctx.fillStyle = "rgba(90,90,90,0.6)";
  pieces.forEach(p => ctx.fillRect(p.x, p.y, p.w, p.h));
}

/* ---------- models + bubbles ---------- */

function drawModels() {
  getModels().forEach(m => {
    if (m.x === null || m.base === null) return;

    // filled bubbles
    if (Array.isArray(m.bubbles)) {
      m.bubbles.forEach(r => {
        ctx.beginPath();
        ctx.fillStyle = (m.color ?? "#000") + "33";
        ctx.arc(m.x, m.y, r * INCH, 0, Math.PI * 2);
        ctx.fill();
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
  ctx.lineWidth = 4;
  ctx.strokeText(`${inches.toFixed(1)}"`, rulerEnd.x + 8, rulerEnd.y - 8);
  ctx.fillText(`${inches.toFixed(1)}"`, rulerEnd.x + 8, rulerEnd.y - 8);
}

/* ================= INPUT ================= */

window.addEventListener("keydown", e => {
  if (e.key.toLowerCase() === "r") rulerActive = true;

  const bubbleMap = { "1":1, "2":2, "3":3, "6":6, "9":9, "0":12 };
  if (bubbleMap[e.key]) {
    getModels().forEach(m => {
      if (m.selected) {
        if (!Array.isArray(m.bubbles)) m.bubbles = [];
        if (!m.bubbles.includes(bubbleMap[e.key])) {
          m.bubbles.push(bubbleMap[e.key]);
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
  const mx = e.offsetX;
  const my = e.offsetY;

  if (rulerActive) {
    rulerStart = rulerEnd = { x: mx, y: my };
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

  let color =
    getModels().find(m => m.name === name && m.color)?.color ??
    COLORS[colorIndex++ % COLORS.length];

  getModels().forEach(m => {
    if (m.name === name) m.color = color;
  });

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
};
