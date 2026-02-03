export async function loadTerrain(id) {
  const res = await fetch(`terrain/${id}.json`);

  if (!res.ok) {
    throw new Error(`Failed to load terrain: ${id}`);
  }

  const data = await res.json();
  return normalizeTerrainData(data);
}

export function parseTerrainInput(raw) {
  const data = coerceToJson(raw);
  return normalizeTerrainData(data);
}

function coerceToJson(raw) {
  if (typeof raw !== "string") return raw;

  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error("Terrain input is empty.");
  }

  try {
    return JSON.parse(trimmed);
  } catch (error) {
    const candidate = extractJson(trimmed);
    if (!candidate) {
      throw new Error("Terrain input does not contain valid JSON.");
    }
    return JSON.parse(candidate);
  }
}

function extractJson(text) {
  const firstObj = text.indexOf("{");
  const firstArr = text.indexOf("[");

  if (firstObj === -1 && firstArr === -1) return null;

  const useArray = firstArr !== -1 && (firstObj === -1 || firstArr < firstObj);
  const start = useArray ? firstArr : firstObj;
  const endChar = useArray ? "]" : "}";
  const end = text.lastIndexOf(endChar);

  if (end <= start) return null;

  return text.slice(start, end + 1);
}

function normalizeTerrainData(data) {
  if (Array.isArray(data)) {
    return { pieces: data };
  }

  if (data && Array.isArray(data.pieces)) {
    return { ...data, pieces: data.pieces };
  }

  if (data && Array.isArray(data.terrain)) {
    return { pieces: data.terrain };
  }

  if (data && Array.isArray(data.items)) {
    return { pieces: data.items };
  }

  throw new Error("Unsupported terrain format.");
}
