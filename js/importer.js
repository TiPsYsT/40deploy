import { state } from "./state.js";
import { renderSidebar } from "./sidebar.js";

// 3.1 setup
export function setupImporter() {
  document.getElementById("import").addEventListener("change", onFile);
}

// 3.2 file handler
function onFile(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    parseNewRecruit(JSON.parse(reader.result));
    renderSidebar();
  };
  reader.readAsText(file);
}

// 3.3 parse root
function parseNewRecruit(data) {
  state.armyUnits = [];

  if (!data?.roster?.forces) {
    alert("Fel fil – exportera JSON från New Recruit");
    return;
  }

  data.roster.forces.forEach(force => {
    force.selections.forEach(walkSelection);
  });
}

// 3.4 recursive walk
function walkSelection(sel) {
  if (sel.profiles) {
    sel.profiles.forEach(p => {
      if (p.type === "Model" && p.characteristics?.Base) {
        state.armyUnits.push({
          name: sel.name,
          count: sel.number || 1,
          base: parseBase(p.characteristics.Base)
        });
      }
    });
  }

  if (sel.selections) {
    sel.selections.forEach(walkSelection);
  }
}

// 3.5 base parser
function parseBase(base) {
  const MM_TO_PX = 0.06 * 15;

  if (base.includes("x")) {
    const [w, h] = base.replace("mm", "").split("x").map(Number);
    return { shape: "oval", w: w * MM_TO_PX, h: h * MM_TO_PX };
  }

  const d = Number(base.replace("mm", ""));
  return { shape: "circle", r: (d / 2) * MM_TO_PX };
}
