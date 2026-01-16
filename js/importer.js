export function importNewRecruit(json) {
  const models = [];

  const forces = json.roster?.forces;
  if (!forces) return models;

  forces.forEach(force => {
    force.selections?.forEach(sel => walk(sel));
  });

  function walk(sel) {
    if (Array.isArray(sel.selections)) {
      sel.selections.forEach(child => {
        if (typeof child.number === "number" && child.number > 0) {
          const base = readBaseFromProfiles(child) || readBaseFromProfiles(sel) || "32mm";

          for (let i = 0; i < child.number; i++) {
            models.push({
              name: sel.name,
              base,       // ex: "32mm" eller "60x35"
              x: null,
              y: null
            });
          }
        }
      });

      sel.selections.forEach(child => walk(child));
    }
  }

  return models;
}

/**
 * Läser basstorlek från profiles.characteristics
 * Returnerar t.ex: "32mm", "40mm", "60x35"
 */
function readBaseFromProfiles(sel) {
  if (!Array.isArray(sel.profiles)) return null;

  for (const profile of sel.profiles) {
    if (!Array.isArray(profile.characteristics)) continue;

    for (const c of profile.characteristics) {
      if (!c.name) continue;

      const name = c.name.toLowerCase();
      const value = String(c.value || "").toLowerCase();

      if (name.includes("base")) {
        // normalisera värden
        if (value.includes("x")) {
          // oval
          return value.replace("mm", "").trim();
        }

        if (value.includes("mm")) {
          return value.replace(" ", "");
        }
      }
    }
  }

  return null;
}
