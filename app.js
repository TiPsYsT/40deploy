reader.onload = () => {
  console.log("JSON loaded");
  models = [];
  parseRoster(JSON.parse(reader.result));
};

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

const SCALE = 15; // px per inch
let models = [];
let selected = [];
let dragging = false;
let lastPos = null;

/* =========================
   DRAW LOOP
========================= */
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Board 60x44"
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, 60 * SCALE, 44 * SCALE);

  models.forEach(m => {
    ctx.beginPath();
    if (m.shape === "oval") {
      ctx.ellipse(m.x, m.y, m.w / 2, m.h / 2, 0, 0, Math.PI * 2);
    } else {
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
    }
    ctx.fillStyle = selected.includes(m) ? "red" : "black";
    ctx.fill();
  });

  requestAnimationFrame(draw);
}
draw();

/* =========================
   MOUSE
========================= */
canvas.onmousedown = e => {
  const mx = e.offsetX;
  const my = e.offsetY;

  selected = models.filter(m =>
    m.shape === "oval"
      ? Math.abs(mx - m.x) <= m.w / 2 && Math.abs(my - m.y) <= m.h / 2
      : Math.hypot(mx - m.x, my - m.y) <= m.r
  );

  if (selected.length) {
    dragging = true;
    lastPos = { x: mx, y: my };
  }
};

canvas.onmousemove = e => {
  if (!dragging) return;
  const dx = e.offsetX - lastPos.x;
  const dy = e.offsetY - lastPos.y;
  selected.forEach(m => {
    m.x += dx;
    m.y += dy;
  });
  lastPos = { x: e.offsetX, y: e.offsetY };
};

canvas.onmouseup = () => {
  dragging = false;
  lastPos = null;
};

/* =========================
   NEW RECRUIT IMPORT (CORRECT)
========================= */
document.getElementById("import").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    models = [];
    parseRoster(JSON.parse(reader.result));
  };
  reader.readAsText(file);
});

function parseRoster(data) {
  if (!data.roster || !data.roster.forces) {
    alert("Fel fil – exportera JSON från New Recruit");
    return;
  }

  let x = 120;
  let y = 120;

  data.roster.forces.forEach(force => {
    force.selections.forEach(sel => {
      y = parseSelection(sel, x, y);
      y += 40;
    });
  });
}

function parseSelection(sel, x, y) {
  // Look for model profiles (THIS IS THE KEY)
  if (sel.profiles) {
    sel.profiles.forEach(p => {
      if (p.type === "Model" && p.characteristics?.Base) {
        const base = parseBase(p.characteristics.Base);
        const count = sel.number || 1;

        for (let i = 0; i < count; i++) {
          models.push({
            shape: base.shape,
            r: base.r,
            w: base.w,
            h: base.h,
            x: x + i * 28,
            y
          });
        }
        y += 28;
      }
    });
  }

  // Recurse children
  if (sel.selections) {
    sel.selections.forEach(child => {
      y = parseSelection(child, x, y);
    });
  }

  return y;
}

/* =========================
   BASE PARSER
========================= */
function parseBase(baseString) {
  const scale = 0.06 * SCALE; // mm → px

  if (baseString.includes("x")) {
    const [w, h] = baseString.replace("mm", "").split("x").map(Number);
    return { shape: "oval", w: w * scale, h: h * scale };
  } else {
    const d = Number(baseString.replace("mm", ""));
    return { shape: "circle", r: (d / 2) * scale };
  }
}
