export function importNewRecruit(json) {
  const models = [];

  // New Recruit kan vara:
  // { roster: { forces: [...] } }
  // eller { forces: [...] }

  const forces =
    json.forces ||
    json.roster?.forces;

  if (!forces) {
    console.error("HITTAR INGA FORCES I JSON", json);
    return models;
  }

  forces.forEach(force => {
    force.selections?.forEach(sel => {
      if (!sel.models) return;

      sel.models.forEach(model => {
        models.push({
          name: sel.name,
          base: model.base || sel.base || "32mm",
          x: null,
          y: null
        });
      });
    });
  });

  return models;
}
