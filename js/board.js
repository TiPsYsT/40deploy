import { state } from "./state.js";

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

const SCALE = 15;
let dragging = null;
let last = null;

export function setupBoard() {
  canvas.onmousedown = onDown;
  canvas.onmousemove = onMove;
  canvas.onmouseup = () => dragging = null;
  requestAnimationFrame(draw);
}

export function spawnUnit(unit) {
  let x = 100;
  let y = 100 + state.models.length * 20;

  for (let i = 0; i < unit.count; i++) {
    state.models.push({
      ...unit.base,
      x: x + i * 28,
      y,
      label: unit.name
    });
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeRect(0, 0, 60 * SCALE, 44 * SCALE);

  state.models.forEach(m => {
    ctx.beginPath();
    if (m.shape === "circle") {
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
    } else {
      ctx.ellipse(m.x, m.y, m.w / 2, m.h / 2, 0, 0, Math.PI * 2);
    }
    ctx.fillStyle = "black";
    ctx.fill();
  });

  requestAnimationFrame(draw);
}

function onDown(e) {
  const mx = e.offsetX;
  const my = e.offsetY;

  state.models.forEach(m => {
    const hit = m.shape === "circle"
      ? Math.hypot(mx - m.x, my - m.y) <= m.r
      : Math.abs(mx - m.x) <= m.w / 2 && Math.abs(my - m.y) <= m.h / 2;

    if (hit) {
      dragging = m;
      last = { x: mx, y: my };
    }
  });
}

function onMove(e) {
  if (!dragging) return;

  const dx = e.offsetX - last.x;
  const dy = e.offsetY - last.y;

  dragging.x += dx;
  dragging.y += dy;

  last = { x: e.offsetX, y: e.offsetY };
}

