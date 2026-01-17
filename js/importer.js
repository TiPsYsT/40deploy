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

    // om detta är en unit → uppdatera unit-namn
    if (sel.type === "unit") {
      unitName = normalizeName(sel.name);
    }

    // FALL 1: horde / multi-model
    if (
      sel.type === "model" &&
      typeof sel.number === "number" &&
      sel.number > 0 &&
      unitName
    ) {
      const base = resolveBase(unitName);
      if (base) {
        for (let i = 0; i < sel.number; i++) {
          models.push({
            name: unitName,
            base,
            x: null,
            y: null
          });
        }
      }
    }

    // FALL 2: single-model / unit-baserad modell
    if (
      sel.type === "unit" &&
      typeof sel.number === "number" &&
      sel.number > 0
    ) {
      const base = resolveBase(unitName);
      if (base) {
        for (let i = 0; i < sel.number; i++) {
          models.push({
            name: unitName,
            base,
            x: null,
            y: null
          });
        }
      }
    }

    if (!Array.isArray(sel.selections)) return;
    sel.selections.forEach(child =>
      walk(child, unitName)
    );
  }

  return models;
}

function normalizeName(name) {
  return name
    .replace(/\s*\(.*\)$/g, "")
    .replace(/\s*–.*$/g, "")
    .trim()
    .toLowerCase();
}
