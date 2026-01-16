export function importNewRecruit(json) {
  const models = [];

  const forces =
    json.forces ||
    json.roster?.forces;

  if (!forces) {
    console.error("HITTAR INGA FORCES", json);
    return models;
  }

  forces.forEach(force => {
    force.selections?.forEach(sel => {
      walkSelection(sel);
    });
  });

  function walkSelection(sel) {
    // Om selection innehåller modeller → skapa baser
    if (sel.models && sel.models.length > 0) {
      sel.models.forEach(model => {
        models.push({
          name: sel.name,
          base: model.base || sel.base || "32mm",
          x: null,
          y: null
        });
      });
    }

    // Rekursivt: vissa units har selections i selections
    if (sel.selections) {
      sel.selections.forEach(child => walkSelection(child));
    }
  }

  return models;
}
