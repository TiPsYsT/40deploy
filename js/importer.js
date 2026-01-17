import { resolveBase } from "./baseResolver.js";

export function importNewRecruit(json) {
  const models = [];

  const forces = json.roster?.forces;
  if (!forces) return models;

  forces.forEach(force => {
    force.selections?.forEach(sel => walk(sel, null));
  });

  function walk(sel, currentUnitName) {
    let unitName = currentUnitName;

    // 🟢 När vi träffar en unit → detta är SANNINGEN för namnet
    if (sel.type === "unit") {
      unitName = normalizeName(sel.name);
    }

    // 🟢 FALL 1: horde / multi-model (model-noder)
    if (
      sel.type === "model" &&
      typeof sel.number === "number" &&
      sel.number > 0 &&
      unitName
    ) {
      const base = resolveBase(unitName);

      for (let i = 0; i < sel.number; i++) {
        models.push({
          name: unitName,
          base,
          x: null,
          y: null
        });
      }
    }

    // 🟢 FALL 2: single-model unit (ingen model-child)
    if (
      sel.type === "unit" &&
      typeof sel.number === "number" &&
      sel.number > 0 &&
      !hasModelChildren(sel)
    ) {
      const base = resolveBase(unitName);

      for (let i = 0; i < sel.number; i++) {
        models.push({
          name: unitName,
          base,
          x: null,
          y: null
        });
      }
    }

    if (!Array.isArray(sel.selections)) return;
    sel.selections.forEach(child =>
      walk(child, unitName)
    );
  }

  return models;
}

function hasModelChildren(sel) {
  if (!Array.isArray(sel.selections)) return false;
  return sel.selections.some(c => c.type === "model");
}

function normalizeName(name) {
  return name
    .replace(/\s*\(.*\)$/g, "")
    .replace(/\s*–.*$/g, "")
    .trim()
    .toLowerCase();
}
