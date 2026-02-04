import { getModels } from "../state.js";
import { CONTROL_R, INCH, OBJECTIVE_R } from "./constants.js";
import { canvas, ctx } from "./context.js";
import { boardState } from "./state.js";
import { drawBase, getHitRadius, hexToRgba } from "./utils.js";

export function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (boardState.mission) {
    drawZones(boardState.mission.zones);
    drawObjectives(boardState.mission.objectives);
  }

  if (boardState.terrain) drawTerrain(boardState.terrain.pieces);

  drawModels();

  if (boardState.selecting && boardState.selectStart) drawSelectionBox();
  if (boardState.rulerActive && boardState.rulerStart && boardState.rulerEnd) {
    drawRuler();
  }
}

function drawZones(zones) {
  drawPolys(zones.player, "rgba(0,0,255,0.15)");
  drawPolys(zones.enemy, "rgba(255,0,0,0.15)");
}

function drawPolys(polys, color) {
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

    drawBase(ctx, m);

    if (m.selected) {
      ctx.beginPath();
      ctx.strokeStyle = "blue";
      ctx.lineWidth = 2;
      ctx.arc(m.x, m.y, getHitRadius(m) + 4, 0, Math.PI * 2);
      ctx.stroke();
    }
  });
}

function drawSelectionBox() {
  const x = Math.min(boardState.selectStart.x, boardState.selectStart.cx);
  const y = Math.min(boardState.selectStart.y, boardState.selectStart.cy);
  const w = Math.abs(boardState.selectStart.cx - boardState.selectStart.x);
  const h = Math.abs(boardState.selectStart.cy - boardState.selectStart.y);

  ctx.strokeStyle = "blue";
  ctx.setLineDash([5, 5]);
  ctx.strokeRect(x, y, w, h);
  ctx.setLineDash([]);
}

function drawRuler() {
  const inches =
    Math.hypot(
      boardState.rulerEnd.x - boardState.rulerStart.x,
      boardState.rulerEnd.y - boardState.rulerStart.y
    ) / INCH;

  ctx.beginPath();
  ctx.strokeStyle = "black";
  ctx.lineWidth = 3;
  ctx.moveTo(boardState.rulerStart.x, boardState.rulerStart.y);
  ctx.lineTo(boardState.rulerEnd.x, boardState.rulerEnd.y);
  ctx.stroke();

  ctx.font = "bold 22px sans-serif";
  ctx.strokeText(
    `${inches.toFixed(1)}"`,
    boardState.rulerEnd.x + 8,
    boardState.rulerEnd.y - 8
  );
  ctx.fillText(
    `${inches.toFixed(1)}"`,
    boardState.rulerEnd.x + 8,
    boardState.rulerEnd.y - 8
  );
}
