// Steg 2B – basstorlek från profiles + säkra standard-overrides
// Importer ska ENDAST skapa modeller + basdata. Ingen UI-logik här.

const BASE_OVERRIDES = {
  "The Swarmlord": "60mm",
  "Swarmlord": "60mm",
  "Carnifex": "60mm",
  "Carnifexes": "60mm",
  "Ripper Swarm": "40mm",
  "Ripper Swarms": "40mm"
};

export function importNewRecruit(json) {
  const models = [];

  const forces = json.roster?.forces;
  if (!forces) return models;

  forces.forEach(force => {
    force.selections?.forEach(sel => walk(sel));
  });

  function walk(sel) {
    if (!Array.isArray(sel.selections)) return;

    sel.selections.forEach(child => {
      // BattleScribe använder "number" för antal
      if (typeof child.number === "number" && child.number > 0) {
        const unitName = normalizeName(sel.name);

        const base =
          BASE_OVERRIDES[unitName] ||
          readBaseFromProfiles(child) ||
          readBaseFromProfiles(sel) ||
          "32mm";

        for (let i = 0; i < child.number; i++) {
          models.push({
            name: unitName,
            base,       // ex: "32mm", "40mm", "60mm", "60x35"
            x: null,
            y: null
          });
        }
      }

      // fortsätt alltid neråt
      walk(child);
    });
  }

  return models;
}

/* ---------------- helpers ---------------- */

function normalizeName(name) {
  return name
    .replace(/\s*\(.*\)$/g, "") // ta bort "(x models)"
    .trim();
}

function readBaseFromProfiles(sel) {
  if (!Array.isArray(sel.profiles)) return null;

  for (const profile of sel.profiles) {
    if (!Array.isArray(profile.characteristics)) continue;

    for (const c of profile.characteristics) {
      if (!c.name) continue;

      const key = c.name.toLowerCase();
      const val = String(c.value || "").toLowerCase();

      if (key.includes("base")) {
        // oval
        if (val.includes("x")) {
          return val.replace("mm", "").trim(); // "60x35"
        }

        // rund
        if (val.includes("mm")) {
          return val.replace(" ", ""); // "32mm"
        }
      }
    }
  }

  return null;
}
