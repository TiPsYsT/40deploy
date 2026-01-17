import { resolveBase } from "./baseResolver.js";

export function importNewRecruit(json) {
  const models = [];
  const seen = new Set(); // 🔑 stoppar dubbletter

  const forces = json.roster?.forces;
  if (!forces) return models;

  forces.forEach(force => {
    force.selections?.forEach(sel => walk(sel));
  });

  function walk(sel) {
    // FALL 1: platt HQ / Swarm / Character (type:model)
    if (sel.type === "model" && typeof sel.number === "number") {
      const name = normalizeName(sel.name);
      if (!seen.has(name)) {
        seen.add(name);
        spawn(name, sel.number);
      }
      return;
    }

    // FALL 2: unit (Battleline, Monster, osv)
    if (sel.type === "unit") {
      const name = normalizeName(sel.name);
      if (seen.has(name)) return;

      const modelChildren =
        sel.selections?.filter(
          s => s.type === "model" && typeof s.number === "number"
        ) ?? [];

      seen.add(name);

      if (modelChildren.length > 0) {
        const total = modelChildren.reduce((a, m) => a + m.number, 0);
        spawn(name, total);
      } else if (typeof sel.number === "number") {
        spawn(name, sel.number);
      }

      return;
    }

    if (!Array.isArray(sel.selections)) return;
    sel.selections.forEach(walk);
  }

  function spawn(name, count) {
    const base = resolveBase(name);
    if (!base) return;

    for (let i = 0; i < count; i++) {
      models.push({ name, base, x: null, y: null });
    }
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
