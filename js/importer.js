export function importNewRecruit(json) {
  const models = [];

  const forces = json.roster?.forces;
  if (!forces) return models;

  forces.forEach(force => {
    force.selections?.forEach(sel => walk(sel));
  });

  function walk(sel) {
    const hasUnitProfile =
      Array.isArray(sel.profiles) &&
      sel.profiles.some(p => p.typeName === "Unit");

    const isModel =
      typeof sel.count === "number" &&
      sel.count > 0 &&
      hasUnitProfile;

    if (isModel) {
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

    if (Array.isArray(sel.selections)) {
      sel.selections.forEach(child => walk(child));
    }
  }

  return models;
}
