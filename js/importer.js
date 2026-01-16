import { resolveBase } from "./baseResolver.js";

export function importNewRecruit(json) {
  const models = [];

  const forces = json.roster?.forces;
  if (!forces) return models;

  forces.forEach(force => {
    force.selections?.forEach(sel => walk(sel));
  });

  function walk(sel) {
    if (!Array.isArray(sel.selections)) return;

    sel.selections.forEach(child => {
      if (typeof child.number === "number" && child.number > 0) {
        const name = normalizeName(sel.name);
        const base = resolveBase(name); // 🔑 ENDA källan

        for (let i = 0; i < child.number; i++) {
          models.push({
            name,
            base, // kan vara null
            x: null,
            y: null
          });
        }
      }

      walk(child);
    });
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
