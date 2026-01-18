import { getModels } from "./state.js";

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

let dragging = null;

const PX_PER_MM = 2; // justerar vi i steg 2C

export function spawnModel(unit) {
  const model = getModels().find(m => m.name === unit.name && m.x === null);
  if (!model) return;

  model.x = 40;
  model.y = 40;
  draw();
}

export function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  getModels().forEach(m => {
    if (m.x === null) return;

    drawBase(m);
  });
}

function drawBase(model) {
  const base = model.base.toLowerCase();

  ctx.beginPath();

  if (base.includes("x")) {
    // oval: ex "60x35"
    const [w, h] = base.split("x").map(v => parseFloat(v));
    ctx.ellipse(
      model.x,
      model.y,
      (w / 2) * PX_PER_MM,
      (h / 2) * PX_PER_MM,
      0,
      0,
      Math.PI * 2
    );
  } else {
    // rund bas: ex "32mm"
    const mm = parseFloat(base);
    const r = (mm / 2) * PX_PER_MM;
    ctx.arc(model.x, model.y, r, 0, Math.PI * 2);
  }

  ctx.stroke();
}

/* Drag & drop */
canvas.onmousedown = e => {
  getModels().forEach(m => {
    if (m.x === null) return;

    const dx = e.offsetX - m.x;
    const dy = e.offsetY - m.y;

    if (Math.hypot(dx, dy) < 30) {
      dragging = m;
    }
  });
};

canvas.onmousemove = e => {
  if (!dragging) return;

  dragging.x = e.offsetX;
  dragging.y = e.offsetY;
  draw();
};

canvas.onmouseup = () => {
  dragging = null;
};
