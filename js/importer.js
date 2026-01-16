export function importNewRecruit(json) {
  const models = [];

  const forces = json.roster?.forces;
  if (!forces) return models;

  forces.forEach(force => {
    force.selections?.forEach(sel => walk(sel));
  });

  function walk(sel) {
    // Blacklist – metadata vi ALDRIG vill visa
    const hiddenNames = [
      "Battle Size",
      "Detachment",
      "Show/Hide Options",
      "Legends are visible",
      "Unaligned Forces are visible",
      "Unaligned Fortifications are visible",
      "Warlord"
    ];

    const isHidden = hiddenNames.includes(sel.name);

    // Visa ALLT som har count > 0 och inte är blacklistat
    if (!isHidden && typeof sel.count === "number" && sel.count > 0) {
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

    // Gå alltid djupare
    if (Array.isArray(sel.selections)) {
      sel.selections.forEach(child => walk(child));
    }
  }

  return models;
}
