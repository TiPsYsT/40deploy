import { state } from "./state.js";
import { renderSidebar } from "./sidebar.js";

export function setupImporter() {
  document.getElementById("import").addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      parseNewRecruit(JSON.parse(reader.result));
      renderSidebar();
    };
    reader.readAsText(file);
  });
}

function parseNewRecruit(data) {
  state.armyUnits = [];

  if (!data.roster?.forces) {
    alert("Fel fil (New Recruit JSON)");
    return;
  }

  data.roster.forces.forEach(force => {
    force.selections.forEach(sel => walkSelection(sel));
  });
}

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

function parseBase(base) {
  const mmToPx = 0.06 * 15;

  if (base.includes("x")) {
    const [w, h] = base.replace("mm", "").split("x").map(Number);
    return { shape: "oval", w: w * mmToPx, h: h * mmToPx };
  }

  const d = Number(base.replace("mm", ""));
  return { shape: "circle", r: (d / 2) * mmToPx };
}

