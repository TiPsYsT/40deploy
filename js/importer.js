export function importNewRecruit(json) {
  const models = [];

  const forces = json.roster?.forces;
  if (!forces) return models;

  forces.forEach(force => {
    force.selections?.forEach(sel => walk(sel));
  });

  function walk(sel) {
    // Om denna selection har barn med number → barnen är modeller
    if (Array.isArray(sel.selections)) {
      sel.selections.forEach(child => {
        if (typeof child.number === "number" && child.number > 0) {
          const base = child.base || sel.base || "32mm";

          for (let i = 0; i < child.number; i++) {
            models.push({
              name: sel.name,   // parent = unit-namn
              base,
              x: null,
              y: null
            });
          }
        }
      });

      // fortsätt gå djupare
      sel.selections.forEach(child => walk(child));
    }
  }

  return models;
}
