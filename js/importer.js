export function importNewRecruit(json) {
  const models = [];

  const forces = json.roster?.forces;
  if (!forces) return models;

  forces.forEach(force => {
    force.selections?.forEach(sel => walk(sel));
  });

  function walk(sel) {
    // Om denna selection har child-selections med count → detta är en unit
    if (Array.isArray(sel.selections)) {
      sel.selections.forEach(child => {
        if (typeof child.count === "number" && child.count > 0) {
          const base = sel.base || "32mm";

          for (let i = 0; i < child.count; i++) {
            models.push({
              name: sel.name,   // parent = unit-namn
              base,
              x: null,
              y: null
            });
          }
        }
      });
    }

    // fortsätt alltid neråt
    if (Array.isArray(sel.selections)) {
      sel.selections.forEach(child => walk(child));
    }
  }

  return models;
}
