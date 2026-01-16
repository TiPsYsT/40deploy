export function importNewRecruit(json) {
  const models = [];

  const forces = json.roster?.forces;
  if (!forces) return models;

  console.log("IMPORTER START");

  forces.forEach(force => {
    force.selections?.forEach(sel => walk(sel, 0));
  });

  function walk(sel, depth) {
    const indent = "  ".repeat(depth);

    console.log(
      indent + "SELECTION:",
      sel.name,
      {
        count: sel.count,
        number: sel.number,
        hasProfiles: Array.isArray(sel.profiles),
        hasCosts: Array.isArray(sel.costs),
        hasSelections: Array.isArray(sel.selections),
      }
    );

    if (Array.isArray(sel.selections)) {
      sel.selections.forEach(child => walk(child, depth + 1));
    }
  }

  console.log("IMPORTER END");
  return models;
}
