import { resolveBase } from "./baseResolver.js";

export function importNewRecruit(json) {
  const models = [];
  const seen = new Set(); // stoppar dubbletter per unit-namn

  const forces = json.roster?.forces;
  if (!forces) return models;

  forces.forEach(force => {
    force.selections?.forEach(sel => walk(sel));
  });

  function walk(sel) {
    // FALL 1: platta models (HQ / Character / Swarm utan wrapper)
    if (sel.type === "model" && typeof sel.number === "number") {
      const name = normalizeName(sel.name);
      if (!seen.has(name)) {
        seen.add(name);
        spawn(name, sel.number);
      }
      return;
    }

    // FALL 2: units (Battleline, Monster, Vehicle, Infantry)
    if (sel.type === "unit") {
      const name = normalizeName(sel.name);
      if (seen.has(name)) return;

      const modelChildren =
        sel.selections?.filter(
          s => s.type === "model" && typeof s.number === "number"
        ) ?? [];

      seen.add(name);

      // Battleline / Infantry: antal på model-children
      if (modelChildren.length > 0) {
        const total = modelChildren.reduce((sum, m) => sum + m.number, 0);
        spawn(name, total);
      }
      // Monster / Vehicle / single-model units: antal på unit
      else if (typeof sel.number === "number") {
        spawn(name, sel.number);
      }

      return;
    }

    // annars: fortsätt leta djupare
    if (!Array.isArray(sel.selections)) return;
    sel.selections.forEach(walk);
  }

  function spawn(name, count) {
    const base = resolveBase(name); // ENDA bas-källan
    for (let i = 0; i < count; i++) {
      models.push({
        name,
        base, // kan vara null
        x: null,
        y: null
      });
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
