export function importNewRecruit(json) {
  const models = [];

  const forces = json.roster?.forces;
  if (!forces) return models;

  forces.forEach(force => {
    force.selections?.forEach(sel => walk(sel));
  });

  function walk(sel) {
    // number = antal i din JSON
    if (typeof sel.number === "number" && sel.number > 0) {
      const base = sel.base || "32mm";

      for (let i = 0; i < sel.number; i++) {
        models.push({
          name: sel.name,
          base,
          x: null,
          y: null
        });
      }
    }

    if (Array.isArray(sel.selections)) {
      sel.selections.forEach(child => walk(child));
    }
  }

  return models;
}
