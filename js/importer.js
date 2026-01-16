export function importNewRecruit(json) {
  const models = [];

  const forces = json.roster?.forces;
  if (!forces) return models;

  forces.forEach(force => {
    force.selections?.forEach(sel => walk(sel));
  });

  function walk(sel) {
    // 1. Om detta selection-steg HAR count → det är en unit
    if (typeof sel.count === "number" && sel.count > 0) {
      const base = sel.base || "32mm";

      for (let i = 0; i < sel.count; i++) {
        models.push({
          name: sel.name,
          base,
          x: null,
          y: null
        });
      }
    }

    // 2. Gå ALLTID djupare
    if (Array.isArray(sel.selections)) {
      sel.selections.forEach(child => walk(child));
    }
  }

  return models;
}
