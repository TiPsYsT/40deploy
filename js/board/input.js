import { getModels } from "../state.js";
import { canvas } from "./context.js";
import { boardState } from "./state.js";
import { getHitRadius } from "./utils.js";

function rotateSelectedModels(step) {
  getModels().forEach(m => {
    if (!m.selected || m.base === null) return;
    m.rotation = ((Number(m.rotation) || 0) + step) % 360;
    if (m.rotation < 0) m.rotation += 360;
  });
}


export function registerBoardEvents(onChange) {
  window.addEventListener("keydown", e => {
    if (e.key === "r" || e.key === "R") boardState.rulerActive = true;

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
      onChange();
    }

    if (e.key === "c" || e.key === "C") {
      getModels().forEach(m => (m.bubbles = []));
      onChange();
    }

    if (e.key === "q" || e.key === "Q" || e.key === "e" || e.key === "E") {
      const step = e.shiftKey ? 15 : 5;
      rotateSelectedModels((e.key === "q" || e.key === "Q") ? -step : step);
      onChange();
    }
  });

  window.addEventListener("keyup", e => {
    if (e.key === "r" || e.key === "R") {
      boardState.rulerActive = false;
      boardState.rulerStart = boardState.rulerEnd = null;
      onChange();
    }
  });

  canvas.onmousedown = e => {
    if (boardState.rulerActive) {
      boardState.rulerStart = boardState.rulerEnd = {
        x: e.offsetX,
        y: e.offsetY
      };
      onChange();
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

      boardState.dragging = true;
      boardState.dragOffsets = getModels()
        .filter(m => m.selected)
        .map(m => ({
          m,
          dx: e.offsetX - m.x,
          dy: e.offsetY - m.y
        }));
    } else {
      getModels().forEach(m => (m.selected = false));
      boardState.selecting = true;
      boardState.selectStart = {
        x: e.offsetX,
        y: e.offsetY,
        cx: e.offsetX,
        cy: e.offsetY
      };
    }

    onChange();
  };

  canvas.onmousemove = e => {
    if (boardState.rulerActive && boardState.rulerStart) {
      boardState.rulerEnd = { x: e.offsetX, y: e.offsetY };
      onChange();
      return;
    }

    if (boardState.dragging) {
      boardState.dragOffsets.forEach(o => {
        o.m.x = e.offsetX - o.dx;
        o.m.y = e.offsetY - o.dy;
      });
      onChange();
    }

    if (boardState.selecting && boardState.selectStart) {
      boardState.selectStart.cx = e.offsetX;
      boardState.selectStart.cy = e.offsetY;

      const x1 = Math.min(boardState.selectStart.x, boardState.selectStart.cx);
      const y1 = Math.min(boardState.selectStart.y, boardState.selectStart.cy);
      const x2 = Math.max(boardState.selectStart.x, boardState.selectStart.cx);
      const y2 = Math.max(boardState.selectStart.y, boardState.selectStart.cy);

      getModels().forEach(m => {
        if (m.x === null) return;
        m.selected =
          m.x >= x1 && m.x <= x2 &&
          m.y >= y1 && m.y <= y2;
      });
      onChange();
    }
  };

  canvas.onmouseup = () => {
    boardState.dragging = false;
    boardState.selecting = false;
    boardState.selectStart = null;
    boardState.dragOffsets = [];
  };

  canvas.ondragover = e => e.preventDefault();

  canvas.ondrop = e => {
    e.preventDefault();
    const name = e.dataTransfer.getData("text/plain");
    if (!name) return;

    const unplaced = getModels().filter(
      m => m.name === name && m.x === null && m.base !== null
    );

    const perRow = 5;
    const spacing = 35;

    unplaced.forEach((m, i) => {
      m.x = e.offsetX + (i % perRow) * spacing;
      m.y = e.offsetY + Math.floor(i / perRow) * spacing;
    });

    onChange();
  };
}
