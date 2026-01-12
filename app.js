const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

const SCALE = 15; // px per inch (60x44 board)
let models = [];        // baser på bordet
let armyUnits = [];    // ej placerade units (från NR)
let selected = [];
let dragging = false;
let lastPos = null;
let activeUnit = null;

/* =========================
   DRAW LOOP
========================= */
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Board outline
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, 60 * SCALE, 44 * SCALE);

  models.forEach(m => {
    ctx.beginPath();
    if (m.shape === "oval") {
      ctx.ellipse(m.x, m.y, m.w/2, m.h/2, 0, 0, Math.PI*2);
    } else {
      ctx.arc(m.x, m.y, m.r, 0, Math.PI*2);
    }
    ctx.fillStyle = selected.includes(m) ? "red" : "black";
    ctx.fill();
  });

  requestAnimationFrame(draw);
}
draw();

/* =========================
   MOUSE MOVE MODELS
========================= */
canvas.onmousedown = e => {
  const mx = e.offsetX, my = e.offsetY;
  selected = models.filter(m =>
    m.shape === "oval"
      ? Math.abs(mx-m.x)<=m.w/2 && Math.abs(my-m.y)<=m.h/2
      : Math.hypot(mx-m.x, my-m.y)<=m.r
  );
  if (selected.length) {
    dragging = true;
    lastPos = {x:mx, y:my};
  }
};

canvas.onmousemove = e => {
  if (!dragging) return;
  const dx = e.offsetX - lastPos.x;
  const dy = e.offsetY - lastPos.y;
  selected.forEach(m => { m.x+=dx; m.y+=dy; });
  lastPos = {x:e.offsetX, y:e.offsetY};
};

canvas.onmouseup = () => {
  dragging = false;
  lastPos = null;
};

/* =========================
   PLACE UNIT FROM SIDEBAR
========================= */
canvas.onclick = e => {
  if (!activeUnit) return;

  for (let i=0;i<activeUnit.count;i++) {
    models.push({
      shape: activeUnit.base.shape,
      r: activeUnit.base.r,
      w: activeUnit.base.w,
      h: activeUnit.base.h,
      x: e.offsetX + i*28,
      y: e.offsetY
    });
  }

  activeUnit.spawned = true;
  activeUnit = null;
  renderUnitList();
};

/* =========================
   SIDEBAR
========================= */
function renderUnitList() {
  const div = document.getElementById("units");
  div.innerHTML = "";

  armyUnits.forEach(u => {
    if (u.spawned) return;
    const b = document.createElement("button");
    b.textContent = u.label
      ? `${u.label} (${u.count})`
      : `Unit (${u.count})`;
    b.onclick = () => activeUnit = u;
    div.appendChild(b);
  });
}

/* =========================
   NEW RECRUIT IMPORT
========================= */
document.getElementById("import").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    armyUnits = [];
    models = [];
    parseRoster(JSON.parse(reader.result));
    renderUnitList();
  };
  reader.readAsText(file);
});

function parseRoster(data) {
  const forces = data.roster?.forces || data.forces;
  if (!forces) {
    alert("Fel fil – exportera JSON från New Recruit");
    return;
  }
  forces.forEach(f =>
    f.selections?.forEach(sel => parseSelection(sel))
  );
}

function parseSelection(sel) {
  if (sel.profiles) {
    sel.profiles.forEach(p => {
      const baseStr =
        p.characteristics?.Base ||
        p.characteristics?.["Base Size"];
      if (p.type !== "Model" || !baseStr) return;

      armyUnits.push({
        label: sel.name || null,
        count: sel.number || 1,
        base: parseBase(baseStr),
        spawned: false
      });
    });
  }
  sel.selections?.forEach(child => parseSelection(child));
}

/* =========================
   BASE PARSER
========================= */
function parseBase(str) {
  const scale = 0.06 * SCALE; // mm → px
  if (str.includes("x")) {
    const [w,h] = str.replace("mm","").split("x").map(Number);
    return { shape:"oval", w:w*scale, h:h*scale };
  } else {
    const d = Number(str.replace("mm",""));
    return { shape:"circle", r:(d/2)*scale };
  }
}
