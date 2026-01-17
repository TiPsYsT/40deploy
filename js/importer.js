import { resolveBase } from "./baseResolver.js";

export function importNewRecruit(json) {
  const models = [];

  const forces = json.roster?.forces;
  if (!forces) return models;

  forces.forEach(force => {
    force.selections?.forEach(sel => handleUnit(sel));
  });

  function handleUnit(sel) {
    if (sel.type !== "unit") {
      if (Array.isArray(sel.selections)) {
        sel.selections.forEach(handleUnit);
      }
      return;
    }

    const unitName = normalizeName(sel.name);
    const base = resolveBase(unitName);
    if (!base) return;

    // 🔑 Regel 1: giltiga model-children
    const modelChildren = findValidModelChildren(sel, unitName);

    if (modelChildren.length > 0) {
      modelChildren.forEach(m => {
        for (let i = 0; i < m.number; i++) {
          models.push({
            name: unitName,
            base,
            x: null,
            y: null
          });
        }
      });
      return;
    }

    // 🔑 Regel 2: fallback till unit.number
    if (typeof sel.number === "number" && sel.number > 0) {
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

  return models;
}

function findValidModelChildren(unit, unitName) {
  if (!Array.isArray(unit.selections)) return [];

  return unit.selections.filter(s =>
    s.type === "model" &&
    typeof s.number === "number" &&
    s.number > 0 &&
    normalizeName(s.name).includes(unitName)
  );
}

function normalizeName(name) {
  return name
    .replace(/\s*\(.*\)$/g, "")
    .replace(/\s*–.*$/g, "")
    .trim()
    .toLowerCase();
}
