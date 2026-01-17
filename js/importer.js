import { resolveBase } from "./baseResolver.js";

export function importNewRecruit(json) {
  const models = [];

  const forces = json.roster?.forces;
  if (!forces) return models;

  forces.forEach(force => {
    force.selections?.forEach(sel => walk(sel));
  });

  function walk(sel) {
    // FALL C: HQ / Character som ligger direkt som model
    if (sel.type === "model" && typeof sel.number === "number") {
      const name = normalizeName(sel.name);
      const base = resolveBase(name);
      if (base) {
        for (let i = 0; i < sel.number; i++) {
          models.push({ name, base, x: null, y: null });
        }
      }
      return; // ⛔ stoppa rekursion här
    }

    // FALL A + B: units (Battleline, Monster, osv)
    if (sel.type === "unit") {
      const unitName = normalizeName(sel.name);
      const base = resolveBase(unitName);
      if (!base) return;

      const modelChildren =
        sel.selections?.filter(
          s => s.type === "model" && typeof s.number === "number"
        ) ?? [];

      // Battleline / Infantry
      if (modelChildren.length > 0) {
        modelChildren.forEach(m => {
          for (let i = 0; i < m.number; i++) {
            models.push({ name: unitName, base, x: null, y: null });
          }
        });
      }
      // Monster / Vehicle / Swarm
      else if (typeof sel.number === "number") {
        for (let i = 0; i < sel.number; i++) {
          models.push({ name: unitName, base, x: null, y: null });
        }
      }

      return; // ⛔ VIKTIGT: räkna unit EN gång
    }

    // annars: fortsätt söka
    if (!Array.isArray(sel.selections)) return;
    sel.selections.forEach(walk);
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
