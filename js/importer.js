import { resolveBase } from "./baseResolver.js";

export function importNewRecruit(json) {
  const models = [];

  const forces = json.roster?.forces;
  if (!forces) return models;

  forces.forEach(force => {
    force.selections?.forEach(sel => walk(sel, true));
  });

  function walk(sel, isTopLevel = false) {
    // ✅ skapa modeller ENDAST på toppnivå
    if (
      isTopLevel &&
      typeof sel.number === "number" &&
      sel.number > 0
    ) {
      const name = normalizeName(sel.name);
      const base = resolveBase(name);

      for (let i = 0; i < sel.number; i++) {
        models.push({
          name,
          base,
          x: null,
          y: null
        });
      }
    }

    if (!Array.isArray(sel.selections)) return;
    sel.selections.forEach(child => walk(child, false));
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
