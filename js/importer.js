export function importNewRecruit(json) {
  const models = [];

  const forces = json.roster?.forces;
  if (!forces) return models;

  forces.forEach(force => {
    force.selections?.forEach(sel => walk(sel));
  });

  function walk(sel, parentName = null) {
    // OM denna selection har count → detta är EN MODELL
    if (typeof sel.count === "number" && sel.count > 0) {
      const name = parentName || sel.name;
      const base = sel.base || "32mm";

      for (let i = 0; i < sel.count; i++) {
        models.push({
          name,
          base,
          x: null,
          y: null
        });
      }
    }

    // Gå alltid neråt, och skicka med parent-namn
    if (Array.isArray(sel.selections)) {
      sel.selections.forEach(child =>
        walk(child, sel.name)
      );
    }
  }

  return models;
}
