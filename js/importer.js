export function importNewRecruit(json) {
  const models = [];

  // New Recruit: forces -> selections
  json.forces.forEach(force => {
    force.selections.forEach(sel => {
      if (!sel.models) return;

      sel.models.forEach(model => {
        models.push({
          name: sel.name,
          base: model.base || "32mm",
          x: null,
          y: null
        });
      });
    });
  });

  return models;
}
