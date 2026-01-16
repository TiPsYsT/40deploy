import { resolveBase } from "./baseResolver.js";

export function importNewRecruit(json) {
  const models = [];

  const forces = json.roster?.forces;
  if (!forces) return models;

  forces.forEach(force => {
    force.selections?.forEach(sel => walk(sel));
  });

  function walk(sel) {
    // ✅ skapa modeller ENDAST från selectionens egna number
    if (typeof sel.number === "number" && sel.number > 0) {
      const name = normalizeName(sel.name);
      const base = resolveBase(name); // enda källan

      for (let i = 0; i < sel.number; i++) {
        models.push({
          name,
          base, // kan vara null
          x: null,
          y: null
        });
      }
    }

    // fortsätt gå ner i trädet
    if (!Array.isArray(sel.selections)) return;
    sel.selections.forEach(child => walk(child));
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
