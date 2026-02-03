export function getHitRadius(model) {
  const base = model.base.toLowerCase();
  if (base.includes("x")) {
    const [w, h] = base.split("x").map(Number);
    return Math.max(w, h) / 2 + 4;
  }
  return parseFloat(base) / 2 + 4;
}

export function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function drawBase(ctx, model) {
  const base = model.base.toLowerCase();
  ctx.beginPath();

  if (base.includes("x")) {
    const [w, h] = base.split("x").map(Number);
    ctx.ellipse(model.x, model.y, w / 2, h / 2, 0, 0, Math.PI * 2);
  } else {
    ctx.arc(model.x, model.y, parseFloat(base) / 2, 0, Math.PI * 2);
  }

  ctx.fillStyle = model.color;
  ctx.fill();
  ctx.strokeStyle = "black";
  ctx.stroke();
}
