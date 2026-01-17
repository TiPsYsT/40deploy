import { resolveBase } from "./baseResolver.js";

export function importNewRecruit(json) {
  const models = [];

  const forces = json.roster?.forces;
  if (!forces) return models;

  forces.forEach(force => {
    force.selections?.forEach(sel => walk(sel));
  });

  function walk(sel) {
    if (sel.type === "unit") {
      const unitName = normalizeName(sel.name);
      const base = resolveBase(unitName);
      if (!base) return;

      const modelChildren = getModelChildren(sel);

      // FALL A: unit med model-children (hordes)
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
      }
      // FALL B: single-model unit (inga model-children)
      else if (typeof sel.number === "number" && sel.number > 0) {
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
    sel.selections.forEach(child => walk(child));
  }

  return models;
}

function getModelChildren(sel) {
  if (!Array.isArray(sel.selections)) return [];
  return sel.selections.filter(
    s => s.type === "model" && typeof s.number === "number" && s.number > 0
  );
}

function normalizeName(name) {
  return name
    .replace(/\s*\(.*\)$/g, "")
    .replace(/\s*–.*$/g, "")
    .trim()
    .toLowerCase();
}
