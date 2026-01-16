import { resolveBase } from "./baseResolver.js";

export function importNewRecruit(json) {
  const models = [];

  const forces = json.roster?.forces;
  if (!forces) return models;

  forces.forEach(force => {
    force.selections?.forEach(sel => walk(sel));
  });

  function walk(sel) {
    // ✅ skapa modeller endast på "leaf nodes" med number
    if (
      typeof sel.number === "number" &&
      sel.number > 0 &&
      !hasNumberChildren(sel)
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
    sel.selections.forEach(child => walk(child));
  }

  return models;
}

function hasNumberChildren(sel) {
  if (!Array.isArray(sel.selections)) return false;
  return sel.selections.some(
    c => typeof c.number === "number" && c.number > 0
  );
}

function normalizeName(name) {
  return name
    .replace(/\s*\(.*\)$/g, "")
    .replace(/\s*–.*$/g, "")
    .trim()
    .toLowerCase();
}
