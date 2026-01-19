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

// unit colors
const COLORS = [
  "#e6194b","#3cb44b","#ffe119","#4363d8",
  "#f58231","#911eb4","#46f0f0","#f032e6",
  "#bcf60c","#fabebe","#008080","#e6beff"
];
let colorIndex = 0;

/* ================= INIT ================= */

export function initBoard(m = null, t = null) {
  mission = m;
  terrain = t;
  assignUnitColors();
  draw();
}

function assignUnitColors() {
  const map = new Map();
  getModels().forEach(m => {
    if (!map.has(m.name)) {
      map.set(m.name, COLORS[colorIndex++ % COLORS.length]);
    }
    m.color = map.get(m.name);
  });
}

/* ================= DRAW ================= */

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (mission) {
    drawZones(mission.zones);
    drawObjectives(mission.objectives);
  }

  if (terrain) drawTerrain(terrain.pieces);

  drawModels();

  if (selecting && selectStart) drawSelectionBox();
  if (rulerActive && rulerStart && rulerEnd) drawRuler();
}

/* ---------- deployment ---------- */

function drawZones(zones) {
  drawPolys(zones.player, "rgba(0,0,255,0.15)");
  drawPolys(zones.enemy, "rgba(255,0,0,0.15)");
}

function drawPolys(polys, color) {
  ctx.fillStyle = color;
  polys.forEach(poly => {
    ctx.beginPath();
    poly.forEach(([x,y], i) =>
      i === 0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y)
    );
    ctx.closePath();
    ctx.fill();
  });
}

/* ---------- objectives ---------- */

function drawObjectives(objs = []) {
  objs.forEach(o => {
    ctx.beginPath();
    ctx.fillStyle = "gold";
    ctx.arc(o.x, o.y, OBJECTIVE_R, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.arc(o.x, o.y, CONTROL_R, 0, Math.PI * 2);
    ctx.stroke();
  });
}

/* ---------- terrain ---------- */

function drawTerrain(pieces) {
  pieces.forEach(p => {
    // footprint
    if (p.type === "ruin") {
      ctx.fillStyle = "rgba(80,80,80,0.35)";
    } else if (p.type === "container") {
      ctx.fillStyle = "rgba(120,120,120,0.6)";
    } else {
      ctx.fillStyle = "rgba(160,160,160,0.4)";
    }

    ctx.fillRect(p.x, p.y, p.w, p.h);

    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.strokeRect(p.x, p.y, p.w, p.h);

    // walls
    if (Array.isArray(p.walls)) {
      ctx.strokeStyle = "black";
      ctx.lineWidth = p.wall || 3;

      p.walls.forEach(w => {
        ctx.beginPath();
        ctx.moveTo(p.x + w[0][0], p.y + w[0][1]);
        ctx.lineTo(p.x + w[1][0], p.y + w[1][1]);
        ctx.stroke();
      });
    }
  });
}


/* ---------- models + bubbles ---------- */

function drawModels() {
  getModels().forEach(m => {
    if (m.x === null || m.base === null) return;

    // bubbles: transparent fill + black outline
if (Array.isArray(m.bubbles)) {
  m.bubbles.forEach(r => {
    ctx.beginPath();
    ctx.fillStyle = hexToRgba(m.color, 0.25); // genomskinlig
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

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/* ---------- selection ---------- */

function drawSelectionBox() {
  const x = Math.min(selectStart.x, selectStart.cx);
  const y = Math.min(selectStart.y, selectStart.cy);
  const w = Math.abs(selectStart.cx - selectStart.x);
  const h = Math.abs(selectStart.cy - selectStart.y);

  ctx.strokeStyle = "blue";
  ctx.setLineDash([5,5]);
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

/* ---------- input ---------- */

window.addEventListener("keydown", e => {
  if (e.key === "r" || e.key === "R") rulerActive = true;

  const map = { "1":1,"2":2,"3":3,"6":6,"9":9,"0":12 };
  if (map[e.key]) {
    getModels().forEach(m => {
      if (m.selected) {
        m.bubbles ??= [];
        if (!m.bubbles.includes(map[e.key])) {
          m.bubbles.push(map[e.key]);
        }
      }
    });
    draw();
  }

  if (e.key === "c" || e.key === "C") {
    getModels().forEach(m => (m.bubbles = []));
    draw();
  }
});

window.addEventListener("keyup", e => {
  if (e.key === "r" || e.key === "R") {
    rulerActive = false;
    rulerStart = rulerEnd = null;
    draw();
  }
});

/* ---------- mouse ---------- */

canvas.onmousedown = e => {
  if (rulerActive) {
    rulerStart = rulerEnd = { x: e.offsetX, y: e.offsetY };
    draw();
    return;
  }

  const hit = [...getModels()].reverse().find(
    m =>
      m.x !== null &&
      Math.hypot(e.offsetX - m.x, e.offsetY - m.y) <= getHitRadius(m)
  );

  if (hit) {
    if (!hit.selected) {
      getModels().forEach(m => (m.selected = false));
      hit.selected = true;
    }

    dragging = true;
    dragOffsets = getModels()
      .filter(m => m.selected)
      .map(m => ({
        m,
        dx: e.offsetX - m.x,
        dy: e.offsetY - m.y
      }));
  } else {
    getModels().forEach(m => (m.selected = false));
    selecting = true;
    selectStart = {
      x: e.offsetX,
      y: e.offsetY,
      cx: e.offsetX,
      cy: e.offsetY
    };
  }

  draw();
};

canvas.onmousemove = e => {
  if (rulerActive && rulerStart) {
    rulerEnd = { x: e.offsetX, y: e.offsetY };
    draw();
    return;
  }

  if (dragging) {
    dragOffsets.forEach(o => {
      o.m.x = e.offsetX - o.dx;
      o.m.y = e.offsetY - o.dy;
    });
    draw();
  }

  if (selecting && selectStart) {
    selectStart.cx = e.offsetX;
    selectStart.cy = e.offsetY;

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

/* ---------- sidebar drop ---------- */

canvas.ondragover = e => e.preventDefault();

canvas.ondrop = e => {
  e.preventDefault();
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
};
