import { resolveBase } from "./baseResolver.js";

export function importNewRecruit(json) {
  const models = [];

  const forces = json.roster?.forces;
  if (!forces) return models;

  forces.forEach(force => {
    force.selections?.forEach(sel => walk(sel, null));
  });

  function walk(sel, parentName) {
    const currentName = parentName ?? sel.name;

    // ✅ ENDA stället vi skapar modeller
    if (sel.type === "model" && typeof sel.number === "number") {
      const name = normalizeName(currentName);
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
    sel.selections.forEach(child =>
      walk(child, currentName)
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
