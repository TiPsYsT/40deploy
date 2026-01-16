export function importNewRecruit(json) {
  const models = [];

  const forces = json.roster?.forces;
  if (!forces) return models;

  forces.forEach(force => {
    force.selections?.forEach(sel => walk(sel));
  });

  function walk(sel) {
    const count = sel.count || sel.number || 0;
    const base = sel.base || guessBase(sel.name);

    // skapa modeller från count
    for (let i = 0; i < count; i++) {
      models.push({
        name: sel.name,
        base,
        x: null,
        y: null
      });
    }

    // gå djupare
    sel.selections?.forEach(child => walk(child));
  }

  return models;
}

/**
 * TEMP fallback tills vi läser bas från profiles (steg 2)
 * Ingen faction-logik, bara säker default
 */
function guessBase(name) {
  return "32mm";
}
