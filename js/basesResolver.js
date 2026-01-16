let BASES = null;

/**
 * Laddar bases.json en gång
 */
export async function loadBases() {
  const res = await fetch("bases.json");
  BASES = await res.json();
}

/**
 * Försöker hitta basstorlek för ett unit-namn
 */
export function resolveBase(unitName) {
  if (!BASES) return null;

  const name = unitName.toLowerCase();

  for (const base in BASES) {
    if (BASES[base].some(n => name.includes(n))) {
      return base;
    }
  }

  return null;
}

