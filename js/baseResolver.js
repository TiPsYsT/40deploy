let BASES = null;

export async function loadBases() {
  const res = await fetch("./bases.json");
  BASES = await res.json();
}

export function resolveBase(unitName) {
  if (!BASES) return null;

  const name = unitName.toLowerCase();

  for (const base in BASES) {
    for (const entry of BASES[base]) {
      if (name.includes(entry)) {
        return base;
      }
    }
  }

  return null;
}
