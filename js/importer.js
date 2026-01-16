export function importNewRecruit(json) {
  const models = [];

  json.units.forEach(unit => {
    for (let i = 0; i < unit.count; i++) {
      models.push({
        name: unit.name,
        base: unit.base, // ex: "25mm" eller "60x35mm"
        x: null,
        y: null
      });
    }
  });

  return models;
}
