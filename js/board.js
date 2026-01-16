import { getModels } from "./state.js";

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

let dragging = null;

export function spawnModel(unit) {
  const model = getModels().find(m => m.name === unit.name && m.x === null);
  if (!model) return;

  model.x = 30;
  model.y = 30;
  draw();
}

export function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  getModels().forEach(m => {
    if (m.x === null) return;

    const r = parseBase(m.base);
    ctx.beginPath();
    ctx.arc(m.x, m.y, r, 0, Math.PI * 2);
    ctx.stroke();
  });
}

function parseBase(base) {
  if (base.includes("x")) return 20; // oval placeholder
  return parseInt(base) / 2 / 3; // mm → px (grov)
}

canvas.onmousedown = e => {
  getModels().forEach(m => {
    if (!m.x) return;
    const dx = e.offsetX - m.x;
    const dy = e.offsetY - m.y;
    if (Math.hypot(dx, dy) < parseBase(m.base)) dragging = m;
  });
};

canvas.onmousemove = e => {
  if (!dragging) return;
  dragging.x = e.offsetX;
  dragging.y = e.offsetY;
  draw();
};

canvas.onmouseup = () => dragging = null;
